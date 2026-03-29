import {
  Directive,
  ElementRef,
  inject,
  input,
  effect,
} from '@angular/core';

/** Sets `img.src` when the image enters the viewport. */
@Directive({
  selector: 'img[appLazyImage]',
})
export class LazyImageDirective {
  readonly appLazyImage = input.required<string>({ alias: 'appLazyImage' });

  private readonly el = inject(ElementRef<HTMLImageElement>);

  constructor() {
    effect((onCleanup) => {
      const src = this.appLazyImage();
      const img = this.el.nativeElement;
      img.removeAttribute('src');
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e?.isIntersecting) {
            img.src = src;
            obs.disconnect();
          }
        },
        { rootMargin: '80px' },
      );
      obs.observe(img);
      onCleanup(() => obs.disconnect());
    });
  }
}
