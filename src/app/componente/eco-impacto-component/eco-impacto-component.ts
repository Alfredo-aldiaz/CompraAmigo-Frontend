import {DecimalPipe} from '@angular/common';
import {Component, input} from '@angular/core';

@Component({
  selector: 'app-eco-impacto',
  imports: [DecimalPipe],
  styleUrl: './eco-impacto-component.css', templateUrl: './eco-impacto-component.html',
})
export class EcoImpacto {
  readonly valor = input.required<number>();
  readonly detalle = input('Estimación basada en los valores por producto del catálogo.');
}
