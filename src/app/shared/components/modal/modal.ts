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
  readonly disableClose = input(false);
  readonly closed = output<void>();

  onBackdrop(): void {
    if (this.disableClose()) return;
    if (this.closeOnBackdrop()) this.closed.emit();
  }

  onClose(): void {
    if (this.disableClose()) return;
    this.closed.emit();
  }
}
