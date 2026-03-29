import { Component } from '@angular/core';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-banners',
  imports: [EmptyState],
  templateUrl: './banners.html',
  styleUrl: './banners.css',
})
export class Banners {}
