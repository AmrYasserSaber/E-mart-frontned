import { Directive, HostListener, output } from '@angular/core';

function isSpaceKey(ev: KeyboardEvent): boolean {
  return ev.key === ' ' || ev.key === 'Spacebar';
}

@Directive({
  selector: '[appRowPress]',
  host: {
    role: 'button',
    tabindex: '0',
  },
})
export class RowPressDirective {
  readonly rowPress = output<void>();

  @HostListener('click')
  onClick(): void {
    this.rowPress.emit();
  }

  /** Enter activates on keydown (single activation per key repeat is browser-dependent). */
  @HostListener('keydown', ['$event'])
  onKey(ev: KeyboardEvent): void {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      this.rowPress.emit();
      return;
    }
    if (isSpaceKey(ev)) {
      ev.preventDefault();
    }
  }

  @HostListener('keyup', ['$event'])
  onKeyUp(ev: KeyboardEvent): void {
    if (isSpaceKey(ev)) {
      this.rowPress.emit();
    }
  }
}
