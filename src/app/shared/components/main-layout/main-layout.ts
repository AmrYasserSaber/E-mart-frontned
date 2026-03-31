import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, NavbarComponent, Footer],
  template: `
    <app-navbar />
    <main class="flex-1 pt-20">
      <router-outlet />
    </main>
    <app-footer />
  `,
  styles: `:host { display: contents; }`,
})
export class MainLayout {}
