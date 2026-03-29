import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  imports: [],
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.css',
})
export class StarRating {
  readonly value = input(0);
  readonly max = input(5);
  readonly readonly = input(false);
  readonly valueChange = output<number>();

  stars(): number[] {
    return [...Array(this.max()).keys()];
  }

  isFilled(i: number): boolean {
    return i < Math.round(this.value());
  }

  set(i: number): void {
    if (this.readonly()) return;
    this.valueChange.emit(i + 1);
  }

  starButtonLabel(i: number): string {
    const n = i + 1;
    const m = this.max();
    if (this.readonly()) {
      return `Star ${n} of ${m}, ${this.isFilled(i) ? 'selected' : 'not selected'}`;
    }
    return `Set rating to ${n} out of ${m}`;
  }
}
