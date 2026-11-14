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

interface StoredUser extends User {
  password: string;
}

interface LocalDbState {
  users: StoredUser[];
  accommodations: Accommodation[];
  reviews: Review[];
  bookings: Booking[];
}

const DB_STORAGE_KEY = 'serrano_reservas_static_db_v1';
const BASE_DATE = '2026-11-13';

function addDaysISO(baseIso: string, offsetDays: number): string {
  const d = new Date(`${baseIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function getDatesBetween(checkIn: string, checkOut: string): string[] {
  const dates: string[] = [];
  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return dates;
  const cursor = new Date(start);
  while (cursor < end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function createInitialDb(): LocalDbState {
  return {
    users: [
      {
        id: 'usr-turista-1',
        name: 'Sofía Martínez',
        email: 'sofia.martinez@serranoreservas.ar',
        password: 'demo1234',
        role: 'turista',
        phone: '+54 9 351 482-9104',
        city: 'Córdoba Capital',
        active: true,
        createdAt: '2026-08-12T14:20:00Z',
      },
      {
        id: 'usr-turista-2',
        name: 'Lucas Pereyra',
        email: 'lucas.pereyra@gmail.com',
        password: 'demo1234',
        role: 'turista',
        phone: '+54 9 341 592-1180',
        city: 'Rosario, Santa Fe',
        active: true,
        createdAt: '2026-09-03T10:15:00Z',
      },
      {
        id: 'usr-owner-1',
        name: 'Martín Echeverría',
        email: 'martin@serranoreservas.ar',
        password: 'demo1234',
        role: 'propietario',
        phone: '+54 9 3541 51-8290',
        city: 'Villa Carlos Paz',
        active: true,
        createdAt: '2026-05-10T09:00:00Z',
      },
      {
        id: 'usr-owner-2',
        name: 'Valeria Domínguez',
        email: 'valeria@serranoreservas.ar',
        password: 'demo1234',
        role: 'propietario',
        phone: '+54 9 3541 64-3312',
        city: 'Tanti, Córdoba',
        active: true,
        createdAt: '2026-06-18T11:30:00Z',
      },
      {
        id: 'usr-admin-1',
        name: 'Carolina Salgado',
        email: 'admin@serranoreservas.ar',
        password: 'demo1234',
        role: 'administrador',
        phone: '+54 9 3541 42-0091',
        city: 'Villa Carlos Paz',
        active: true,
        createdAt: '2026-01-15T08:00:00Z',
      },
    ],
    accommodations: [
      {
        id: 'acc-los-aromos',
        slug: 'cabanas-los-aromos',
        ownerId: 'usr-owner-1',
        ownerName: 'Martín Echeverría',
        name: 'Cabañas Los Aromos',
        type: 'Cabaña',
        destination: 'Villa Carlos Paz',
        address: 'Los Aromos 482, Barrio La Quinta',
        zoneReference: 'A 6 minutos del centro y 900 m del balneario El Fantasio',
        coordinates: { lat: -31.4328, lng: -64.5082, distanceCenterKm: 2.4, distanceLakeKm: 1.9 },
        shortDescription:
          'Cabañas de piedra y madera nativa rodeadas de aromos en flor, con pileta climatizada y vista abierta a las sierras.',
        description:
          'Ubicadas en una zona residencial tranquila de Villa Carlos Paz, Cabañas Los Aromos combina arquitectura serrana en piedra y quebracho con confort moderno.',
        pricePerNight: 145000,
        maxGuests: 6,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['Pileta', 'Parrilla', 'Wi-Fi', 'Estacionamiento', 'Aire acondicionado', 'Ropa blanca', 'Pet friendly'],
        galleryKeys: ['cabanas_los_aromos', 'complejo_las_sierras', 'apart_costa_azul'],
        rating: 4.9,
        reviewCount: 48,
        status: 'publicado',
        verified: true,
        checkInTime: '14:00',
        checkOutTime: '10:00',
        blockedDates: [addDaysISO(BASE_DATE, 18), addDaysISO(BASE_DATE, 19)],
      },
      {
        id: 'acc-vista-lago',
        slug: 'hotel-vista-al-lago',
        ownerId: 'usr-owner-2',
        ownerName: 'Valeria Domínguez',
        name: 'Hotel Vista al Lago',
        type: 'Hotel',
        destination: 'Villa Carlos Paz',
        address: 'Av. Illia 1290, Costanera del Lago San Roque',
        zoneReference: 'Frente a la costanera norte y a 4 minutos del Reloj Cucú',
        coordinates: { lat: -31.4109, lng: -64.4915, distanceCenterKm: 1.8, distanceLakeKm: 0.1 },
        shortDescription:
          'Hotel boutique frente al Lago San Roque con piscina infinita, terrazas panorámicas y desayuno artesanal incluido.',
        description:
          'Con acceso directo al paseo costanero, Hotel Vista al Lago ofrece habitaciones superiores y suites con balcón privado hacia el espejo de agua del San Roque.',
        pricePerNight: 189000,
        maxGuests: 4,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['Vista al lago', 'Pileta', 'Desayuno', 'Wi-Fi', 'Estacionamiento', 'Aire acondicionado', 'Ropa blanca'],
        galleryKeys: ['hotel_vista_lago', 'apart_costa_azul', 'hero_carlos_paz'],
        rating: 4.8,
        reviewCount: 72,
        status: 'publicado',
        verified: true,
        checkInTime: '15:00',
        checkOutTime: '10:30',
        blockedDates: [addDaysISO(BASE_DATE, 25)],
      },
      {
        id: 'acc-las-sierras',
        slug: 'complejo-las-sierras',
        ownerId: 'usr-owner-1',
        ownerName: 'Martín Echeverría',
        name: 'Complejo Las Sierras',
        type: 'Complejo',
        destination: 'San Antonio de Arredondo',
        address: 'Av. Héroes de Malvinas 920',
        zoneReference: 'A 3 cuadras del río San Antonio y 10 min de Villa Carlos Paz',
        coordinates: { lat: -31.4822, lng: -64.5271, distanceCenterKm: 8.2, distanceLakeKm: 7.5 },
        shortDescription:
          'Amplio complejo familiar con unidades independientes, parque parquizado, deck solárium y quinchos compartidos.',
        description:
          'Pensado para familias y grupos que buscan descanso junto al río San Antonio sin alejarse de Villa Carlos Paz.',
        pricePerNight: 128000,
        maxGuests: 5,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['Pileta', 'Parrilla', 'Wi-Fi', 'Estacionamiento', 'Aire acondicionado', 'Ropa blanca'],
        galleryKeys: ['complejo_las_sierras', 'cabanas_del_sol', 'destino_rio_serrano'],
        rating: 4.7,
        reviewCount: 39,
        status: 'publicado',
        verified: true,
        checkInTime: '14:00',
        checkOutTime: '10:00',
        blockedDates: [],
      },
      {
        id: 'acc-del-sol',
        slug: 'cabanas-del-sol',
        ownerId: 'usr-owner-2',
        ownerName: 'Valeria Domínguez',
        name: 'Cabañas del Sol',
        type: 'Cabaña',
        destination: 'Tanti',
        address: 'Camino al Durazno km 2, Villa Parque Lago',
        zoneReference: 'A 5 minutos del centro de Tanti y 12 min de Los Chorrillos',
        coordinates: { lat: -31.3568, lng: -64.5872, distanceCenterKm: 14.5, distanceLakeKm: 9.8 },
        shortDescription:
          'Cabañas luminosas con galería de madera, asador criollo techado y senderos privados entre flora autóctona.',
        description:
          'Enclavadas en las lomas soleadas de Tanti, Cabañas del Sol ofrece una experiencia de desconexión total.',
        pricePerNight: 112000,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['Parrilla', 'Wi-Fi', 'Estacionamiento', 'Pet friendly', 'Ropa blanca'],
        galleryKeys: ['cabanas_del_sol', 'destino_rio_serrano', 'cabanas_los_aromos'],
        rating: 4.9,
        reviewCount: 54,
        status: 'publicado',
        verified: true,
        checkInTime: '13:30',
        checkOutTime: '10:00',
        blockedDates: [addDaysISO(BASE_DATE, 12), addDaysISO(BASE_DATE, 13)],
      },
      {
        id: 'acc-costa-azul',
        slug: 'apart-costa-azul',
        ownerId: 'usr-owner-1',
        ownerName: 'Martín Echeverría',
        name: 'Apart Costa Azul',
        type: 'Apart',
        destination: 'Villa Carlos Paz',
        address: 'Calle Los Chañares 185, Barrio Costa Azul',
        zoneReference: 'A 200 m de la Bahía del Gitano y acceso directo a Autopista',
        coordinates: { lat: -31.3941, lng: -64.4785, distanceCenterKm: 3.1, distanceLakeKm: 0.25 },
        shortDescription:
          'Suites y departamentos de diseño contemporáneo con ventanales de piso a techo y vista panorámica al lago.',
        description:
          'Apart Costa Azul combina la independencia de un departamento equipado con servicio hotelero diario.',
        pricePerNight: 134000,
        maxGuests: 4,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['Vista al lago', 'Wi-Fi', 'Estacionamiento', 'Aire acondicionado', 'Desayuno', 'Ropa blanca'],
        galleryKeys: ['apart_costa_azul', 'hotel_vista_lago', 'hero_carlos_paz'],
        rating: 4.8,
        reviewCount: 61,
        status: 'publicado',
        verified: true,
        checkInTime: '14:00',
        checkOutTime: '10:00',
        blockedDates: [],
      },
      {
        id: 'acc-el-mirador',
        slug: 'posada-el-mirador',
        ownerId: 'usr-owner-2',
        ownerName: 'Valeria Domínguez',
        name: 'Posada El Mirador',
        type: 'Posada',
        destination: 'Cuesta Blanca',
        address: 'Subida del Cerro s/n, Cuesta Blanca',
        zoneReference: 'Sobre mirador natural a 600 m de Playa de los Hippies',
        coordinates: { lat: -31.4911, lng: -64.5734, distanceCenterKm: 16.0, distanceLakeKm: 13.5 },
        shortDescription:
          'Posada boutique de piedra en lo alto del valle con restaurante de autor, cava serrana y atención personalizada.',
        description:
          'Suspendida sobre las quebradas de Cuesta Blanca, Posada El Mirador invita a bajar el ritmo con vistas al valle.',
        pricePerNight: 156000,
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['Desayuno', 'Wi-Fi', 'Estacionamiento', 'Aire acondicionado', 'Ropa blanca'],
        galleryKeys: ['posada_el_mirador', 'destino_rio_serrano', 'cabanas_los_aromos'],
        rating: 5.0,
        reviewCount: 33,
        status: 'publicado',
        verified: true,
        checkInTime: '15:00',
        checkOutTime: '11:00',
        blockedDates: [],
      },
      {
        id: 'acc-refugio-arroyo',
        slug: 'refugio-del-arroyo-cabalango',
        ownerId: 'usr-owner-2',
        ownerName: 'Valeria Domínguez',
        name: 'Refugio del Arroyo',
        type: 'Cabaña',
        destination: 'Cabalango',
        address: 'Costanera del Arroyo Los Chorrillos 310',
        zoneReference: 'A 80 metros de las ollas naturales del arroyo en Cabalango',
        coordinates: { lat: -31.3895, lng: -64.5588, distanceCenterKm: 11.4, distanceLakeKm: 8.9 },
        shortDescription:
          'Cabañas de descanso frente a las aguas cristalinas de Cabalango, con deck de madera, parrilla y silencio serrano.',
        description:
          'A pasos del curso natural del arroyo Los Chorrillos, Refugio del Arroyo ofrece cabañas amplias con bajada directa al río.',
        pricePerNight: 118000,
        maxGuests: 5,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['Parrilla', 'Wi-Fi', 'Estacionamiento', 'Pet friendly', 'Ropa blanca'],
        galleryKeys: ['destino_rio_serrano', 'cabanas_del_sol', 'complejo_las_sierras'],
        rating: 4.8,
        reviewCount: 27,
        status: 'publicado',
        verified: true,
        checkInTime: '14:00',
        checkOutTime: '10:00',
        blockedDates: [],
      },
    ],
    reviews: [
      {
        id: 'rev-1',
        accommodationId: 'acc-los-aromos',
        authorName: 'Luciano Ferreyra',
        authorCity: 'Rosario, Santa Fe',
        rating: 5,
        stayDate: 'Octubre 2026',
        comment: 'Excelente atención de Martín desde que llegamos. La cabaña impecable y la vista a las sierras al atardecer es impagable.',
        createdAt: '2026-10-20T16:30:00Z',
      },
      {
        id: 'rev-2',
        accommodationId: 'acc-vista-lago',
        authorName: 'Federico Quiroga',
        authorCity: 'Mendoza',
        rating: 5,
        stayDate: 'Octubre 2026',
        comment: 'Desayunar mirando el Lago San Roque no tiene precio. Muy buena ubicación para caminar por la costanera.',
        createdAt: '2026-10-12T10:40:00Z',
      },
    ],
    bookings: [
      {
        id: 'bkg-101',
        code: 'SR-2026-4108',
        accommodationId: 'acc-los-aromos',
        accommodationName: 'Cabañas Los Aromos',
        accommodationDestination: 'Villa Carlos Paz',
        accommodationImageKey: 'cabanas_los_aromos',
        touristId: 'usr-turista-1',
        guestName: 'Sofía Martínez',
        guestDni: '36.412.908',
        guestEmail: 'sofia.martinez@serranoreservas.ar',
        guestPhone: '+54 9 351 482-9104',
        arrivalTime: '15:00',
        specialRequests: 'Viajamos con mascota mediana.',
        checkIn: addDaysISO(BASE_DATE, 4),
        checkOut: addDaysISO(BASE_DATE, 7),
        nights: 3,
        guestsCount: 4,
        pricePerNight: 145000,
        totalAmount: 435000,
        depositAmount: 87000,
        balanceAmount: 348000,
        paymentMethod: 'Transferencia bancaria',
        paymentStatus: 'sena_abonada',
        status: 'confirmada',
        createdAt: '2026-11-02T14:22:00Z',
      },
      {
        id: 'bkg-102',
        code: 'SR-2026-4195',
        accommodationId: 'acc-vista-lago',
        accommodationName: 'Hotel Vista al Lago',
        accommodationDestination: 'Villa Carlos Paz',
        accommodationImageKey: 'hotel_vista_lago',
        touristId: 'usr-turista-2',
        guestName: 'Lucas Pereyra',
        guestDni: '34.119.520',
        guestEmail: 'lucas.pereyra@gmail.com',
        guestPhone: '+54 9 341 592-1180',
        arrivalTime: '16:30',
        specialRequests: 'Piso alto con vista al lago.',
        checkIn: addDaysISO(BASE_DATE, 9),
        checkOut: addDaysISO(BASE_DATE, 12),
        nights: 3,
        guestsCount: 2,
        pricePerNight: 189000,
        totalAmount: 567000,
        depositAmount: 113400,
        balanceAmount: 453600,
        paymentMethod: 'Billetera virtual',
        paymentStatus: 'pago_completo',
        status: 'confirmada',
        createdAt: '2026-11-05T18:10:00Z',
      },
    ],
  };
}

function loadDb(): LocalDbState {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LocalDbState;
  } catch {
    // Ignore parse error
  }
  const initial = createInitialDb();
  saveDb(initial);
  return initial;
}

function saveDb(db: LocalDbState): void {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Ignore storage quota
  }
}

function sanitizeUser(u: StoredUser): User {
  const { password: _pw, ...safe } = u;
  return safe;
}

function getBookedDates(db: LocalDbState, accommodationId: string): string[] {
  const set = new Set<string>();
  for (const b of db.bookings) {
    if (b.accommodationId === accommodationId && b.status !== 'cancelada') {
      for (const d of getDatesBetween(b.checkIn, b.checkOut)) set.add(d);
    }
  }
  return Array.from(set).sort();
}

export const localFallbackStore = {
  login(email: string, password: string): { user: User } {
    const db = loadDb();
    const found = db.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!found || !found.active) {
      throw new Error('Credenciales inválidas o cuenta suspendida.');
    }
    return { user: sanitizeUser(found) };
  },

  loginDemo(role: UserRole): { user: User } {
    const db = loadDb();
    const found = db.users.find((u) => u.role === role && u.active);
    if (!found) throw new Error('Usuario de demostración no encontrado.');
    return { user: sanitizeUser(found) };
  },

  register(payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
    city: string;
  }): { user: User } {
    const db = loadDb();
    if (db.users.some((u) => u.email.toLowerCase() === payload.email.trim().toLowerCase())) {
      throw new Error('Ya existe una cuenta registrada con ese correo electrónico.');
    }
    const created: StoredUser = {
      id: `usr-${Date.now()}`,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      role: payload.role === 'propietario' ? 'propietario' : 'turista',
      phone: payload.phone,
      city: payload.city || 'Córdoba',
      active: true,
      createdAt: new Date().toISOString(),
    };
    db.users.push(created);
    saveDb(db);
    return { user: sanitizeUser(created) };
  },

  recoverPassword(_email: string): { sent: boolean; message: string } {
    return {
      sent: true,
      message:
        'Si el correo corresponde a una cuenta registrada en Serrano Reservas, enviamos las instrucciones de restablecimiento.',
    };
  },

  listAccommodations(
    filters?: Partial<SearchFilters> & { ownerId?: string; includeAllStatuses?: boolean }
  ): { accommodations: Accommodation[] } {
    const db = loadDb();
    let list = [...db.accommodations];
    if (filters?.ownerId) list = list.filter((a) => a.ownerId === filters.ownerId);
    else if (!filters?.includeAllStatuses) list = list.filter((a) => a.status === 'publicado');
    if (filters?.destination && filters.destination !== 'Todos') {
      list = list.filter((a) => a.destination === filters.destination);
    }
    if (filters?.type && filters.type !== 'Todos') {
      list = list.filter((a) => a.type === filters.type);
    }
    if (filters?.guests && filters.guests > 0) {
      list = list.filter((a) => a.maxGuests >= filters.guests!);
    }
    if (filters?.maxPrice && filters.maxPrice > 0) {
      list = list.filter((a) => a.pricePerNight <= filters.maxPrice!);
    }
    if (filters?.amenities && filters.amenities.length > 0) {
      list = list.filter((a) => filters.amenities!.every((am) => a.amenities.includes(am)));
    }
    if (filters?.checkIn && filters?.checkOut) {
      const requested = getDatesBetween(filters.checkIn, filters.checkOut);
      if (requested.length > 0) {
        list = list.filter((a) => {
          const unavailable = new Set([...a.blockedDates, ...getBookedDates(db, a.id)]);
          return requested.every((d) => !unavailable.has(d));
        });
      }
    }
    if (filters?.sortBy === 'price_asc') list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    else if (filters?.sortBy === 'price_desc') list.sort((a, b) => b.pricePerNight - a.pricePerNight);
    else if (filters?.sortBy === 'rating_desc') list.sort((a, b) => b.rating - a.rating);
    return { accommodations: list };
  },

  getAccommodation(idOrSlug: string): { accommodation: AccommodationDetail } {
    const db = loadDb();
    const acc = db.accommodations.find((a) => a.id === idOrSlug || a.slug === idOrSlug);
    if (!acc) throw new Error('Alojamiento no encontrado.');
    return {
      accommodation: {
        ...acc,
        reviews: db.reviews.filter((r) => r.accommodationId === acc.id),
        bookedDates: getBookedDates(db, acc.id),
      },
    };
  },

  createAccommodation(payload: {
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
  }): { accommodation: Accommodation } {
    const db = loadDb();
    const owner = db.users.find((u) => u.id === payload.ownerId);
    const created: Accommodation = {
      id: `acc-${Date.now()}`,
      slug: `alojamiento-${Date.now()}`,
      ownerId: payload.ownerId,
      ownerName: owner?.name || 'Propietario Serrano',
      name: payload.name,
      type: payload.type,
      destination: payload.destination,
      address: payload.address,
      zoneReference: payload.zoneReference,
      coordinates: { lat: -31.424, lng: -64.499, distanceCenterKm: 2.5, distanceLakeKm: 1.8 },
      shortDescription: payload.shortDescription,
      description: payload.description,
      pricePerNight: Number(payload.pricePerNight),
      maxGuests: Number(payload.maxGuests),
      bedrooms: payload.bedrooms || 1,
      bathrooms: payload.bathrooms || 1,
      amenities: payload.amenities,
      galleryKeys: ['cabanas_los_aromos', 'complejo_las_sierras', 'apart_costa_azul'],
      rating: 4.9,
      reviewCount: 1,
      status: 'publicado',
      verified: true,
      checkInTime: '14:00',
      checkOutTime: '10:00',
      blockedDates: [],
    };
    db.accommodations.unshift(created);
    saveDb(db);
    return { accommodation: created };
  },

  updateAccommodation(
    id: string,
    patch: Partial<{
      name: string;
      pricePerNight: number;
      maxGuests: number;
      shortDescription: string;
      status: AccommodationStatus;
      verified: boolean;
    }>
  ): { accommodation: Accommodation } {
    const db = loadDb();
    const acc = db.accommodations.find((a) => a.id === id);
    if (!acc) throw new Error('Alojamiento no encontrado.');
    Object.assign(acc, patch);
    saveDb(db);
    return { accommodation: acc };
  },

  toggleBlockedDate(id: string, date: string): { accommodation: AccommodationDetail } {
    const db = loadDb();
    const acc = db.accommodations.find((a) => a.id === id);
    if (!acc) throw new Error('Alojamiento no encontrado.');
    if (acc.blockedDates.includes(date)) {
      acc.blockedDates = acc.blockedDates.filter((d) => d !== date);
    } else {
      acc.blockedDates = [...acc.blockedDates, date].sort();
    }
    saveDb(db);
    return this.getAccommodation(id);
  },

  addReview(
    id: string,
    payload: { authorName: string; authorCity: string; rating: number; comment: string }
  ): { review: Review; accommodation: AccommodationDetail } {
    const db = loadDb();
    const review: Review = {
      id: `rev-${Date.now()}`,
      accommodationId: id,
      authorName: payload.authorName,
      authorCity: payload.authorCity,
      rating: payload.rating,
      stayDate: 'Noviembre 2026',
      comment: payload.comment,
      createdAt: new Date().toISOString(),
    };
    db.reviews.unshift(review);
    saveDb(db);
    return { review, ...this.getAccommodation(id) };
  },

  listBookings(filter?: { touristId?: string; ownerId?: string }): { bookings: Booking[] } {
    const db = loadDb();
    let list = [...db.bookings];
    if (filter?.touristId) list = list.filter((b) => b.touristId === filter.touristId);
    if (filter?.ownerId) {
      const ids = new Set(db.accommodations.filter((a) => a.ownerId === filter.ownerId).map((a) => a.id));
      list = list.filter((b) => ids.has(b.accommodationId));
    }
    return { bookings: list };
  },

  createBooking(payload: {
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
  }): { booking: Booking } {
    const db = loadDb();
    const acc = db.accommodations.find((a) => a.id === payload.accommodationId);
    if (!acc) throw new Error('Alojamiento no encontrado.');
    const nights = getDatesBetween(payload.checkIn, payload.checkOut).length;
    if (nights <= 0) throw new Error('Rango de fechas inválido.');
    const totalAmount = nights * acc.pricePerNight;
    const depositAmount = Math.round(totalAmount * 0.2);
    const created: Booking = {
      id: `bkg-${Date.now()}`,
      code: `SR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      accommodationId: acc.id,
      accommodationName: acc.name,
      accommodationDestination: acc.destination,
      accommodationImageKey: acc.galleryKeys[0] || 'cabanas_los_aromos',
      touristId: payload.touristId || 'usr-guest',
      guestName: payload.guestName,
      guestDni: payload.guestDni,
      guestEmail: payload.guestEmail,
      guestPhone: payload.guestPhone,
      arrivalTime: payload.arrivalTime,
      specialRequests: payload.specialRequests,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      nights,
      guestsCount: payload.guestsCount,
      pricePerNight: acc.pricePerNight,
      totalAmount,
      depositAmount,
      balanceAmount: totalAmount - depositAmount,
      paymentMethod: payload.paymentMethod,
      paymentStatus: 'sena_abonada',
      status: 'confirmada',
      createdAt: new Date().toISOString(),
    };
    db.bookings.unshift(created);
    saveDb(db);
    return { booking: created };
  },

  updateBooking(
    id: string,
    patch: { status?: BookingStatus; paymentStatus?: PaymentStatus }
  ): { booking: Booking } {
    const db = loadDb();
    const b = db.bookings.find((item) => item.id === id);
    if (!b) throw new Error('Reserva no encontrada.');
    if (patch.status) b.status = patch.status;
    if (patch.paymentStatus) b.paymentStatus = patch.paymentStatus;
    saveDb(db);
    return { booking: b };
  },

  getAdminOverview(): { overview: AdminOverview } {
    const db = loadDb();
    const activeBookings = db.bookings.filter((b) => b.status !== 'cancelada');
    const estimatedRevenueARS = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const estimatedDepositsARS = activeBookings.reduce((sum, b) => sum + b.depositAmount, 0);
    const destinations: DestinationName[] = [
      'Villa Carlos Paz',
      'Tanti',
      'Cabalango',
      'Cuesta Blanca',
      'San Antonio de Arredondo',
    ];
    return {
      overview: {
        totalPublishedAccommodations: db.accommodations.filter((a) => a.status === 'publicado').length,
        totalAccommodations: db.accommodations.length,
        totalUsers: db.users.length,
        totalBookings: db.bookings.length,
        pendingBookings: db.bookings.filter((b) => b.status === 'pendiente').length,
        estimatedRevenueARS,
        estimatedDepositsARS,
        occupancyRatePercent: 74,
        monthlyMetrics: [
          { month: 'Jul', bookings: 18, revenueARS: 5420000 },
          { month: 'Ago', bookings: 14, revenueARS: 4180000 },
          { month: 'Sep', bookings: 21, revenueARS: 6390000 },
          { month: 'Oct', bookings: 27, revenueARS: 8140000 },
          { month: 'Nov', bookings: 32, revenueARS: 9850000 + estimatedRevenueARS },
          { month: 'Dic (Est.)', bookings: 44, revenueARS: 14200000 },
        ],
        destinationBreakdown: destinations.map((dest) => ({
          destination: dest,
          accommodations: db.accommodations.filter((a) => a.destination === dest).length,
          bookings: db.bookings.filter((b) => b.accommodationDestination === dest).length,
        })),
      },
    };
  },

  listUsers(): { users: User[] } {
    const db = loadDb();
    return { users: db.users.map(sanitizeUser) };
  },

  updateUser(id: string, patch: { active?: boolean; role?: UserRole }): { user: User } {
    const db = loadDb();
    const u = db.users.find((item) => item.id === id);
    if (!u) throw new Error('Usuario no encontrado.');
    if (typeof patch.active === 'boolean') u.active = patch.active;
    if (patch.role) u.role = patch.role;
    saveDb(db);
    return { user: sanitizeUser(u) };
  },
};
