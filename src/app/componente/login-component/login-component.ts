import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from '../../services/login-service';
import { HttpErrorResponse } from '@angular/common/http';
import { ResponseDto } from '../../model/response-dto';

@Component({
  selector: 'app-login-component',
  imports: [ReactiveFormsModule, MatCardModule, MatTabsModule, MatCheckboxModule,
    MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly loginService = inject(LoginService);
  private readonly vista = inject(ChangeDetectorRef);

  tabIndex = 0;
  ocupado = false;
  error = '';
  mensaje = '';
  loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    verificarHumano: [false, Validators.requiredTrue],
  });
  registerForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    username: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmitLogin(): void {
    this.loginForm.markAllAsTouched();
    if (this.ocupado || this.loginForm.invalid) return;
    this.ocupado = true;
    this.error = '';
    this.mensaje = '';
    const datos = this.loginForm.getRawValue();
    this.loginService.login({ username: datos.username.trim(), password: datos.password }).subscribe({
      next: data => this.abrirSesion(data, '/catalogo'),
      error: (respuesta: HttpErrorResponse) => {
        this.loginForm.controls.verificarHumano.reset();
        this.error = this.errorDeIngreso(respuesta);
        this.terminar();
      },
    });
  }

  onSubmitRegister(): void {
    this.registerForm.markAllAsTouched();
    if (this.ocupado || this.registerForm.invalid) return;
    this.ocupado = true;
    this.error = '';
    this.mensaje = '';
    const datos = this.registerForm.getRawValue();
    const registro = {
      ...datos, nombre: datos.nombre.trim(), username: datos.username.trim(),
    };
    this.loginService.registrar(registro).subscribe({
      next: () => {
        this.loginForm.reset({ username: registro.username, password: '', verificarHumano: false });
        this.registerForm.reset();
        this.loginService.login({ username: registro.username, password: registro.password }).subscribe({
          next: data => this.abrirSesion(data, '/perfil'),
          error: (respuesta: HttpErrorResponse) => {
            this.tabIndex = 0;
            this.mensaje = 'Tu cuenta fue creada. Ingresa con la contraseña que acabas de registrar.';
            this.error = this.errorDeIngreso(respuesta);
            this.terminar();
          },
        });
      },
      error: () => {
        this.error = 'No se pudo crear la cuenta. Comprueba si el correo ya está registrado.';
        this.terminar();
      },
    });
  }

  private abrirSesion(data: ResponseDto, destinoCliente: string): void {
    const rol = data.roles?.includes('ROLE_ADMIN') ? 'ROLE_ADMIN'
      : data.roles?.includes('ROLE_USER') ? 'ROLE_USER' : null;
    if (rol === null) {
      this.loginService.logout();
      this.loginForm.controls.verificarHumano.reset();
      this.error = 'La cuenta no tiene un rol de acceso válido.';
      this.terminar();
      return;
    }
    localStorage.setItem('rol', rol);
    localStorage.setItem('roles', data.roles.join(','));
    localStorage.setItem('nombre', data.nombre || '');
    localStorage.setItem('userId', String(data.userId));
    this.terminar();
    this.router.navigate([rol === 'ROLE_ADMIN' ? '/admin/productos' : destinoCliente]);
  }

  private errorDeIngreso(respuesta: HttpErrorResponse): string {
    if (respuesta.status === 401 || respuesta.error?.code === 'AUTH_ERROR') {
      return 'El correo y la contraseña no coinciden. Usa la contraseña de esta cuenta.';
    }
    return respuesta.error?.message || 'No pudimos conectar con el servidor. Comprueba que el backend esté encendido.';
  }

  private terminar(): void {
    this.ocupado = false;
    this.vista.markForCheck();
  }
}
