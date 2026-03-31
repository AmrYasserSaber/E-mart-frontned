import { Component, signal } from '@angular/core';
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
  readonly animationKey = signal('');

  onOutletActivate(outlet: RouterOutlet): void {
    const key = outlet.activatedRoute?.snapshot.data['animation'];
    this.animationKey.set(typeof key === 'string' ? key : '');
  }
}
