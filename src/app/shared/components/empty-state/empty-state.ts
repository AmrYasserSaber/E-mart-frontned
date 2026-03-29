import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  imports: [],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyState {
  readonly title = input('Nothing here');
  readonly message = input('');
  readonly actionLabel = input<string | undefined>(undefined);
  readonly action = output<void>();

  onAction(): void {
    this.action.emit();
  }
}
