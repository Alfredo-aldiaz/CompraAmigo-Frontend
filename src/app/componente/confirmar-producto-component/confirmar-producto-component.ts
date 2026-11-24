import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
@Component({
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirmar-producto-component.html',
  styleUrl: './confirmar-producto-component.css',
})
export class ConfirmarProducto {
  protected readonly nombre = inject<string>(MAT_DIALOG_DATA);
}

