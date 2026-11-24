import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LoginService } from './login-service';
import { environment } from '../../environments/environment';

describe('LoginService y cambio de cuenta', () => {
  let servicio: LoginService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem('token', 'token-anterior');
    localStorage.setItem('rol', 'ROLE_ADMIN');
    localStorage.setItem('roles', 'ROLE_ADMIN');
    localStorage.setItem('userId', '99');
    localStorage.setItem('nombre', 'Cuenta anterior');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(LoginService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    servicio.logout();
  });

  it('retira la identidad anterior antes de autenticar otra cuenta', () => {
    servicio.login({ username: 'nuevo@example.com', password: 'Clave2026' }).subscribe();
    expect(servicio.getToken()).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('rol')).toBeNull();
    http.expectOne(environment.apiURL + '/authenticate').flush({
      jwt: 'token-nuevo', roles: ['ROLE_USER'], userId: 100,
    });
    expect(servicio.getToken()).toBe('token-nuevo');
  });

  it('un intento rechazado deja la sesión cerrada', () => {
    servicio.login({ username: 'nuevo@example.com', password: 'incorrecta' }).subscribe({
      error: () => {},
    });
    http.expectOne(environment.apiURL + '/authenticate').flush(
      { message: 'Credenciales incorrectas' }, { status: 401, statusText: 'Unauthorized' },
    );
    expect(servicio.getToken()).toBeNull();
    expect(localStorage.getItem('nombre')).toBeNull();
  });

  it('el alta exitosa deja atrás la sesión de otra cuenta', () => {
    servicio.registrar({
      nombre: 'Nuevo', username: 'nuevo@example.com', password: 'Clave2026',
    }).subscribe();
    http.expectOne(environment.apiURL + '/register').flush('Usuario registrado correctamente');
    expect(servicio.getToken()).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
  });
});
