import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {Router} from '@angular/router';
import {finalize} from 'rxjs';
import {SesionService} from '../services/sesion.service';
import {mensajeDeError} from '../services/compra.service';

@Component({
  imports: [ReactiveFormsModule, MatButtonModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  protected readonly formulario = inject(FormBuilder).nonNullable.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected readonly error = signal('');
  protected readonly enviando = signal(false);

  iniciar() {
    if (this.enviando() || this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.error.set('');
    this.enviando.set(true);
    const { username, password } = this.formulario.getRawValue();
    this.sesion
      .iniciar(username.trim(), password)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => void this.router.navigate(['/catalogo']),
        error: (e) => this.error.set(mensajeDeError(e)),
      });
  }
}
