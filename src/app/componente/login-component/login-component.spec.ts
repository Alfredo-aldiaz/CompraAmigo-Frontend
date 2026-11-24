import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginService } from '../../services/login-service';
import { LoginComponent } from './login-component';

describe('LoginComponent', () => {
  let componente: LoginComponent;
  let navegar: ReturnType<typeof vi.spyOn>;
  const servicio = {
    login: vi.fn(),
    registrar: vi.fn(),
    logout: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: LoginService, useValue: servicio }],
    }).compileComponents();
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    componente = TestBed.createComponent(LoginComponent).componentInstance;
  });

  afterEach(() => {
    for (const clave of ['rol', 'roles', 'nombre', 'userId']) localStorage.removeItem(clave);
  });

  function completar() {
    componente.loginForm.setValue({
      username: 'cuenta@example.com', password: 'ClaveDemo2026', verificarHumano: true,
    });
  }

  it('requiere la confirmación antes de enviar las credenciales', () => {
    completar();
    componente.loginForm.controls.verificarHumano.setValue(false);
    componente.onSubmitLogin();
    expect(servicio.login).not.toHaveBeenCalled();
    expect(componente.loginForm.controls.verificarHumano.touched).toBe(true);
  });

  it('abre inventario cuando la API devuelve el rol administrador', () => {
    completar();
    servicio.login.mockReturnValue(of({
      roles: ['ROLE_ADMIN'], userId: 10, nombre: 'Administrador',
    }));
    componente.onSubmitLogin();
    expect(localStorage.getItem('rol')).toBe('ROLE_ADMIN');
    expect(navegar).toHaveBeenCalledWith(['/admin/productos']);
    expect(servicio.login).toHaveBeenCalledWith({
      username: 'cuenta@example.com', password: 'ClaveDemo2026',
    });
  });

  it('abre catálogo cuando la API devuelve el rol usuario', () => {
    completar();
    servicio.login.mockReturnValue(of({
      roles: ['ROLE_USER'], userId: 20, nombre: 'Cliente',
    }));
    componente.onSubmitLogin();
    expect(localStorage.getItem('rol')).toBe('ROLE_USER');
    expect(navegar).toHaveBeenCalledWith(['/catalogo']);
  });

  it('pide confirmar nuevamente después de credenciales rechazadas', () => {
    completar();
    servicio.login.mockReturnValue(throwError(() => ({ status: 401 })));
    componente.onSubmitLogin();
    expect(componente.loginForm.controls.verificarHumano.value).toBe(false);
    expect(componente.ocupado).toBe(false);
    expect(navegar).not.toHaveBeenCalled();
  });

  it('el registro solo envía los datos de una cuenta cliente', () => {
    componente.loginForm.controls.password.setValue('ContraseñaDeOtraCuenta');
    componente.registerForm.setValue({
      nombre: 'Cliente', username: 'cliente@example.com', password: 'ClaveDemo2026',
    });
    servicio.registrar.mockReturnValue(of('Usuario registrado correctamente'));
    servicio.login.mockReturnValue(of({
      roles: ['ROLE_USER'], userId: 30, nombre: 'Cliente',
    }));
    componente.onSubmitRegister();
    expect(servicio.registrar).toHaveBeenCalledWith({
      nombre: 'Cliente', username: 'cliente@example.com', password: 'ClaveDemo2026',
    });
    expect(componente.tabIndex).toBe(0);
    expect(componente.loginForm.controls.verificarHumano.value).toBe(false);
    expect(componente.loginForm.controls.password.value).toBe('');
    expect(servicio.login).toHaveBeenCalledWith({
      username: 'cliente@example.com', password: 'ClaveDemo2026',
    });
    expect(localStorage.getItem('userId')).toBe('30');
    expect(navegar).toHaveBeenCalledWith(['/perfil']);
  });

  it('si el alta funciona pero falla el acceso, pide la contraseña nueva sin conservar la anterior', () => {
    componente.loginForm.controls.password.setValue('ContraseñaDeOtraCuenta');
    componente.registerForm.setValue({
      nombre: 'Cliente', username: 'cliente@example.com', password: 'ClaveNueva2026',
    });
    servicio.registrar.mockReturnValue(of('Usuario registrado correctamente'));
    servicio.login.mockReturnValue(throwError(() => ({ status: 401 })));
    componente.onSubmitRegister();
    expect(componente.loginForm.controls.password.value).toBe('');
    expect(componente.loginForm.controls.username.value).toBe('cliente@example.com');
    expect(componente.ocupado).toBe(false);
    expect(componente.mensaje).toContain('Tu cuenta fue creada');
    expect(navegar).not.toHaveBeenCalled();
  });
});
