export interface PlaceReport {
  id?: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  category: string;
  description: string;
  imageUrl?: string;
  reporterId?: string;
  createdAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PlaceReportInput {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  category: string;
  description: string;
  detailAddress?: string;
  imageUrl?: string;
}
