import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
})
export class TimeAgoPipe implements PipeTransform {
  transform(iso: string | Date | null | undefined): string {
    if (!iso) return '—';
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    const t = d.getTime();
    if (Number.isNaN(t)) return 'invalid date';
    const sec = Math.floor((Date.now() - t) / 1000);
    if (sec < 0) return 'in the future';
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 30) return `${day}d ago`;
    return d.toLocaleDateString();
  }
}
