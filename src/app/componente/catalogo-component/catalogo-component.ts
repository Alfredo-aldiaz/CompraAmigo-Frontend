import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {CurrencyPipe} from '@angular/common';
import {Component, OnInit, computed, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {finalize} from 'rxjs';
import {Categoria, Producto} from '../../model/compra';
import {filtrarProductos, OrdenCatalogo, sugerirAlternativas} from '../../model/filtros-catalogo';
import {imagenProducto, tallasProducto} from '../../model/presentacion-producto';
import {CompraService, mensajeDeError} from '../../services/compra.service';
import {SesionService} from '../../services/sesion.service';

@Component({
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, CurrencyPipe, MatButtonModule, RouterLink],
  styleUrl: './catalogo-component.css', templateUrl: './catalogo-component.html',
})
export class Catalogo implements OnInit {
  private readonly compra = inject(CompraService);
  protected readonly sesion = inject(SesionService);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly busqueda = signal('');
  protected readonly categoria = signal<number | null>(null);
  protected readonly orden = signal<OrdenCatalogo>('relevancia');
  protected readonly categorias = computed<Categoria[]>(() => {
    const únicas = new Map<number, Categoria>();
    for (const producto of this.productos()) {
      if (producto.categoria) únicas.set(producto.categoria.id, producto.categoria);
    }
    return [...únicas.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
  });
  protected readonly visibles = computed(() => filtrarProductos(this.productos(), this.busqueda(), this.categoria(), this.orden()));
  protected readonly alternativas = computed(() => this.busqueda().trim() && this.visibles().length === 0
    ? sugerirAlternativas(this.productos(), this.busqueda(), this.categoria()) : []);
  protected readonly mostrados = computed(() => this.visibles().length ? this.visibles() : this.alternativas());
  protected readonly cargando = signal(true);
  protected readonly pendiente = signal<number | null>(null);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  ngOnInit() {
    this.compra.listarProductos().pipe(finalize(() => this.cargando.set(false))).subscribe({
      next: productos => this.productos.set(productos),
      error: error => this.error.set(mensajeDeError(error)),
    });
  }

  protected readonly tallas = tallasProducto;
  protected readonly imagen = imagenProducto;

  agregar(producto: Producto, talla: string) {
    const usuario = this.sesion.sesion();
    if (!usuario || this.pendiente() !== null) return;
    this.error.set('');
    this.aviso.set('');
    this.pendiente.set(producto.id);
    this.compra.agregar(usuario.userId, producto.id, talla).pipe(
      finalize(() => this.pendiente.set(null)),
    ).subscribe({
      next: () => this.aviso.set(producto.nombre + ' se agregó al carrito.'),
      error: error => this.error.set(mensajeDeError(error)),
    });
  }
}
