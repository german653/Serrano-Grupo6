import { Router } from 'express';
import { dataStore } from '../repositories/dataStore.ts';
import type {
  AccommodationStatus,
  BookingStatus,
  PaymentStatus,
  UserRole,
} from '../../src/types/index.ts';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'serrano-reservas-api', region: 'cordoba-ar' });
});

// --- AUTHENTICATION ---
apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Ingresá tu correo y contraseña.' });
  }
  const user = dataStore.login(String(email), String(password));
  if (!user) {
    return res
      .status(401)
      .json({ error: 'Credenciales inválidas o cuenta suspendida. Verificá los datos.' });
  }
  res.json({ user });
});

apiRouter.post('/auth/demo', (req, res) => {
  const { role } = req.body ?? {};
  const validRoles: UserRole[] = ['turista', 'propietario', 'administrador'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Rol de demostración inválido.' });
  }
  const user = dataStore.loginDemo(role);
  if (!user) {
    return res.status(404).json({ error: 'No se encontró un usuario activo para este rol.' });
  }
  res.json({ user });
});

apiRouter.post('/auth/register', (req, res) => {
  const { name, email, password, role, phone, city } = req.body ?? {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Completá nombre, correo y contraseña.' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }
  const result = dataStore.register({
    name: String(name),
    email: String(email),
    password: String(password),
    role: role === 'propietario' ? 'propietario' : 'turista',
    phone: String(phone || ''),
    city: String(city || 'Córdoba'),
  });
  if (result.error) {
    return res.status(409).json({ error: result.error });
  }
  res.status(201).json({ user: result.user });
});

apiRouter.post('/auth/recover', (req, res) => {
  const { email } = req.body ?? {};
  if (!email || !String(email).includes('@')) {
    return res.status(400).json({ error: 'Ingresá un correo electrónico válido.' });
  }
  const exists = dataStore.recoverPassword(String(email));
  res.json({
    sent: true,
    knownAccount: exists,
    message:
      'Si el correo corresponde a una cuenta registrada en Serrano Reservas, enviamos las instrucciones de restablecimiento.',
  });
});

// --- ACCOMMODATIONS ---
apiRouter.get('/accommodations', (req, res) => {
  const {
    destination,
    checkIn,
    checkOut,
    guests,
    minPrice,
    maxPrice,
    type,
    amenities,
    sortBy,
    ownerId,
    includeAllStatuses,
  } = req.query;

  const parsedAmenities =
    typeof amenities === 'string' && amenities.trim().length > 0
      ? amenities.split(',').map((s) => s.trim())
      : undefined;

  const items = dataStore.listAccommodations({
    destination: typeof destination === 'string' ? destination : undefined,
    checkIn: typeof checkIn === 'string' ? checkIn : undefined,
    checkOut: typeof checkOut === 'string' ? checkOut : undefined,
    guests: guests ? Number(guests) : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    type: typeof type === 'string' ? type : undefined,
    amenities: parsedAmenities,
    sortBy: typeof sortBy === 'string' ? sortBy : undefined,
    ownerId: typeof ownerId === 'string' ? ownerId : undefined,
    includeAllStatuses: includeAllStatuses === 'true',
  });

  res.json({ accommodations: items });
});

apiRouter.get('/accommodations/:id', (req, res) => {
  const detail = dataStore.getAccommodationDetail(req.params.id);
  if (!detail) {
    return res.status(404).json({ error: 'Alojamiento no encontrado.' });
  }
  res.json({ accommodation: detail });
});

apiRouter.post('/accommodations', (req, res) => {
  const body = req.body ?? {};
  if (!body.ownerId || !body.name || !body.destination || !body.pricePerNight) {
    return res
      .status(400)
      .json({ error: 'Faltan datos obligatorios para publicar el alojamiento.' });
  }
  const created = dataStore.createAccommodation(body);
  res.status(201).json({ accommodation: created });
});

apiRouter.patch('/accommodations/:id', (req, res) => {
  const body = req.body ?? {};
  const validStatuses: AccommodationStatus[] = ['publicado', 'revision', 'pausado'];
  if (body.status && !validStatuses.includes(body.status)) {
    return res.status(400).json({ error: 'Estado de publicación inválido.' });
  }
  const updated = dataStore.updateAccommodation(req.params.id, body);
  if (!updated) {
    return res.status(404).json({ error: 'Alojamiento no encontrado.' });
  }
  res.json({ accommodation: updated });
});

apiRouter.post('/accommodations/:id/availability', (req, res) => {
  const { date } = req.body ?? {};
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    return res.status(400).json({ error: 'Fecha inválida (formato esperado YYYY-MM-DD).' });
  }
  const updated = dataStore.toggleBlockedDate(req.params.id, String(date));
  if (!updated) {
    return res.status(404).json({ error: 'Alojamiento no encontrado.' });
  }
  res.json({ accommodation: updated });
});

apiRouter.post('/accommodations/:id/reviews', (req, res) => {
  const { authorName, authorCity, rating, comment } = req.body ?? {};
  if (!authorName || !comment || !rating) {
    return res.status(400).json({ error: 'Completá calificación y comentario.' });
  }
  const review = dataStore.addReview({
    accommodationId: req.params.id,
    authorName: String(authorName),
    authorCity: String(authorCity || 'Córdoba'),
    rating: Number(rating),
    comment: String(comment),
  });
  if (!review) {
    return res.status(404).json({ error: 'Alojamiento no encontrado.' });
  }
  const detail = dataStore.getAccommodationDetail(req.params.id);
  res.status(201).json({ review, accommodation: detail });
});

// --- BOOKINGS ---
apiRouter.get('/bookings', (req, res) => {
  const { touristId, ownerId } = req.query;
  const bookings = dataStore.listBookings({
    touristId: typeof touristId === 'string' ? touristId : undefined,
    ownerId: typeof ownerId === 'string' ? ownerId : undefined,
  });
  res.json({ bookings });
});

apiRouter.post('/bookings', (req, res) => {
  const body = req.body ?? {};
  if (
    !body.accommodationId ||
    !body.guestName ||
    !body.guestDni ||
    !body.guestEmail ||
    !body.guestPhone ||
    !body.checkIn ||
    !body.checkOut
  ) {
    return res
      .status(400)
      .json({ error: 'Completá todos los datos obligatorios del huésped y las fechas.' });
  }

  const result = dataStore.createBooking({
    accommodationId: String(body.accommodationId),
    touristId: body.touristId ? String(body.touristId) : undefined,
    guestName: String(body.guestName),
    guestDni: String(body.guestDni),
    guestEmail: String(body.guestEmail),
    guestPhone: String(body.guestPhone),
    arrivalTime: String(body.arrivalTime || '14:00'),
    specialRequests: String(body.specialRequests || ''),
    checkIn: String(body.checkIn),
    checkOut: String(body.checkOut),
    guestsCount: Number(body.guestsCount || 2),
    paymentMethod: body.paymentMethod || 'Transferencia bancaria',
  });

  if (result.error) {
    return res.status(409).json({ error: result.error });
  }
  res.status(201).json({ booking: result.booking });
});

apiRouter.patch('/bookings/:id', (req, res) => {
  const { status, paymentStatus } = req.body ?? {};
  const validStatuses: BookingStatus[] = ['confirmada', 'pendiente', 'cancelada', 'completada'];
  const validPayments: PaymentStatus[] = ['sena_abonada', 'pago_completo', 'pendiente'];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Estado de reserva inválido.' });
  }
  if (paymentStatus && !validPayments.includes(paymentStatus)) {
    return res.status(400).json({ error: 'Estado de pago inválido.' });
  }

  const updated = dataStore.updateBooking(req.params.id, { status, paymentStatus });
  if (!updated) {
    return res.status(404).json({ error: 'Reserva no encontrada.' });
  }
  res.json({ booking: updated });
});

// --- ADMIN ---
apiRouter.get('/admin/overview', (_req, res) => {
  res.json({ overview: dataStore.getAdminOverview() });
});

apiRouter.get('/users', (_req, res) => {
  res.json({ users: dataStore.listUsers() });
});

apiRouter.patch('/users/:id', (req, res) => {
  const { active, role } = req.body ?? {};
  const updated = dataStore.updateUser(req.params.id, { active, role });
  if (!updated) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }
  res.json({ user: updated });
});
