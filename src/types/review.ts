export interface Review {
  id?: string;
  placeId: string;
  placeName: string;
  userId: string;
  userName: string;
  rating: number;
  reviewText: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewInput {
  placeId: string;
  placeName: string;
  userId: string;
  userName: string;
  rating: number;
  reviewText: string;
  imageUrl?: string;
}

export interface PlaceWithReviews {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  category: string;
  averageRating?: number;
  reviewCount?: number;
  reviews?: Review[];
}
