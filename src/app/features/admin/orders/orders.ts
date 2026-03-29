import { Component } from '@angular/core';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-orders',
  imports: [EmptyState],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {}
