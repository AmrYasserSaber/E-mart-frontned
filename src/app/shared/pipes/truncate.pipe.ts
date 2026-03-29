import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, maxLength = 80, suffix = '…'): string {
    if (value == null) return '';
    if (value.length <= maxLength) return value;
    return value.slice(0, Math.max(0, maxLength - suffix.length)).trimEnd() + suffix;
  }
}
