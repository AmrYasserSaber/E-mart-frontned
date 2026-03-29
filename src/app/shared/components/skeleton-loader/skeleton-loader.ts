import { Component, input } from '@angular/core';

export type SkeletonVariant = 'text' | 'card' | 'table-row';

@Component({
  selector: 'app-skeleton-loader',
  imports: [],
  templateUrl: './skeleton-loader.html',
  styleUrl: './skeleton-loader.css',
})
export class SkeletonLoader {
  readonly variant = input<SkeletonVariant>('text');
  readonly lines = input(3);
  lineArray(): number[] {
    return [...Array(this.lines()).keys()];
  }
}
