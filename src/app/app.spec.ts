import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app';

describe('App', () => {
  it('muestra la navegación', async () => {
    await TestBed.configureTestingModule({
      imports: [App], providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('mat-toolbar')?.textContent).toContain('CompraAmigo');
  });
});
