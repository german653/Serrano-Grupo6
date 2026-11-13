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
  User,
  UserRole,
} from '../../src/types/index.ts';

interface StoredUser extends User {
  password: string;
}

const getDatesBetween = (checkIn: string, checkOut: string): string[] => {
  const dates: string[] = [];
  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return dates;
  }
  const cursor = new Date(start);
  while (cursor < end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
};

const addDaysFromBase = (baseIso: string, offsetDays: number): string => {
  const d = new Date(`${baseIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

// Baseline date anchored around mid-November 2026 for realistic season occupancy
const BASE_DATE = '2026-11-13';

class SerranoDataStore {
  private users: StoredUser[] = [
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
      id: 'usr-turista-3',
      name: 'Camila Benítez',
      email: 'camila.benitez@outlook.com',
      password: 'demo1234',
      role: 'turista',
      phone: '+54 9 11 6201-4432',
      city: 'CABA, Buenos Aires',
      active: true,
      createdAt: '2026-09-22T18:05:00Z',
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
  ];

  private accommodations: Accommodation[] = [
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
      coordinates: {
        lat: -31.4328,
        lng: -64.5082,
        distanceCenterKm: 2.4,
        distanceLakeKm: 1.9,
      },
      shortDescription:
        'Cabañas de piedra y madera nativa rodeadas de aromos en flor, con pileta climatizada y vista abierta a las sierras.',
      description:
        'Ubicadas en una zona residencial tranquila de Villa Carlos Paz, Cabañas Los Aromos combina arquitectura serrana en piedra y quebracho con confort moderno. Cada unidad cuenta con deck privado, asador individual techado, cocina equipada completa, hogar a leña y ventanales orientados al cordón montañoso. El parque arbolado de 3.200 m² ofrece pileta con solárium húmedo y juegos de madera para chicos.',
      pricePerNight: 145000,
      maxGuests: 6,
      bedrooms: 2,
      bathrooms: 2,
      amenities: [
        'Pileta',
        'Parrilla',
        'Wi-Fi',
        'Estacionamiento',
        'Aire acondicionado',
        'Ropa blanca',
        'Pet friendly',
      ],
      galleryKeys: ['cabanas_los_aromos', 'complejo_las_sierras', 'apart_costa_azul'],
      rating: 4.9,
      reviewCount: 48,
      status: 'publicado',
      verified: true,
      checkInTime: '14:00',
      checkOutTime: '10:00',
      blockedDates: [addDaysFromBase(BASE_DATE, 18), addDaysFromBase(BASE_DATE, 19)],
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
      coordinates: {
        lat: -31.4109,
        lng: -64.4915,
        distanceCenterKm: 1.8,
        distanceLakeKm: 0.1,
      },
      shortDescription:
        'Hotel boutique frente al Lago San Roque con piscina infinita, terrazas panorámicas y desayuno artesanal incluido.',
      description:
        'Con acceso directo al paseo costanero, Hotel Vista al Lago ofrece habitaciones superiores y suites con balcón privado hacia el espejo de agua del San Roque. Incluye desayuno serrano con pastelería casera, pileta climatizada en terraza panorámica, gimnasio, servicio de conserjería turística y cochera cubierta.',
      pricePerNight: 189000,
      maxGuests: 4,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [
        'Vista al lago',
        'Pileta',
        'Desayuno',
        'Wi-Fi',
        'Estacionamiento',
        'Aire acondicionado',
        'Ropa blanca',
      ],
      galleryKeys: ['hotel_vista_lago', 'apart_costa_azul', 'hero_carlos_paz'],
      rating: 4.8,
      reviewCount: 72,
      status: 'publicado',
      verified: true,
      checkInTime: '15:00',
      checkOutTime: '10:30',
      blockedDates: [addDaysFromBase(BASE_DATE, 25)],
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
      coordinates: {
        lat: -31.4822,
        lng: -64.5271,
        distanceCenterKm: 8.2,
        distanceLakeKm: 7.5,
      },
      shortDescription:
        'Amplio complejo familiar con unidades independientes, parque parquizado, deck solárium y quinchos compartidos.',
      description:
        'Pensado para familias y grupos que buscan descanso junto al río San Antonio sin alejarse de la cartelera teatral y gastronómica de Carlos Paz. Complejo Las Sierras dispone de 8 unidades equipadas, piscina de 14 metros con cerco perimetral, quinchos con parrillas, cancha de tejo y Wi-Fi de fibra óptica.',
      pricePerNight: 128000,
      maxGuests: 5,
      bedrooms: 2,
      bathrooms: 1,
      amenities: [
        'Pileta',
        'Parrilla',
        'Wi-Fi',
        'Estacionamiento',
        'Aire acondicionado',
        'Ropa blanca',
      ],
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
      coordinates: {
        lat: -31.3568,
        lng: -64.5872,
        distanceCenterKm: 14.5,
        distanceLakeKm: 9.8,
      },
      shortDescription:
        'Cabañas luminosas con galería de madera, asador criollo techado y senderos privados entre flora autóctona.',
      description:
        'Enclavadas en las lomas soleadas de Tanti, Cabañas del Sol ofrece una experiencia de desconexión total. Galería amplia con hamaca paraguaya, asador tradicional de ladrillo, cocina equipada, calefacción tiro balanceado y acceso directo a senderos serranos. Ideal para escapadas de fin de semana largo.',
      pricePerNight: 112000,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      amenities: [
        'Parrilla',
        'Wi-Fi',
        'Estacionamiento',
        'Pet friendly',
        'Ropa blanca',
      ],
      galleryKeys: ['cabanas_del_sol', 'destino_rio_serrano', 'cabanas_los_aromos'],
      rating: 4.9,
      reviewCount: 54,
      status: 'publicado',
      verified: true,
      checkInTime: '13:30',
      checkOutTime: '10:00',
      blockedDates: [addDaysFromBase(BASE_DATE, 12), addDaysFromBase(BASE_DATE, 13)],
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
      coordinates: {
        lat: -31.3941,
        lng: -64.4785,
        distanceCenterKm: 3.1,
        distanceLakeKm: 0.25,
      },
      shortDescription:
        'Suites y departamentos de diseño contemporáneo con ventanales de piso a techo y vista panorámica al lago.',
      description:
        'Apart Costa Azul combina la independencia de un departamento equipado con servicio hotelero diario. Sus unidades destacan por la carpintería de roble, blanquería de percal, kitchenette completa, escritorio para trabajo remoto con internet simétrico y balcón terraza frente al Lago San Roque.',
      pricePerNight: 134000,
      maxGuests: 4,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [
        'Vista al lago',
        'Wi-Fi',
        'Estacionamiento',
        'Aire acondicionado',
        'Desayuno',
        'Ropa blanca',
      ],
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
      coordinates: {
        lat: -31.4911,
        lng: -64.5734,
        distanceCenterKm: 16.0,
        distanceLakeKm: 13.5,
      },
      shortDescription:
        'Posada boutique de piedra en lo alto del valle con restaurante de autor, cava serrana y atención personalizada.',
      description:
        'Suspendida sobre las quebradas de Cuesta Blanca, Posada El Mirador invita a bajar el ritmo con vistas ininterrumpidas al valle del río San Antonio. Cuenta con solo 6 habitaciones exclusivas, terraza de atardeceres con fogonero, desayuno regional casero y asesoramiento para caminatas por la reserva.',
      pricePerNight: 156000,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [
        'Desayuno',
        'Wi-Fi',
        'Estacionamiento',
        'Aire acondicionado',
        'Ropa blanca',
      ],
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
      coordinates: {
        lat: -31.3895,
        lng: -64.5588,
        distanceCenterKm: 11.4,
        distanceLakeKm: 8.9,
      },
      shortDescription:
        'Cabañas de descanso frente a las aguas cristalinas de Cabalango, con deck de madera, parrilla y silencio serrano.',
      description:
        'A pasos del curso natural del arroyo Los Chorrillos, Refugio del Arroyo ofrece cabañas amplias con bajada directa al río, parque de sauces nativos, parrilla individual y estacionamiento techado. Un punto estratégico entre Villa Carlos Paz y Tanti para disfrutar de naturaleza pura.',
      pricePerNight: 118000,
      maxGuests: 5,
      bedrooms: 2,
      bathrooms: 1,
      amenities: [
        'Parrilla',
        'Wi-Fi',
        'Estacionamiento',
        'Pet friendly',
        'Ropa blanca',
      ],
      galleryKeys: ['destino_rio_serrano', 'cabanas_del_sol', 'complejo_las_sierras'],
      rating: 4.8,
      reviewCount: 27,
      status: 'publicado',
      verified: true,
      checkInTime: '14:00',
      checkOutTime: '10:00',
      blockedDates: [],
    },
  ];

  private reviews: Review[] = [
    {
      id: 'rev-1',
      accommodationId: 'acc-los-aromos',
      authorName: 'Luciano Ferreyra',
      authorCity: 'Rosario, Santa Fe',
      rating: 5,
      stayDate: 'Octubre 2026',
      comment:
        'Excelente atención de Martín desde que llegamos. La cabaña impecable, la pileta súper cuidada y la vista a las sierras al atardecer es impagable.',
      createdAt: '2026-10-20T16:30:00Z',
    },
    {
      id: 'rev-2',
      accommodationId: 'acc-los-aromos',
      authorName: 'Mariana Gómez',
      authorCity: 'Buenos Aires',
      rating: 5,
      stayDate: 'Septiembre 2026',
      comment:
        'Fuimos con nuestra perra y los chicos. El parque cerrado da mucha tranquilidad y la parrilla techada la usamos todas las noches.',
      createdAt: '2026-09-14T11:10:00Z',
    },
    {
      id: 'rev-3',
      accommodationId: 'acc-vista-lago',
      authorName: 'Federico Quiroga',
      authorCity: 'Mendoza',
      rating: 5,
      stayDate: 'Octubre 2026',
      comment:
        'Desayunar mirando el Lago San Roque no tiene precio. Muy buena ubicación para salir a caminar por la costanera sin mover el auto.',
      createdAt: '2026-10-12T10:40:00Z',
    },
    {
      id: 'rev-4',
      accommodationId: 'acc-el-mirador',
      authorName: 'Julieta Navarro',
      authorCity: 'Córdoba Capital',
      rating: 5,
      stayDate: 'Noviembre 2026',
      comment:
        'Un lugar soñado en Cuesta Blanca. Silencio absoluto, comida casera exquisita en la terraza y habitaciones cálidas.',
      createdAt: '2026-11-04T19:00:00Z',
    },
    {
      id: 'rev-5',
      accommodationId: 'acc-del-sol',
      authorName: 'Sebastián Díaz',
      authorCity: 'Santa Fe',
      rating: 5,
      stayDate: 'Octubre 2026',
      comment:
        'Muy buena relación precio-calidad en Tanti. Todo tal cual las fotos, Wi-Fi estable y un quincho comodísimo.',
      createdAt: '2026-10-28T13:25:00Z',
    },
    {
      id: 'rev-6',
      accommodationId: 'acc-costa-azul',
      authorName: 'Paula Roldán',
      authorCity: 'Río Cuarto, Córdoba',
      rating: 5,
      stayDate: 'Noviembre 2026',
      comment:
        'Apart moderno, luminoso y súper limpio. Pude trabajar un día desde el balcón viendo el lago antes de empezar el finde.',
      createdAt: '2026-11-08T15:10:00Z',
    },
  ];

  private bookings: Booking[] = [
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
      checkIn: addDaysFromBase(BASE_DATE, 4),
      checkOut: addDaysFromBase(BASE_DATE, 7),
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
      specialRequests: 'Piso alto con vista al lago si es posible.',
      checkIn: addDaysFromBase(BASE_DATE, 9),
      checkOut: addDaysFromBase(BASE_DATE, 12),
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
    {
      id: 'bkg-103',
      code: 'SR-2026-4231',
      accommodationId: 'acc-las-sierras',
      accommodationName: 'Complejo Las Sierras',
      accommodationDestination: 'San Antonio de Arredondo',
      accommodationImageKey: 'complejo_las_sierras',
      touristId: 'usr-turista-3',
      guestName: 'Camila Benítez',
      guestDni: '38.772.104',
      guestEmail: 'camila.benitez@outlook.com',
      guestPhone: '+54 9 11 6201-4432',
      arrivalTime: '14:00',
      specialRequests: 'Solicitamos cuna practicuna.',
      checkIn: addDaysFromBase(BASE_DATE, 14),
      checkOut: addDaysFromBase(BASE_DATE, 18),
      nights: 4,
      guestsCount: 5,
      pricePerNight: 128000,
      totalAmount: 512000,
      depositAmount: 102400,
      balanceAmount: 409600,
      paymentMethod: 'Transferencia bancaria',
      paymentStatus: 'pendiente',
      status: 'pendiente',
      createdAt: '2026-11-11T09:45:00Z',
    },
    {
      id: 'bkg-104',
      code: 'SR-2026-4288',
      accommodationId: 'acc-costa-azul',
      accommodationName: 'Apart Costa Azul',
      accommodationDestination: 'Villa Carlos Paz',
      accommodationImageKey: 'apart_costa_azul',
      touristId: 'usr-turista-1',
      guestName: 'Sofía Martínez',
      guestDni: '36.412.908',
      guestEmail: 'sofia.martinez@serranoreservas.ar',
      guestPhone: '+54 9 351 482-9104',
      arrivalTime: '15:30',
      specialRequests: 'Check-in temprano si hay disponibilidad.',
      checkIn: addDaysFromBase(BASE_DATE, 21),
      checkOut: addDaysFromBase(BASE_DATE, 24),
      nights: 3,
      guestsCount: 2,
      pricePerNight: 134000,
      totalAmount: 402000,
      depositAmount: 80400,
      balanceAmount: 321600,
      paymentMethod: 'Billetera virtual',
      paymentStatus: 'sena_abonada',
      status: 'confirmada',
      createdAt: '2026-11-12T11:05:00Z',
    },
    {
      id: 'bkg-105',
      code: 'SR-2026-3912',
      accommodationId: 'acc-el-mirador',
      accommodationName: 'Posada El Mirador',
      accommodationDestination: 'Cuesta Blanca',
      accommodationImageKey: 'posada_el_mirador',
      touristId: 'usr-turista-2',
      guestName: 'Lucas Pereyra',
      guestDni: '34.119.520',
      guestEmail: 'lucas.pereyra@gmail.com',
      guestPhone: '+54 9 341 592-1180',
      arrivalTime: '17:00',
      specialRequests: 'Cena en terraza para el sábado.',
      checkIn: '2026-10-16',
      checkOut: '2026-10-18',
      nights: 2,
      guestsCount: 2,
      pricePerNight: 156000,
      totalAmount: 312000,
      depositAmount: 62400,
      balanceAmount: 0,
      paymentMethod: 'Transferencia bancaria',
      paymentStatus: 'pago_completo',
      status: 'completada',
      createdAt: '2026-10-01T12:00:00Z',
    },
  ];

  private sanitizeUser(user: StoredUser): User {
    const { password: _pw, ...safeUser } = user;
    return safeUser;
  }

  login(email: string, password: string): User | null {
    const found = this.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!found || !found.active) return null;
    return this.sanitizeUser(found);
  }

  loginDemo(role: UserRole): User | null {
    const found = this.users.find((u) => u.role === role && u.active);
    return found ? this.sanitizeUser(found) : null;
  }

  register(input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
    city: string;
  }): { user?: User; error?: string } {
    const exists = this.users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase());
    if (exists) {
      return { error: 'Ya existe una cuenta registrada con ese correo electrónico.' };
    }
    const safeRole: UserRole = input.role === 'administrador' ? 'turista' : input.role;
    const newUser: StoredUser = {
      id: `usr-${Date.now()}`,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      role: safeRole,
      phone: input.phone.trim(),
      city: input.city.trim() || 'Córdoba',
      active: true,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return { user: this.sanitizeUser(newUser) };
  }

  recoverPassword(email: string): boolean {
    return this.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  listUsers(): User[] {
    return this.users.map((u) => this.sanitizeUser(u));
  }

  updateUser(id: string, patch: { active?: boolean; role?: UserRole }): User | null {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    if (typeof patch.active === 'boolean') user.active = patch.active;
    if (patch.role) user.role = patch.role;
    return this.sanitizeUser(user);
  }

  getBookedDatesForAccommodation(accommodationId: string): string[] {
    const set = new Set<string>();
    for (const b of this.bookings) {
      if (b.accommodationId === accommodationId && b.status !== 'cancelada') {
        for (const d of getDatesBetween(b.checkIn, b.checkOut)) {
          set.add(d);
        }
      }
    }
    return Array.from(set).sort();
  }

  isDateRangeAvailable(accommodationId: string, checkIn: string, checkOut: string): boolean {
    const acc = this.accommodations.find((a) => a.id === accommodationId);
    if (!acc || acc.status !== 'publicado') return false;
    const requested = getDatesBetween(checkIn, checkOut);
    if (requested.length === 0) return false;
    const blocked = new Set([...acc.blockedDates, ...this.getBookedDatesForAccommodation(accommodationId)]);
    return requested.every((d) => !blocked.has(d));
  }

  listAccommodations(filters?: {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    type?: string;
    amenities?: string[];
    sortBy?: string;
    ownerId?: string;
    includeAllStatuses?: boolean;
  }): Accommodation[] {
    let list = [...this.accommodations];

    if (filters?.ownerId) {
      list = list.filter((a) => a.ownerId === filters.ownerId);
    } else if (!filters?.includeAllStatuses) {
      list = list.filter((a) => a.status === 'publicado');
    }

    if (filters?.destination && filters.destination !== 'Todos') {
      list = list.filter((a) => a.destination === filters.destination);
    }

    if (filters?.type && filters.type !== 'Todos') {
      list = list.filter((a) => a.type === filters.type);
    }

    if (filters?.guests && filters.guests > 0) {
      list = list.filter((a) => a.maxGuests >= filters.guests!);
    }

    if (typeof filters?.minPrice === 'number' && filters.minPrice > 0) {
      list = list.filter((a) => a.pricePerNight >= filters.minPrice!);
    }

    if (typeof filters?.maxPrice === 'number' && filters.maxPrice > 0) {
      list = list.filter((a) => a.pricePerNight <= filters.maxPrice!);
    }

    if (filters?.amenities && filters.amenities.length > 0) {
      list = list.filter((a) => filters.amenities!.every((am) => a.amenities.includes(am)));
    }

    if (filters?.checkIn && filters?.checkOut) {
      list = list.filter((a) => this.isDateRangeAvailable(a.id, filters.checkIn!, filters.checkOut!));
    }

    switch (filters?.sortBy) {
      case 'price_asc':
        list.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case 'price_desc':
        list.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case 'rating_desc':
        list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      default:
        list.sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);
    }

    return list;
  }

  getAccommodationDetail(idOrSlug: string): AccommodationDetail | null {
    const acc = this.accommodations.find((a) => a.id === idOrSlug || a.slug === idOrSlug);
    if (!acc) return null;
    const accReviews = this.reviews
      .filter((r) => r.accommodationId === acc.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return {
      ...acc,
      reviews: accReviews,
      bookedDates: this.getBookedDatesForAccommodation(acc.id),
    };
  }

  createAccommodation(input: {
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
  }): Accommodation {
    const owner = this.users.find((u) => u.id === input.ownerId);
    const slugBase = input.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const defaultGalleryByType: Record<Accommodation['type'], string[]> = {
      Cabaña: ['cabanas_los_aromos', 'cabanas_del_sol', 'destino_rio_serrano'],
      Hotel: ['hotel_vista_lago', 'apart_costa_azul', 'hero_carlos_paz'],
      Complejo: ['complejo_las_sierras', 'cabanas_del_sol', 'destino_rio_serrano'],
      Apart: ['apart_costa_azul', 'hotel_vista_lago', 'hero_carlos_paz'],
      Posada: ['posada_el_mirador', 'destino_rio_serrano', 'cabanas_los_aromos'],
    };

    const created: Accommodation = {
      id: `acc-${Date.now()}`,
      slug: `${slugBase}-${Date.now().toString().slice(-4)}`,
      ownerId: input.ownerId,
      ownerName: owner?.name || 'Propietario Serrano',
      name: input.name.trim(),
      type: input.type,
      destination: input.destination,
      address: input.address.trim(),
      zoneReference: input.zoneReference.trim() || `En ${input.destination}, Sierras de Córdoba`,
      coordinates: {
        lat: -31.424,
        lng: -64.499,
        distanceCenterKm: 2.5,
        distanceLakeKm: 1.8,
      },
      shortDescription: input.shortDescription.trim(),
      description: input.description.trim(),
      pricePerNight: Number(input.pricePerNight),
      maxGuests: Number(input.maxGuests),
      bedrooms: Number(input.bedrooms) || 1,
      bathrooms: Number(input.bathrooms) || 1,
      amenities: input.amenities,
      galleryKeys: defaultGalleryByType[input.type],
      rating: 4.9,
      reviewCount: 1,
      status: 'publicado',
      verified: true,
      checkInTime: '14:00',
      checkOutTime: '10:00',
      blockedDates: [],
    };
    this.accommodations.unshift(created);
    return created;
  }

  updateAccommodation(
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
  ): Accommodation | null {
    const acc = this.accommodations.find((a) => a.id === id);
    if (!acc) return null;
    if (patch.name !== undefined) acc.name = patch.name.trim();
    if (patch.pricePerNight !== undefined) acc.pricePerNight = Math.max(1000, Number(patch.pricePerNight));
    if (patch.maxGuests !== undefined) acc.maxGuests = Math.max(1, Number(patch.maxGuests));
    if (patch.shortDescription !== undefined) acc.shortDescription = patch.shortDescription;
    if (patch.description !== undefined) acc.description = patch.description;
    if (patch.address !== undefined) acc.address = patch.address;
    if (patch.zoneReference !== undefined) acc.zoneReference = patch.zoneReference;
    if (patch.amenities !== undefined) acc.amenities = patch.amenities;
    if (patch.status !== undefined) acc.status = patch.status;
    if (patch.verified !== undefined) acc.verified = patch.verified;
    return acc;
  }

  toggleBlockedDate(accommodationId: string, isoDate: string): AccommodationDetail | null {
    const acc = this.accommodations.find((a) => a.id === accommodationId);
    if (!acc) return null;
    const booked = this.getBookedDatesForAccommodation(accommodationId);
    if (booked.includes(isoDate)) {
      return this.getAccommodationDetail(accommodationId);
    }
    if (acc.blockedDates.includes(isoDate)) {
      acc.blockedDates = acc.blockedDates.filter((d) => d !== isoDate);
    } else {
      acc.blockedDates = [...acc.blockedDates, isoDate].sort();
    }
    return this.getAccommodationDetail(accommodationId);
  }

  addReview(input: {
    accommodationId: string;
    authorName: string;
    authorCity: string;
    rating: number;
    comment: string;
  }): Review | null {
    const acc = this.accommodations.find((a) => a.id === input.accommodationId);
    if (!acc) return null;
    const review: Review = {
      id: `rev-${Date.now()}`,
      accommodationId: acc.id,
      authorName: input.authorName,
      authorCity: input.authorCity || 'Argentina',
      rating: Math.min(5, Math.max(1, Math.round(input.rating))),
      stayDate: 'Noviembre 2026',
      comment: input.comment.trim(),
      createdAt: new Date().toISOString(),
    };
    this.reviews.unshift(review);
    const accReviews = this.reviews.filter((r) => r.accommodationId === acc.id);
    acc.reviewCount = accReviews.length;
    acc.rating = Number(
      (accReviews.reduce((sum, r) => sum + r.rating, 0) / accReviews.length).toFixed(1)
    );
    return review;
  }

  listBookings(filter?: { touristId?: string; ownerId?: string }): Booking[] {
    let list = [...this.bookings];
    if (filter?.touristId) {
      list = list.filter((b) => b.touristId === filter.touristId);
    }
    if (filter?.ownerId) {
      const ownerAccIds = new Set(
        this.accommodations.filter((a) => a.ownerId === filter.ownerId).map((a) => a.id)
      );
      list = list.filter((b) => ownerAccIds.has(b.accommodationId));
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  createBooking(input: {
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
  }): { booking?: Booking; error?: string } {
    const acc = this.accommodations.find((a) => a.id === input.accommodationId);
    if (!acc) {
      return { error: 'El alojamiento seleccionado no fue encontrado.' };
    }
    if (input.guestsCount > acc.maxGuests) {
      return {
        error: `La capacidad máxima de ${acc.name} es de ${acc.maxGuests} huéspedes.`,
      };
    }
    const nightsList = getDatesBetween(input.checkIn, input.checkOut);
    if (nightsList.length <= 0) {
      return { error: 'La fecha de salida debe ser posterior a la fecha de ingreso.' };
    }
    if (!this.isDateRangeAvailable(acc.id, input.checkIn, input.checkOut)) {
      return {
        error:
          'Algunas de las fechas seleccionadas ya no están disponibles. Por favor elegí otro rango.',
      };
    }

    const nights = nightsList.length;
    const totalAmount = nights * acc.pricePerNight;
    const depositAmount = Math.round(totalAmount * 0.2);
    const balanceAmount = totalAmount - depositAmount;
    const randomDigits = Math.floor(1000 + Math.random() * 9000);

    const newBooking: Booking = {
      id: `bkg-${Date.now()}`,
      code: `SR-2026-${randomDigits}`,
      accommodationId: acc.id,
      accommodationName: acc.name,
      accommodationDestination: acc.destination,
      accommodationImageKey: acc.galleryKeys[0] || 'cabanas_los_aromos',
      touristId: input.touristId || 'usr-guest',
      guestName: input.guestName.trim(),
      guestDni: input.guestDni.trim(),
      guestEmail: input.guestEmail.trim(),
      guestPhone: input.guestPhone.trim(),
      arrivalTime: input.arrivalTime || '14:00',
      specialRequests: input.specialRequests.trim(),
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      nights,
      guestsCount: input.guestsCount,
      pricePerNight: acc.pricePerNight,
      totalAmount,
      depositAmount,
      balanceAmount,
      paymentMethod: input.paymentMethod,
      paymentStatus: 'sena_abonada',
      status: 'confirmada',
      createdAt: new Date().toISOString(),
    };

    this.bookings.unshift(newBooking);
    return { booking: newBooking };
  }

  updateBooking(
    id: string,
    patch: { status?: BookingStatus; paymentStatus?: PaymentStatus }
  ): Booking | null {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) return null;
    if (patch.status) booking.status = patch.status;
    if (patch.paymentStatus) {
      booking.paymentStatus = patch.paymentStatus;
      if (patch.paymentStatus === 'pago_completo') {
        booking.balanceAmount = 0;
      }
    }
    return booking;
  }

  getAdminOverview(): AdminOverview {
    const activeBookings = this.bookings.filter((b) => b.status !== 'cancelada');
    const estimatedRevenueARS = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const estimatedDepositsARS = activeBookings.reduce((sum, b) => sum + b.depositAmount, 0);

    const destinations: DestinationName[] = [
      'Villa Carlos Paz',
      'Tanti',
      'Cabalango',
      'Cuesta Blanca',
      'San Antonio de Arredondo',
    ];

    const destinationBreakdown = destinations.map((dest) => ({
      destination: dest,
      accommodations: this.accommodations.filter((a) => a.destination === dest).length,
      bookings: this.bookings.filter((b) => b.accommodationDestination === dest).length,
    }));

    return {
      totalPublishedAccommodations: this.accommodations.filter((a) => a.status === 'publicado')
        .length,
      totalAccommodations: this.accommodations.length,
      totalUsers: this.users.length,
      totalBookings: this.bookings.length,
      pendingBookings: this.bookings.filter((b) => b.status === 'pendiente').length,
      estimatedRevenueARS,
      estimatedDepositsARS,
      occupancyRatePercent: 74,
      monthlyMetrics: [
        { month: 'Jul', bookings: 18, revenueARS: 5420000 },
        { month: 'Ago', bookings: 14, revenueARS: 4180000 },
        { month: 'Sep', bookings: 21, revenueARS: 6390000 },
        { month: 'Oct', bookings: 27, revenueARS: 8140000 },
        { month: 'Nov', bookings: 32 + Math.max(0, this.bookings.length - 5), revenueARS: 9850000 + estimatedRevenueARS },
        { month: 'Dic (Est.)', bookings: 44, revenueARS: 14200000 },
      ],
      destinationBreakdown,
    };
  }
}

export const dataStore = new SerranoDataStore();
