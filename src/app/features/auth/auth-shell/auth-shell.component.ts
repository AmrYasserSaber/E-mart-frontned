import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { authRouteAnimations } from '../auth-route.animations';

@Component({
  selector: 'app-auth-shell',
  imports: [RouterOutlet],
  templateUrl: './auth-shell.component.html',
  styleUrl: './auth-shell.component.css',
  animations: [authRouteAnimations],
})
export class AuthShellComponent {
  prepareRoute(outlet: RouterOutlet): string {
    if (!outlet.isActivated) {
      return '';
    }
    const key = outlet.activatedRoute.snapshot.data['animation'];
    return typeof key === 'string' ? key : '';
  }
}
