import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CategoryStrip } from '../components/category-strip/category-strip';
import { FeaturedProducts } from '../components/featured-products/featured-products';
import { HeroBanner } from '../components/hero-banner/hero-banner';
import { HomeNewsletter } from '../components/home-newsletter/home-newsletter';

@Component({
  selector: 'app-home',
  imports: [HeroBanner, CategoryStrip, FeaturedProducts, HomeNewsletter],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
