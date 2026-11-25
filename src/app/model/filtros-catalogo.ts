import type {Producto} from './compra';

export type OrdenCatalogo = 'relevancia' | 'precio-asc' | 'precio-desc';

export function normalizarTexto(valor: string): string {
  return valor.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

export function filtrarProductos(productos: Producto[], busqueda: string, categoria: number | null, orden: OrdenCatalogo): Producto[] {
  const termino = normalizarTexto(busqueda);
  const resultado = productos.filter(producto => {
    if (categoria !== null && producto.categoria?.id !== categoria) return false;
    const texto = normalizarTexto(`${producto.nombre} ${producto.descripcion ?? ''}`);
    return texto.includes(termino);
  });
  if (orden === 'precio-asc') return resultado.sort((a, b) => a.precio - b.precio);
  if (orden === 'precio-desc') return resultado.sort((a, b) => b.precio - a.precio);
  return resultado;
}

function distanciaEdicion(a: string, b: string): number {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let anterior = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const actual = [i];
    for (let j = 1; j <= b.length; j++) {
      actual.push(Math.min(actual[j - 1] + 1, anterior[j] + 1, anterior[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)));
    }
    anterior = actual;
  }
  return anterior[b.length];
}

export function sugerirAlternativas(productos: Producto[], busqueda: string, categoria: number | null, cantidad = 3): Producto[] {
  const consulta = normalizarTexto(busqueda);
  if (!consulta || cantidad <= 0) return [];
  const palabras = consulta.split(/\s+/).filter(Boolean);
  return productos
    .filter(p => categoria === null || p.categoria?.id === categoria)
    .map(producto => {
      const texto = normalizarTexto(`${producto.nombre} ${producto.categoria?.nombre ?? ''} ${producto.descripcion ?? ''}`);
      const tokens = texto.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
      const puntaje = palabras.reduce((total, palabra) => {
        if (texto.includes(palabra)) return total + 100;
        const minima = tokens.reduce((distancia, token) => Math.min(distancia, distanciaEdicion(palabra, token)), palabra.length + 5);
        return total + (minima <= 2 ? 60 - minima * 15 : 0);
      }, 0);
      return {producto, puntaje};
    })
    .sort((a, b) => b.puntaje - a.puntaje || b.producto.stock - a.producto.stock || a.producto.nombre.localeCompare(b.producto.nombre))
    .slice(0, cantidad)
    .map(resultado => resultado.producto);
}
