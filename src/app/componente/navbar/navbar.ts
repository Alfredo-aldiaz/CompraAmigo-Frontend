import { Component, inject } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { LoginService } from '../../services/login-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [MatToolbar, MatButton, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  router: Router = inject(Router);
  rol: string | null = null;
  loginService = inject(LoginService);

  estaLogueado(): boolean {
    return this.loginService.getToken() !== null;
  }

  obtenerNombre(): string {
    return localStorage.getItem('nombre') || 'CompraAmigo';
  }

  esAdministrador(): boolean {
    this.rol = localStorage.getItem('rol');
    return this.rol === 'ROLE_ADMIN';
  }

  esUsuario(): boolean {
    this.rol = localStorage.getItem('rol');
    return this.rol === 'ROLE_USER';
  }

  cerrarSesion(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}

