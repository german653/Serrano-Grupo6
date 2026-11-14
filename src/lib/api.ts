import type {
  Accommodation,
  AccommodationDetail,
  AccommodationStatus,
  AdminOverview,
  Booking,
  BookingStatus,
  DestinationName,
  PaymentMethod,
  PaymentStatus,
  Review,
  SearchFilters,
  User,
  UserRole,
} from '../types';
import { localFallbackStore } from './localFallbackStore';

async function requestWithFallback<T>(
  url: string,
  options: RequestInit | undefined,
  fallback: () => T
): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      ...options,
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Static host (e.g. Cloudflare Pages) returned HTML or 404 page instead of Express JSON
      return fallback();
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Ocurrió un error al comunicarse con el servidor.');
    }
    return data as T;
  } catch (err) {
    // Only fall back on network errors or missing static backend, not explicit 4xx validation errors
    if (err instanceof TypeError) {
      return fallback();
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    requestWithFallback<{ user: User }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      () => localFallbackStore.login(email, password)
    ),

  loginDemo: (role: UserRole) =>
    requestWithFallback<{ user: User }>(
      '/api/auth/demo',
      { method: 'POST', body: JSON.stringify({ role }) },
      () => localFallbackStore.loginDemo(role)
    ),

  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
    city: string;
  }) =>
    requestWithFallback<{ user: User }>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify(payload) },
      () => localFallbackStore.register(payload)
    ),

  recoverPassword: (email: string) =>
    requestWithFallback<{ sent: boolean; message: string }>(
      '/api/auth/recover',
      { method: 'POST', body: JSON.stringify({ email }) },
      () => localFallbackStore.recoverPassword(email)
    ),

  // Accommodations
  listAccommodations: (
    filters?: Partial<SearchFilters> & { ownerId?: string; includeAllStatuses?: boolean }
  ) => {
    const params = new URLSearchParams();
    if (filters?.destination && filters.destination !== 'Todos') {
      params.set('destination', filters.destination);
    }
    if (filters?.checkIn) params.set('checkIn', filters.checkIn);
    if (filters?.checkOut) params.set('checkOut', filters.checkOut);
    if (filters?.guests && filters.guests > 0) params.set('guests', String(filters.guests));
    if (filters?.minPrice && filters.minPrice > 0) params.set('minPrice', String(filters.minPrice));
    if (filters?.maxPrice && filters.maxPrice > 0) params.set('maxPrice', String(filters.maxPrice));
    if (filters?.type && filters.type !== 'Todos') params.set('type', filters.type);
    if (filters?.amenities && filters.amenities.length > 0) {
      params.set('amenities', filters.amenities.join(','));
    }
    if (filters?.sortBy) params.set('sortBy', filters.sortBy);
    if (filters?.ownerId) params.set('ownerId', filters.ownerId);
    if (filters?.includeAllStatuses) params.set('includeAllStatuses', 'true');

    const query = params.toString();
    return requestWithFallback<{ accommodations: Accommodation[] }>(
      `/api/accommodations${query ? `?${query}` : ''}`,
      undefined,
      () => localFallbackStore.listAccommodations(filters)
    );
  },

  getAccommodation: (idOrSlug: string) =>
    requestWithFallback<{ accommodation: AccommodationDetail }>(
      `/api/accommodations/${idOrSlug}`,
      undefined,
      () => localFallbackStore.getAccommodation(idOrSlug)
    ),

  createAccommodation: (payload: {
    ownerId: string;
    name: string;
    type: Accommodation['type'];
    destination: DestinationName;
    address: string;
    zoneReference: string;
    shortDescription: string;
    description: string;
    pricePerNight: number;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
  }) =>
    requestWithFallback<{ accommodation: Accommodation }>(
      '/api/accommodations',
      { method: 'POST', body: JSON.stringify(payload) },
      () => localFallbackStore.createAccommodation(payload)
    ),

  updateAccommodation: (
    id: string,
    patch: Partial<{
      name: string;
      pricePerNight: number;
      maxGuests: number;
      shortDescription: string;
      description: string;
      address: string;
      zoneReference: string;
      amenities: string[];
      status: AccommodationStatus;
      verified: boolean;
    }>
  ) =>
    requestWithFallback<{ accommodation: Accommodation }>(
      `/api/accommodations/${id}`,
      { method: 'PATCH', body: JSON.stringify(patch) },
      () => localFallbackStore.updateAccommodation(id, patch)
    ),

  toggleBlockedDate: (accommodationId: string, date: string) =>
    requestWithFallback<{ accommodation: AccommodationDetail }>(
      `/api/accommodations/${accommodationId}/availability`,
      { method: 'POST', body: JSON.stringify({ date }) },
      () => localFallbackStore.toggleBlockedDate(accommodationId, date)
    ),

  addReview: (
    accommodationId: string,
    payload: { authorName: string; authorCity: string; rating: number; comment: string }
  ) =>
    requestWithFallback<{ review: Review; accommodation: AccommodationDetail }>(
      `/api/accommodations/${accommodationId}/reviews`,
      { method: 'POST', body: JSON.stringify(payload) },
      () => localFallbackStore.addReview(accommodationId, payload)
    ),

  // Bookings
  listBookings: (filter?: { touristId?: string; ownerId?: string }) => {
    const params = new URLSearchParams();
    if (filter?.touristId) params.set('touristId', filter.touristId);
    if (filter?.ownerId) params.set('ownerId', filter.ownerId);
    const q = params.toString();
    return requestWithFallback<{ bookings: Booking[] }>(
      `/api/bookings${q ? `?${q}` : ''}`,
      undefined,
      () => localFallbackStore.listBookings(filter)
    );
  },

  createBooking: (payload: {
    accommodationId: string;
    touristId?: string;
    guestName: string;
    guestDni: string;
    guestEmail: string;
    guestPhone: string;
    arrivalTime: string;
    specialRequests: string;
    checkIn: string;
    checkOut: string;
    guestsCount: number;
    paymentMethod: PaymentMethod;
  }) =>
    requestWithFallback<{ booking: Booking }>(
      '/api/bookings',
      { method: 'POST', body: JSON.stringify(payload) },
      () => localFallbackStore.createBooking(payload)
    ),

  updateBooking: (id: string, patch: { status?: BookingStatus; paymentStatus?: PaymentStatus }) =>
    requestWithFallback<{ booking: Booking }>(
      `/api/bookings/${id}`,
      { method: 'PATCH', body: JSON.stringify(patch) },
      () => localFallbackStore.updateBooking(id, patch)
    ),

  // Admin
  getAdminOverview: () =>
    requestWithFallback<{ overview: AdminOverview }>(
      '/api/admin/overview',
      undefined,
      () => localFallbackStore.getAdminOverview()
    ),

  listUsers: () =>
    requestWithFallback<{ users: User[] }>(
      '/api/users',
      undefined,
      () => localFallbackStore.listUsers()
    ),

  updateUser: (id: string, patch: { active?: boolean; role?: UserRole }) =>
    requestWithFallback<{ user: User }>(
      `/api/users/${id}`,
      { method: 'PATCH', body: JSON.stringify(patch) },
      () => localFallbackStore.updateUser(id, patch)
    ),
};
