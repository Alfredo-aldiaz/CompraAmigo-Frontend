import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {SesionService} from './sesion.service';

export const requiereSesion: CanActivateFn = () =>
  inject(SesionService).sesion() !== null || inject(Router).createUrlTree(['/login']);

export const requiereCliente: CanActivateFn = () =>
  inject(SesionService).sesion()?.roles.includes('ROLE_USER') === true ||
    inject(Router).createUrlTree(['/catalogo']);

export const requiereAdmin: CanActivateFn = () =>
  inject(SesionService).sesion()?.roles.includes('ROLE_ADMIN') === true ||
    inject(Router).createUrlTree(['/catalogo']);
