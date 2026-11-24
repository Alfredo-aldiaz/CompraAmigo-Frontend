import {CurrencyPipe} from '@angular/common';
import {Component, OnInit, computed, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {Observable, finalize} from 'rxjs';
import {CarritoItem, TotalCheckout} from '../../model/compra';
import {CompraService, mensajeDeError} from '../../services/compra.service';
import {SesionService} from '../../services/sesion.service';

@Component({
  imports: [CurrencyPipe, MatButtonModule, RouterLink],
  styleUrl: './carrito-component.css', templateUrl: './carrito-component.html',
})
export class Carrito implements OnInit {
  private readonly compra = inject(CompraService);
  private readonly usuario = inject(SesionService).sesion()!;
  protected readonly items = signal<CarritoItem[]>([]);
  protected readonly cargando = signal(true);
  protected readonly pendiente = signal(false);
  protected readonly error = signal('');
  protected readonly subtotal = computed(() => this.items().reduce((total, item) => total + item.subtotal, 0));
  protected readonly totalEstandar = signal<TotalCheckout | null>(null);

  ngOnInit() {
    this.cargarTotal();
    this.compra.listarCarrito(this.usuario.userId).pipe(finalize(() => this.cargando.set(false))).subscribe({
      next: items => this.items.set(items),
      error: error => this.error.set(mensajeDeError(error)),
    });
  }

  cambiar(item: CarritoItem, cantidad: number) {
    if (this.pendiente() || cantidad < 1) return;
    this.mutar(this.compra.actualizarCantidad(item.id, cantidad), actualizado => {
      this.items.update(items => items.map(fila => fila.id === item.id ? actualizado : fila));
    });
  }

  quitar(item: CarritoItem) {
    if (this.pendiente()) return;
    this.mutar(this.compra.quitar(item.id), () => this.items.update(items => items.filter(fila => fila.id !== item.id)));
  }

  private mutar<T>(peticion: Observable<T>, aplicar: (resultado: T) => void) {
    this.error.set('');
    this.pendiente.set(true);
    peticion.pipe(finalize(() => this.pendiente.set(false))).subscribe({
      next: resultado => { aplicar(resultado); this.cargarTotal(); },
      error: error => this.error.set(mensajeDeError(error)),
    });
  }

  private cargarTotal() {
    this.totalEstandar.set(null);
    this.compra.totalCheckout('estandar').subscribe({
      next: total => this.totalEstandar.set(total),
      error: error => this.error.set(mensajeDeError(error)),
    });
  }
}
