import { Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { Product } from '../../../core/models/product.model';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';
import { StarRating } from '../star-rating/star-rating';
import { appIcons } from '../../icons/font-awesome-icons';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyFormatPipe, StarRating, FontAwesomeModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  readonly imagePlaceholder =
    'https://img.freepik.com/premium-vector/picture-icon-isolated-white-background-vector-illustration_736051-240.jpg?semt=ais_incoming&w=740&q=80';
  readonly product = input.required<Product>();
  readonly addToCart = output<Product>();
  readonly open = output<Product>();
  readonly favoriteIcon = appIcons['favorite'];

  onOpen(): void {
    this.open.emit(this.product());
  }

  onAdd(event?: Event): void {
    event?.stopPropagation();
    this.addToCart.emit(this.product());
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement | null;
    if (!target) return;
    target.onerror = null;
    target.src = this.imagePlaceholder;
  }
}
