import {filtrarProductos, sugerirAlternativas} from './filtros-catalogo';
import type {Producto} from './compra';

const productos: Producto[] = [
  {id: 1, nombre: 'Mochila reciclada', descripcion: 'Material ecológico', precio: 89, stock: 8, co2: 3, imagen: null, tallas: null, categoria: {id: 1, nombre: 'Accesorios'}},
  {id: 2, nombre: 'Polo orgánico', descripcion: 'Algodón sostenible', precio: 49, stock: 5, co2: 2, imagen: null, tallas: null, categoria: {id: 2, nombre: 'Ropa'}},
  {id: 3, nombre: 'Bolso reutilizable', descripcion: 'Accesorios de tela', precio: 19, stock: 7, co2: 1, imagen: null, tallas: null, categoria: {id: 1, nombre: 'Accesorios'}},
];

describe('Filtros del catálogo', () => {
  it('busca productos sin distinguir acentos', () => {
    expect(filtrarProductos(productos, 'organico', null, 'relevancia').map(p => p.id)).toEqual([2]);
  });

  it('filtra por categoría y ordena por precio', () => {
    expect(filtrarProductos(productos, '', 1, 'precio-asc').map(p => p.id)).toEqual([3, 1]);
  });

  it('propone alternativas ante errores al escribir', () => {
    expect(sugerirAlternativas(productos, 'mochla', null)[0].id).toBe(1);
  });
});
