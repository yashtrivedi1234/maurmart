export interface Product {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  mrp?: number;
  category?: string;
  image: string;
  stock?: number;
  rating?: number;
  reviews?: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
}

export interface HeroSlide {
  _id: string;
  image: string;
  badge: string;
  heading: string;
  highlight: string;
  sub: string;
}
