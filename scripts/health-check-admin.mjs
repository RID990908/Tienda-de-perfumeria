#!/usr/bin/env node

const DEFAULT_FRONTEND = "http://localhost:3000";
const DEFAULT_BACKEND = "http://localhost:3001";

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const [rawKey, inlineValue] = token.slice(2).split("=", 2);
    const key = rawKey.trim();
    if (!key) continue;

    if (inlineValue !== undefined) {
      out[key] = inlineValue;
      continue;
    }

    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
      continue;
    }

    out[key] = next;
    i += 1;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

if (args.help || args.h) {
  console.log(`Uso:
  node scripts/health-check-admin.mjs --email admin@vainybliss.com --password "tu_password"

Opciones:
  --frontend  URL del frontend (default: ${DEFAULT_FRONTEND})
  --backend   URL del backend  (default: ${DEFAULT_BACKEND})
  --email     Email admin (o env ADMIN_EMAIL)
  --password  Password admin (o env ADMIN_PASSWORD)
  --strict    Falla si /admin/products no contiene markup del panel
`);
  process.exit(0);
}

const frontendBase = String(
  args.frontend || process.env.FRONTEND_URL || DEFAULT_FRONTEND,
).replace(/\/+$/, "");
const backendBase = String(
  args.backend || process.env.BACKEND_URL || DEFAULT_BACKEND,
).replace(/\/+$/, "");
const adminEmail = args.email || process.env.ADMIN_EMAIL || "";
const adminPassword = args.password || process.env.ADMIN_PASSWORD || "";
const strictMode = Boolean(args.strict);

const failures = [];
let checks = 0;

function ok(name, detail = "") {
  checks += 1;
  console.log(`PASS ${name}${detail ? ` -> ${detail}` : ""}`);
}

function fail(name, detail = "") {
  checks += 1;
  failures.push({ name, detail });
  console.error(`FAIL ${name}${detail ? ` -> ${detail}` : ""}`);
}

async function safeFetch(url, init = {}) {
  try {
    const response = await fetch(url, init);
    const text = await response.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    return { response, text, json };
  } catch (error) {
    return { response: null, text: "", json: null, error };
  }
}

function getSetCookieHeader(response) {
  if (!response) return "";
  if (typeof response.headers.getSetCookie === "function") {
    const cookies = response.headers.getSetCookie();
    if (cookies && cookies.length > 0) {
      return cookies.join("; ");
    }
  }
  return response.headers.get("set-cookie") || "";
}

function toCookieHeader(setCookieHeader) {
  if (!setCookieHeader) return "";
  return setCookieHeader
    .split(/,(?=[^;]+=[^;]+)/g)
    .map((part) => part.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

function assertStatus(name, result, expectedStatus) {
  if (!result.response) {
    fail(name, `sin respuesta (${result.error?.message || "error desconocido"})`);
    return false;
  }

  if (result.response.status !== expectedStatus) {
    const bodyMsg = result.json?.error?.message || result.text?.slice(0, 160) || "";
    fail(name, `status ${result.response.status}, esperado ${expectedStatus}${bodyMsg ? `, body: ${bodyMsg}` : ""}`);
    return false;
  }

  ok(name, `status ${expectedStatus}`);
  return true;
}

async function run() {
  console.log(`Frontend: ${frontendBase}`);
  console.log(`Backend:  ${backendBase}`);

  const loginPage = await safeFetch(`${frontendBase}/admin/login`);
  assertStatus("frontend /admin/login", loginPage, 200);

  const productsPage = await safeFetch(`${frontendBase}/admin/products`);
  if (assertStatus("frontend /admin/products", productsPage, 200) && strictMode) {
    const hasPanelMarker =
      productsPage.text.includes("Cargando panel de administraci") ||
      productsPage.text.includes("Panel de control") ||
      productsPage.text.includes("Productos");
    if (hasPanelMarker) {
      ok("frontend /admin/products markup", "panel marker detectado");
    } else {
      fail("frontend /admin/products markup", "no se detecto markup esperado");
    }
  }

  const backendMeWithoutCookie = await safeFetch(`${backendBase}/api/admin/auth/me`);
  assertStatus("backend /api/admin/auth/me sin cookie", backendMeWithoutCookie, 401);

  const frontendMeWithoutCookie = await safeFetch(`${frontendBase}/api/admin/auth/me`);
  assertStatus("frontend proxy /api/admin/auth/me sin cookie", frontendMeWithoutCookie, 401);

  if (!adminEmail || !adminPassword) {
    fail(
      "login admin",
      "faltan credenciales. Usa --email/--password o ADMIN_EMAIL/ADMIN_PASSWORD",
    );
    summarizeAndExit();
    return;
  }

  const login = await safeFetch(`${backendBase}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: String(adminEmail), password: String(adminPassword) }),
  });

  if (!assertStatus("backend login admin", login, 200)) {
    summarizeAndExit();
    return;
  }

  const setCookie = getSetCookieHeader(login.response);
  const cookieHeader = toCookieHeader(setCookie);
  if (!cookieHeader) {
    fail("backend login cookie", "no se recibio cookie de sesion");
    summarizeAndExit();
    return;
  }
  ok("backend login cookie", cookieHeader);

  const meWithCookie = await safeFetch(`${backendBase}/api/admin/auth/me`, {
    headers: { Cookie: cookieHeader },
  });
  if (!assertStatus("backend /api/admin/auth/me con cookie", meWithCookie, 200)) {
    summarizeAndExit();
    return;
  }

  const userRole = meWithCookie.json?.data?.user?.role;
  if (userRole === "admin") {
    ok("backend session role", "admin");
  } else {
    fail("backend session role", `rol inesperado: ${String(userRole)}`);
  }

  const products = await safeFetch(`${backendBase}/api/admin/products`, {
    headers: { Cookie: cookieHeader },
  });
  if (assertStatus("backend /api/admin/products con cookie", products, 200)) {
    const isArray = Array.isArray(products.json?.data);
    if (isArray) {
      ok("backend productos payload", `${products.json.data.length} items`);
    } else {
      fail("backend productos payload", "data no es un arreglo");
    }
  }

  const meViaFrontendProxy = await safeFetch(`${frontendBase}/api/admin/auth/me`, {
    headers: { Cookie: cookieHeader },
  });
  assertStatus("frontend proxy /api/admin/auth/me con cookie", meViaFrontendProxy, 200);

  const logout = await safeFetch(`${backendBase}/api/admin/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookieHeader },
  });
  assertStatus("backend logout", logout, 200);

  const meAfterLogout = await safeFetch(`${backendBase}/api/admin/auth/me`, {
    headers: { Cookie: cookieHeader },
  });
  assertStatus("backend /api/admin/auth/me tras logout", meAfterLogout, 401);

  summarizeAndExit();
}

function summarizeAndExit() {
  console.log("");
  console.log(`Checks ejecutados: ${checks}`);
  if (failures.length === 0) {
    console.log("RESULTADO: OK");
    process.exit(0);
  }

  console.error(`RESULTADO: FAIL (${failures.length})`);
  for (const item of failures) {
    console.error(` - ${item.name}${item.detail ? `: ${item.detail}` : ""}`);
  }
  process.exit(1);
}

run().catch((error) => {
  console.error("Error inesperado en health-check:", error);
  process.exit(1);
});
