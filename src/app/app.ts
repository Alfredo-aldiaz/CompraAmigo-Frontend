import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './componente/navbar/navbar';
import { ChatFlotante } from './componente/chat-flotante-component/chat-flotante-component';
import { SesionService } from './services/sesion.service';
import { inject } from '@angular/core';

@Component({
  imports: [RouterOutlet, Navbar, ChatFlotante],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  readonly sesion = inject(SesionService);
}
