import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  readonly open = input(false);
  readonly title = input('');
  readonly closeOnBackdrop = input(true);
  readonly closed = output<void>();

  onBackdrop(): void {
    if (this.closeOnBackdrop()) this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }
}
