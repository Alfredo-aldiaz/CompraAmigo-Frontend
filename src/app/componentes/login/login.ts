import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {Router} from '@angular/router';
import {finalize} from 'rxjs';
import {SesionService} from '../services/sesion.service';
import {mensajeDeError} from '../services/compra.service';

@Component({
  imports: [],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {}
