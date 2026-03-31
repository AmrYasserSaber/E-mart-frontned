import { Component, computed, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { appIcons } from '../../icons/font-awesome-icons';

@Component({
  selector: 'app-pagination',
  imports: [FontAwesomeModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  readonly page = input(1);
  readonly totalPages = input(1);
  readonly pageChange = output<number>();
  readonly chevronLeftIcon = appIcons['chevronLeft'];
  readonly chevronRightIcon = appIcons['chevronRight'];

  readonly pages = computed(() => {
    const total = Math.max(1, this.totalPages());
    const cur = Math.min(Math.max(1, this.page()), total);
    const maxButtons = 7;
    const pages: number[] = [];
    if (total <= maxButtons) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }
    let start = Math.max(1, cur - 3);
    let end = Math.min(total, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  go(p: number): void {
    const total = Math.max(1, this.totalPages());
    const next = Math.min(Math.max(1, p), total);
    if (next !== this.page()) this.pageChange.emit(next);
  }
}
