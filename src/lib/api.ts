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

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Ocurrió un error al comunicarse con el servidor.');
  }
  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  loginDemo: (role: UserRole) =>
    request<{ user: User }>('/api/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
    city: string;
  }) =>
    request<{ user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  recoverPassword: (email: string) =>
    request<{ sent: boolean; message: string }>('/api/auth/recover', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

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
    return request<{ accommodations: Accommodation[] }>(
      `/api/accommodations${query ? `?${query}` : ''}`
    );
  },

  getAccommodation: (idOrSlug: string) =>
    request<{ accommodation: AccommodationDetail }>(`/api/accommodations/${idOrSlug}`),

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
    request<{ accommodation: Accommodation }>('/api/accommodations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

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
    request<{ accommodation: Accommodation }>(`/api/accommodations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  toggleBlockedDate: (accommodationId: string, date: string) =>
    request<{ accommodation: AccommodationDetail }>(
      `/api/accommodations/${accommodationId}/availability`,
      {
        method: 'POST',
        body: JSON.stringify({ date }),
      }
    ),

  addReview: (
    accommodationId: string,
    payload: { authorName: string; authorCity: string; rating: number; comment: string }
  ) =>
    request<{ review: Review; accommodation: AccommodationDetail }>(
      `/api/accommodations/${accommodationId}/reviews`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  // Bookings
  listBookings: (filter?: { touristId?: string; ownerId?: string }) => {
    const params = new URLSearchParams();
    if (filter?.touristId) params.set('touristId', filter.touristId);
    if (filter?.ownerId) params.set('ownerId', filter.ownerId);
    const q = params.toString();
    return request<{ bookings: Booking[] }>(`/api/bookings${q ? `?${q}` : ''}`);
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
    request<{ booking: Booking }>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateBooking: (id: string, patch: { status?: BookingStatus; paymentStatus?: PaymentStatus }) =>
    request<{ booking: Booking }>(`/api/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  // Admin
  getAdminOverview: () => request<{ overview: AdminOverview }>('/api/admin/overview'),

  listUsers: () => request<{ users: User[] }>('/api/users'),

  updateUser: (id: string, patch: { active?: boolean; role?: UserRole }) =>
    request<{ user: User }>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
};
