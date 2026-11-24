import {CurrencyPipe, DatePipe} from '@angular/common';
import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {finalize} from 'rxjs';
import {ESTADOS_PEDIDO, Pedido} from '../../model/compra';
import {CompraService, mensajeDeError} from '../../services/compra.service';
import {EcoImpacto} from '../eco-impacto-component/eco-impacto-component';

@Component({imports: [CurrencyPipe, DatePipe, RouterLink, MatButtonModule, EcoImpacto], styleUrl: './detalle-pedido-component.css', templateUrl: './detalle-pedido-component.html'})
export class DetallePedido implements OnInit {
  private readonly compra = inject(CompraService);
  private readonly ruta = inject(ActivatedRoute);
  protected readonly confirmacion = this.ruta.snapshot.data['confirmacion'] === true;
  protected readonly pedido = signal<Pedido | null>(null);
  protected readonly estados = ESTADOS_PEDIDO;
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  ngOnInit() {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    this.compra.pedido(id).pipe(finalize(() => this.cargando.set(false))).subscribe({
      next: pedido => this.pedido.set(pedido),
      error: error => this.error.set(mensajeDeError(error)),
    });
  }
}
