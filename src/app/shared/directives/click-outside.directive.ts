import {
  Directive,
  ElementRef,
  inject,
  output,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, filter } from 'rxjs';

@Directive({
  selector: '[appClickOutside]',
})
export class ClickOutsideDirective implements OnInit {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly appClickOutside = output<MouseEvent>();

  ngOnInit(): void {
    fromEvent<MouseEvent>(document, 'click', { capture: true })
      .pipe(
        filter((ev) => {
          const t = ev.target as Node | null;
          return t != null && !this.el.nativeElement.contains(t);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((ev) => this.appClickOutside.emit(ev));
  }
}
