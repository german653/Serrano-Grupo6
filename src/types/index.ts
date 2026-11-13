export type UserRole = 'turista' | 'propietario' | 'administrador';

export type AccommodationType = 'Cabaña' | 'Hotel' | 'Complejo' | 'Apart' | 'Posada';

export type DestinationName =
  | 'Villa Carlos Paz'
  | 'Tanti'
  | 'Cabalango'
  | 'Cuesta Blanca'
  | 'San Antonio de Arredondo';

export type AccommodationStatus = 'publicado' | 'revision' | 'pausado';

export type BookingStatus = 'confirmada' | 'pendiente' | 'cancelada' | 'completada';

export type PaymentStatus = 'sena_abonada' | 'pago_completo' | 'pendiente';

export type PaymentMethod = 'Transferencia bancaria' | 'Billetera virtual' | 'Débito simulado';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  city: string;
  active: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  accommodationId: string;
  authorName: string;
  authorCity: string;
  rating: number;
  stayDate: string;
  comment: string;
  createdAt: string;
}

export interface Accommodation {
  id: string;
  slug: string;
  ownerId: string;
  ownerName: string;
  name: string;
  type: AccommodationType;
  destination: DestinationName;
  address: string;
  zoneReference: string;
  coordinates: {
    lat: number;
    lng: number;
    distanceCenterKm: number;
    distanceLakeKm: number;
  };
  shortDescription: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  galleryKeys: string[];
  rating: number;
  reviewCount: number;
  status: AccommodationStatus;
  verified: boolean;
  checkInTime: string;
  checkOutTime: string;
  blockedDates: string[]; // ISO YYYY-MM-DD dates manually blocked by owner
}

export interface AccommodationDetail extends Accommodation {
  reviews: Review[];
  bookedDates: string[]; // ISO YYYY-MM-DD dates occupied by active bookings
}

export interface Booking {
  id: string;
  code: string; // e.g. SR-2026-4812
  accommodationId: string;
  accommodationName: string;
  accommodationDestination: DestinationName;
  accommodationImageKey: string;
  touristId: string;
  guestName: string;
  guestDni: string;
  guestEmail: string;
  guestPhone: string;
  arrivalTime: string;
  specialRequests: string;
  checkIn: string; // ISO YYYY-MM-DD
  checkOut: string; // ISO YYYY-MM-DD
  nights: number;
  guestsCount: number;
  pricePerNight: number;
  totalAmount: number;
  depositAmount: number; // 20% seña
  balanceAmount: number; // 80% saldo pendiente
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  createdAt: string;
}

export interface SearchFilters {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  minPrice: number;
  maxPrice: number;
  type: string;
  amenities: string[];
  sortBy: 'recommended' | 'price_asc' | 'price_desc' | 'rating_desc';
}

export interface AdminOverview {
  totalPublishedAccommodations: number;
  totalAccommodations: number;
  totalUsers: number;
  totalBookings: number;
  pendingBookings: number;
  estimatedRevenueARS: number;
  estimatedDepositsARS: number;
  occupancyRatePercent: number;
  monthlyMetrics: {
    month: string;
    bookings: number;
    revenueARS: number;
  }[];
  destinationBreakdown: {
    destination: string;
    accommodations: number;
    bookings: number;
  }[];
}
