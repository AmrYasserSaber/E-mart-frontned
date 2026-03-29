import { Component } from '@angular/core';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-products',
  imports: [EmptyState],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {}
