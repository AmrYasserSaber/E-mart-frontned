import { Component } from '@angular/core';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-activity-feed',
  imports: [EmptyState],
  templateUrl: './activity-feed.html',
  styleUrl: './activity-feed.css',
})
export class ActivityFeed {}
