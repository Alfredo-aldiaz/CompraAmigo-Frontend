import { inject, Injectable } from '@angular/core';
import { LoginService } from './login-service';
import { Sesion } from '../model/compra';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly login = inject(LoginService);

  sesion(): Sesion | null {
    const jwt = this.login.getToken();
    if (!jwt) return null;
    return {
      jwt,
      userId: Number(localStorage.getItem('userId')),
      nombre: localStorage.getItem('nombre') || '',
      roles: (localStorage.getItem('roles') || localStorage.getItem('rol') || '').split(',').filter(Boolean),
    };
  }

  cerrar(): void { this.login.logout(); }
}
