import {MatSelectModule} from '@angular/material/select';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {Component, inject, OnInit, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {finalize} from 'rxjs';
import {ESTADOS_PEDIDO, Pedido} from '../../model/compra';
import {CompraService, mensajeDeError} from '../../services/compra.service';

@Component({imports: [MatSelectModule, CurrencyPipe, DatePipe, MatButtonModule], styleUrl: './admin-pedidos-component.css', templateUrl: './admin-pedidos-component.html'})
export class AdminPedidos implements OnInit {
  private readonly compra = inject(CompraService);
  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly estados = ESTADOS_PEDIDO;
  protected readonly ocupado = signal(true);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  ngOnInit() {
    this.compra.listarPedidosAdmin().pipe(finalize(() => this.ocupado.set(false))).subscribe({
      next: pedidos => this.pedidos.set(pedidos),
      error: error => this.error.set(mensajeDeError(error)),
    });
  }

  actualizar(pedido: Pedido, estado: string) {
    if (this.ocupado() || estado === pedido.estado) return;
    this.ocupado.set(true);
    this.error.set('');
    this.aviso.set('');
    this.compra.actualizarEstado(pedido.pedidoId, estado).pipe(finalize(() => this.ocupado.set(false))).subscribe({
      next: actualizado => {
        this.pedidos.update(items => items.map(p => p.pedidoId === actualizado.pedidoId ? actualizado : p));
        this.aviso.set('Estado actualizado para el pedido #' + pedido.pedidoId + '.');
      },
      error: error => this.error.set(mensajeDeError(error)),
    });
  }
}
