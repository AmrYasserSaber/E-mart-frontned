import { Component, input, output } from '@angular/core';
import type { Product } from '../../../core/models/product.model';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';
import { StarRating } from '../star-rating/star-rating';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyFormatPipe, StarRating],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly addToCart = output<Product>();

  onAdd(): void {
    this.addToCart.emit(this.product());
  }
}
