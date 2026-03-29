import { Component, input, output } from '@angular/core';
import { RowPressDirective } from '../../../shared/directives/row-press.directive';

export interface DataTableColumn<T extends object> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  /** Optional cell formatter */
  format?: (row: T) => string;
}

@Component({
  selector: 'app-data-table',
  imports: [RowPressDirective],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTable<T extends object> {
  readonly columns = input<DataTableColumn<T>[]>([]);
  readonly rows = input<T[]>([]);
  readonly sortKey = input<(keyof T & string) | null>(null);
  readonly sortDir = input<'asc' | 'desc'>('asc');

  readonly sortChange = output<{ key: keyof T & string; dir: 'asc' | 'desc' }>();
  readonly rowActivate = output<T>();

  cellValue(row: T, col: DataTableColumn<T>): string {
    if (col.format) return col.format(row);
    const v = row[col.key];
    if (v == null) return '—';
    return String(v);
  }

  onHeaderClick(col: DataTableColumn<T>): void {
    if (!col.sortable) return;
    const k = col.key;
    const cur = this.sortKey();
    const dir =
      cur === k && this.sortDir() === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ key: k, dir });
  }

  onRow(row: T): void {
    this.rowActivate.emit(row);
  }
}
