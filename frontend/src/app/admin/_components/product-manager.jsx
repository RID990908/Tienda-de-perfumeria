"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import { ApiRequestError } from "../_lib/api";
import {
  createProduct,
  deleteProduct,
  listProducts,
  resolveProductImage,
  updateProduct,
  uploadProductImage,
} from "../_lib/product-service";

const EMPTY_FORM = {
  nombre: "",
  categoria: "",
  precio: "",
  descripcion: "",
  cantidad: "",
  imagen: "",
  activo: true,
};

function filterNombre(val) {
  return String(val).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]/g, "");
}

function filterCategoria(val) {
  return String(val).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]/g, "");
}

function filterPrecio(val) {
  const s = String(val).replace(/[^\d.]/g, "");
  const parts = s.split(".");
  if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
  return s;
}

function filterCantidad(val) {
  return String(val).replace(/\D/g, "");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function ProductManager() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [createMode, setCreateMode] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const isEditing = selectedProduct !== null;
  const modalOpen = isEditing || createMode;

  async function fetchProducts() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar productos");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return products;
    return products.filter((p) => 
      p.nombre.toLowerCase().includes(query) || 
      p.categoria.toLowerCase().includes(query)
    );
  }, [products, searchTerm]);

  function resetEditor(opts = {}) {
    setSelectedProduct(null);
    setCreateMode(false);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    if (!opts.keepFeedback) setFeedback(null);
    setError(null);
  }

  function openCreateModal() {
    setCreateMode(true);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFeedback(null);
    setError(null);
  }

  function startEdit(product) {
    setCreateMode(false);
    setSelectedProduct(product);
    setForm({
      nombre: product.nombre ?? "",
      categoria: product.categoria ?? "",
      precio: product.precio != null ? String(product.precio) : "",
      descripcion: product.descripcion ?? "",
      cantidad: product.cantidad != null ? String(product.cantidad) : "",
      imagen: product.imagen ?? "",
      activo: product.activo ?? true,
    });
    setFieldErrors({});
    setFeedback(null);
    setError(null);
  }

  function setFormValue(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function buildPayload() {
    const precio = Number(form.precio) || 0;
    const cantidad = Math.floor(Number(form.cantidad)) || 0;
    return {
      nombre: String(form.nombre).trim(),
      categoria: String(form.categoria).trim(),
      precio,
      cantidad,
      descripcion: String(form.descripcion ?? "").trim(),
      imagen: form.imagen || "",
      activo: Boolean(form.activo),
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setFieldErrors({});

    const payload = buildPayload();

    try {
      if (isEditing) {
        const updated = await updateProduct(selectedProduct.id, payload);
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        setFeedback("Producto actualizado con éxito");
        resetEditor({ keepFeedback: true });
      } else {
        const created = await createProduct(payload);
        setProducts(prev => [created, ...prev]);
        setFeedback("Producto creado con éxito");
        resetEditor({ keepFeedback: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      setError(msg);
      if (err instanceof ApiRequestError && err.status === 400 && err.data?.error?.details) {
        const map = {};
        for (const d of err.data.error.details) {
          map[d.field] = d.message;
        }
        setFieldErrors(map);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`¿Estás seguro de eliminar "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      if (selectedProduct?.id === id) resetEditor();
      setFeedback("Producto eliminado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadProductImage(file);
      setFormValue("imagen", res.path);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Error al subir imagen",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen relative font-sans text-[#3c312d]">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/fondo-vainybliss.jpg')" }}
        aria-hidden
      />
      <div className="fixed inset-0 -z-10 bg-[rgba(253,250,247,0.36)] backdrop-blur-[2px]" aria-hidden />
      
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 md:px-8 mt-4 animate-in fade-in duration-700">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-semibold text-[#1a1b18] tracking-tight truncate drop-shadow-sm">
              <span className="font-[Cormorant] italic font-medium mr-2">Vainy Bliss -</span> Panel de Control de Productos
            </h1>
          </div>
        </header>

        <section className="bg-[rgba(247,243,235,0.7)] backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(20,40,20,0.08)]">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <button
              type="button"
              onClick={openCreateModal}
              className="bg-[#1a4731] text-white px-8 py-3 rounded-full font-medium shadow-md hover:bg-[#123624] transition-colors shrink-0"
            >
              Crear Nuevo Producto
            </button>
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Buscar producto..."
                className="w-full bg-white/70 border border-white/80 rounded-full px-5 py-2.5 pl-11 focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 transition-all font-medium text-sm text-[#3c312d] shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7c74]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[rgba(177,146,113,0.2)] shadow-sm">
            <table className="w-full text-left min-w-[800px] border-collapse">
              <thead className="bg-[#1a4731] text-white text-sm font-medium">
                <tr>
                  <th className="px-5 py-4 font-medium">ID</th>
                  <th className="px-5 py-4 font-medium">Imagen</th>
                  <th className="px-5 py-4 font-medium">Nombre</th>
                  <th className="px-5 py-4 font-medium whitespace-nowrap">Categoría</th>
                  <th className="px-5 py-4 font-medium whitespace-nowrap">Precio</th>
                  <th className="px-5 py-4 font-medium whitespace-nowrap">Stock</th>
                  <th className="px-5 py-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(177,146,113,0.15)] bg-white/60 backdrop-blur-md">
                {isLoading ? (
                  <tr><td colSpan="8" className="px-6 py-12 text-center text-[#8a7c74] font-medium animate-pulse">Cargando inventario...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan="8" className="px-6 py-12 text-center text-[#8a7c74] font-medium">No hay productos que coincidan con la búsqueda.</td></tr>
                ) : filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-[rgba(247,243,235,0.9)] transition-colors group">
                    <td className="px-5 py-4 text-sm text-[#3c312d]">{p.id}</td>
                    <td className="px-5 py-4">
                      <img src={resolveProductImage(p.imagen)} alt="" className="w-14 h-14 rounded-xl object-cover bg-white shadow-sm" />
                    </td>
                    <td className="px-5 py-4 font-medium text-[#3c312d] text-sm">{p.nombre}</td>
                    <td className="px-5 py-4 font-medium text-sm text-[#3c312d]">{p.categoria}</td>
                    <td className="px-5 py-4 font-medium text-sm text-[#3c312d]">{formatCurrency(p.precio)}</td>
                    <td className="px-5 py-4 text-sm text-[#3c312d]">{p.cantidad}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button type="button" onClick={() => startEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-full border border-[#8d5757]/40 bg-transparent hover:bg-[#8d5757]/10 text-[#8d5757] transition-all" title="Editar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        </button>
                        <button type="button" onClick={() => handleDelete(p.id, p.nombre)} className="w-8 h-8 flex items-center justify-center rounded-full border border-[#8d5757]/40 bg-transparent hover:bg-[#8d5757]/10 text-[#8d5757] transition-all" title="Eliminar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {feedback && (
          <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-2xl bg-green-100 text-green-800 text-sm font-bold shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            {feedback}
          </div>
        )}

        {error && !modalOpen && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-red-100 text-red-800 text-sm font-bold shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && resetEditor()}>
            <div
              className="relative w-full max-w-[420px] bg-[#fbf9f4]/90 backdrop-blur-3xl border border-white/60 rounded-[2rem] shadow-2xl p-6 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-semibold text-[#3c312d] flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-[#1a4731]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  Crear o Editar Producto
                </h3>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8a7c74]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
              </div>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => setFormValue("nombre", filterNombre(e.target.value))}
                placeholder="Nombre de producto"
                className="w-full rounded-full bg-[rgba(255,255,255,0.7)] border border-white/80 shadow-inner px-4 py-3 pl-10 focus:ring-2 focus:ring-[#1a4731]/30 transition-all font-medium text-sm text-[#3c312d] outline-none"
              />
              {fieldErrors.nombre && <p className="text-xs text-red-500 mt-1 pl-4">{fieldErrors.nombre}</p>}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8a7c74]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
              </div>
              <input
                type="text"
                required
                value={form.categoria}
                onChange={(e) => setFormValue("categoria", filterCategoria(e.target.value))}
                placeholder="Categoría"
                className="w-full rounded-full bg-[rgba(255,255,255,0.7)] border border-white/80 shadow-inner px-4 py-3 pl-10 focus:ring-2 focus:ring-[#1a4731]/30 transition-all font-medium text-sm text-[#3c312d] outline-none"
              />
              {fieldErrors.categoria && <p className="text-xs text-red-500 mt-1 pl-4">{fieldErrors.categoria}</p>}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8a7c74]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <input
                type="text"
                inputMode="decimal"
                required
                value={form.precio}
                onChange={(e) => setFormValue("precio", filterPrecio(e.target.value))}
                placeholder="Precio"
                className="w-full rounded-full bg-[rgba(255,255,255,0.7)] border border-white/80 shadow-inner px-4 py-3 pl-10 focus:ring-2 focus:ring-[#1a4731]/30 transition-all font-medium text-sm text-[#3c312d] outline-none"
              />
              {fieldErrors.precio && <p className="text-xs text-red-500 mt-1 pl-4">{fieldErrors.precio}</p>}
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8a7c74]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
              </div>
              <input
                type="text"
                inputMode="numeric"
                required
                value={form.cantidad}
                onChange={(e) => setFormValue("cantidad", filterCantidad(e.target.value))}
                placeholder="Stock"
                className="w-full rounded-full bg-[rgba(255,255,255,0.7)] border border-white/80 shadow-inner px-4 py-3 pl-10 focus:ring-2 focus:ring-[#1a4731]/30 transition-all font-medium text-sm text-[#3c312d] outline-none"
              />
              {fieldErrors.cantidad && <p className="text-xs text-red-500 mt-1 pl-4">{fieldErrors.cantidad}</p>}
            </div>

            <div className="relative">
              <textarea
                value={form.descripcion}
                onChange={(e) => setFormValue("descripcion", e.target.value)}
                placeholder="Descripción"
                rows={3}
                className="w-full rounded-[1.5rem] bg-[rgba(255,255,255,0.7)] border border-white/80 shadow-inner px-4 py-3 focus:ring-2 focus:ring-[#1a4731]/30 transition-all font-medium text-sm text-[#3c312d] resize-none outline-none"
              />
              {fieldErrors.descripcion && <p className="text-xs text-red-500 mt-1 pl-4">{fieldErrors.descripcion}</p>}
            </div>

            <div className="flex flex-col gap-2">
              {form.imagen && <img src={resolveProductImage(form.imagen)} alt="" className="w-full h-24 object-cover rounded-[1rem] border border-[rgba(177,146,113,0.1)] shadow-inner" />}
              <label className="flex items-center justify-center gap-3 bg-[rgba(255,255,255,0.7)] border-2 border-dashed border-[rgba(177,146,113,0.3)] rounded-full py-2 cursor-pointer hover:bg-white transition-colors group">
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                <span className="text-xs font-medium text-[#8a7c74] group-hover:text-[#1a4731] transition-colors">{isUploading ? 'Subiendo...' : 'Cambiar Imagen'}</span>
              </label>
            </div>

                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-[#1a4731] text-white py-2.5 rounded-full font-medium hover:bg-[#123624] active:scale-[0.98] transition-all disabled:opacity-50 shadow-md"
                  >
                    {isSaving ? "Guardar..." : "Guardar Cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={resetEditor}
                    className="py-2.5 px-4 text-sm font-medium text-[#3c312d] hover:text-black underline underline-offset-2 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>

                {/* Mové el error a la parte global pero mantengo uno aquí si se desea */}
                {error && <p className="text-center text-xs font-bold text-red-600 whitespace-pre-line">{error}</p>}
              </form>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
