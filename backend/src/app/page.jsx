export default function Home() {
  return (
    <main style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <h1>Backend VainyBliss funcionando</h1>
      <p>Usa las siguientes rutas para probar tu API:</p>

      <ul>
        <li>GET /api/products - lista todos los productos</li>
        <li>POST /api/products - crea un producto</li>
        <li>GET /api/inventory - lista inventario</li>
        <li>POST /api/inventory - crea inventario</li>
      </ul>

      <p>Prueba con Postman o desde tu frontend.</p>
    </main>
  );
}


