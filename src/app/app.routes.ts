import {Routes} from '@angular/router';
import {requiereAdmin, requiereCliente, requiereSesion} from './services/autenticacion';

export const routes: Routes = [
  {path: 'home', pathMatch: 'full', redirectTo: 'catalogo'},
  {path: '', pathMatch: 'full', redirectTo: 'catalogo'},
  {path: 'login', loadComponent: () => import('./componente/login-component/login-component').then(m => m.LoginComponent)},
  {path: 'catalogo', canActivate: [requiereSesion], loadComponent: () => import('./componente/catalogo-component/catalogo-component').then(m => m.Catalogo)},
  {path: 'producto/:id', canActivate: [requiereSesion], loadComponent: () => import('./componente/detalle-producto-component/detalle-producto-component').then(m => m.DetalleProducto)},
  {path: 'perfil', canActivate: [requiereSesion, requiereCliente], loadComponent: () => import('./componente/perfil-component/perfil-component').then(m => m.PerfilCliente)},
  {path: 'carrito', canActivate: [requiereSesion, requiereCliente], loadComponent: () => import('./componente/carrito-component/carrito-component').then(m => m.Carrito)},
  {path: 'checkout', canActivate: [requiereSesion, requiereCliente], loadComponent: () => import('./componente/checkout-component/checkout-component').then(m => m.Checkout)},
  {path: 'pedidos', canActivate: [requiereSesion, requiereCliente], loadComponent: () => import('./componente/pedidos-component/pedidos-component').then(m => m.Pedidos)},
  {path: 'pedidos/:id/confirmacion', canActivate: [requiereSesion, requiereCliente], data: {confirmacion: true}, loadComponent: () => import('./componente/detalle-pedido-component/detalle-pedido-component').then(m => m.DetallePedido)},
  {path: 'pedidos/:id', canActivate: [requiereSesion, requiereCliente], loadComponent: () => import('./componente/detalle-pedido-component/detalle-pedido-component').then(m => m.DetallePedido)},
  {path: 'admin/productos', canActivate: [requiereSesion, requiereAdmin], loadComponent: () => import('./componente/admin-productos-component/admin-productos-component').then(m => m.AdminProductos)},
  {path: 'admin/pedidos', canActivate: [requiereSesion, requiereAdmin], loadComponent: () => import('./componente/admin-pedidos-component/admin-pedidos-component').then(m => m.AdminPedidos)},
  {path: '**', redirectTo: 'catalogo'},
];
