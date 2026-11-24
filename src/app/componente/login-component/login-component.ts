import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from '../../services/login-service';

@Component({
  selector: 'app-login-component',
  imports: [ReactiveFormsModule, MatCardModule, MatTabsModule, MatButtonToggleModule,
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
    tipoAcceso: ['ROLE_USER', Validators.required],
    username: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
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
    const datos = this.loginForm.getRawValue();
    this.loginService.login({ username: datos.username.trim(), password: datos.password }).subscribe({
      next: data => {
        if (!data.roles?.includes(datos.tipoAcceso)) {
          this.loginService.logout();
          this.error = 'Esta cuenta no tiene el tipo de acceso seleccionado.';
          this.terminar();
          return;
        }
        localStorage.setItem('rol', datos.tipoAcceso);
        localStorage.setItem('roles', data.roles.join(','));
        localStorage.setItem('nombre', data.nombre || '');
        localStorage.setItem('userId', String(data.userId));
        this.terminar();
        this.router.navigate(['/catalogo']);
      },
      error: () => {
        this.error = 'No se pudo ingresar. Revisa las credenciales y la conexión.';
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
    this.loginService.registrar({
      ...datos, nombre: datos.nombre.trim(), username: datos.username.trim(),
    }).subscribe({
      next: () => {
        this.loginForm.patchValue({ username: datos.username.trim(), tipoAcceso: 'ROLE_USER' });
        this.registerForm.reset();
        this.tabIndex = 0;
        this.mensaje = 'Cuenta creada. Inicia sesión con tu correo y contraseña.';
        this.terminar();
      },
      error: () => {
        this.error = 'No se pudo crear la cuenta. Comprueba si el correo ya está registrado.';
        this.terminar();
      },
    });
  }

  private terminar(): void {
    this.ocupado = false;
    this.vista.markForCheck();
  }
}
