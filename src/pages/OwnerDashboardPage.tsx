import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Edit3,
  LayoutDashboard,
  Plus,
  X,
} from 'lucide-react';
import type {
  Accommodation,
  AccommodationDetail,
  AccommodationType,
  Booking,
  BookingStatus,
  DestinationName,
  PaymentStatus,
} from '../types';
import { api } from '../lib/api';
import { formatARS, formatDateAR } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import { ImageWithFallback } from '../components/ImageWithFallback';

type OwnerTab = 'overview' | 'properties' | 'calendar' | 'bookings';

const DESTINATIONS: DestinationName[] = [
  'Villa Carlos Paz',
  'Tanti',
  'Cabalango',
  'Cuesta Blanca',
  'San Antonio de Arredondo',
];

const TYPES: AccommodationType[] = ['Cabaña', 'Hotel', 'Complejo', 'Apart', 'Posada'];

const AMENITY_CHOICES = [
  'Pileta',
  'Parrilla',
  'Wi-Fi',
  'Estacionamiento',
  'Vista al lago',
  'Aire acondicionado',
  'Desayuno',
  'Ropa blanca',
  'Pet friendly',
];

export const OwnerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<OwnerTab>('overview');
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  // Calendar state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [calendarDetail, setCalendarDetail] = useState<AccommodationDetail | null>(null);

  // Edit property modal state
  const [editingProp, setEditingProp] = useState<Accommodation | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editMaxGuests, setEditMaxGuests] = useState<number>(2);
  const [editShortDesc, setEditShortDesc] = useState<string>('');
  const [editStatus, setEditStatus] = useState<Accommodation['status']>('publicado');

  // Create property modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AccommodationType>('Cabaña');
  const [newDest, setNewDest] = useState<DestinationName>('Villa Carlos Paz');
  const [newAddress, setNewAddress] = useState('');
  const [newPrice, setNewPrice] = useState(125000);
  const [newGuests, setNewGuests] = useState(4);
  const [newShortDesc, setNewShortDesc] = useState('');
  const [newAmenities, setNewAmenities] = useState<string[]>(['Wi-Fi', 'Estacionamiento', 'Parrilla']);

  const loadOwnerData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [accRes, bkgRes] = await Promise.all([
        api.listAccommodations({ ownerId: user.id, includeAllStatuses: true }),
        api.listBookings({ ownerId: user.id }),
      ]);
      setAccommodations(accRes.accommodations);
      setBookings(bkgRes.bookings);
      if (accRes.accommodations.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(accRes.accommodations[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwnerData();
  }, [user?.id]);

  useEffect(() => {
    if (!selectedPropertyId) return;
    api
      .getAccommodation(selectedPropertyId)
      .then((res) => setCalendarDetail(res.accommodation))
      .catch(() => setCalendarDetail(null));
  }, [selectedPropertyId]);

  const metrics = useMemo(() => {
    const activeBookings = bookings.filter((b) => b.status !== 'cancelada');
    const totalRevenue = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalDeposits = activeBookings.reduce((sum, b) => sum + b.depositAmount, 0);
    const pendingCount = bookings.filter((b) => b.status === 'pendiente').length;
    return { totalRevenue, totalDeposits, activeCount: activeBookings.length, pendingCount };
  }, [bookings]);

  const openEditModal = (prop: Accommodation) => {
    setEditingProp(prop);
    setEditPrice(prop.pricePerNight);
    setEditMaxGuests(prop.maxGuests);
    setEditShortDesc(prop.shortDescription);
    setEditStatus(prop.status);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProp) return;
    await api.updateAccommodation(editingProp.id, {
      pricePerNight: editPrice,
      maxGuests: editMaxGuests,
      shortDescription: editShortDesc,
      status: editStatus,
    });
    setEditingProp(null);
    setFeedback(`Actualizaste ${editingProp.name} correctamente.`);
    loadOwnerData();
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const res = await api.createAccommodation({
      ownerId: user.id,
      name: newName,
      type: newType,
      destination: newDest,
      address: newAddress,
      zoneReference: `Zona residencial en ${newDest}, Córdoba`,
      shortDescription: newShortDesc,
      description: newShortDesc,
      pricePerNight: newPrice,
      maxGuests: newGuests,
      bedrooms: 2,
      bathrooms: 1,
      amenities: newAmenities,
    });
    setShowCreateModal(false);
    setNewName('');
    setNewAddress('');
    setNewShortDesc('');
    setSelectedPropertyId(res.accommodation.id);
    setFeedback(`Publicaste "${res.accommodation.name}" en Serrano Reservas.`);
    loadOwnerData();
  };

  const handleToggleDate = async (isoDate: string) => {
    if (!selectedPropertyId) return;
    const res = await api.toggleBlockedDate(selectedPropertyId, isoDate);
    setCalendarDetail(res.accommodation);
    setFeedback(`Disponibilidad actualizada para el ${formatDateAR(isoDate)}.`);
  };

  const handleBookingUpdate = async (
    bookingId: string,
    patch: { status?: BookingStatus; paymentStatus?: PaymentStatus }
  ) => {
    await api.updateBooking(bookingId, patch);
    setFeedback('Estado de reserva actualizado.');
    loadOwnerData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <aside className="lg:col-span-3 bg-white rounded-xl border border-[#24313A]/10 p-4 space-y-4">
          <div className="px-2 pb-3 border-b border-[#24313A]/10">
            <span className="text-xs font-medium text-[#397B91]">Panel del Propietario</span>
            <h2 className="font-display text-lg font-semibold text-[#173B57] truncate">
              {user?.name}
            </h2>
            <p className="text-xs text-[#24313A]/65 truncate">{user?.city}</p>
          </div>

          <nav className="space-y-1">
            {(
              [
                { id: 'overview', label: 'Resumen general', icon: LayoutDashboard },
                { id: 'properties', label: 'Mis alojamientos', icon: Building2 },
                { id: 'calendar', label: 'Disponibilidad', icon: CalendarDays },
                { id: 'bookings', label: 'Reservas y pagos', icon: ClipboardList },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#173B57] text-white'
                      : 'text-[#24313A]/80 hover:bg-[#F7F8F5] hover:text-[#173B57]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-[#24313A]/10">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="w-full py-2.5 px-3 bg-[#779B75] hover:bg-[#658863] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar alojamiento</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {feedback && (
            <div className="p-3.5 rounded-lg bg-[#779B75]/15 border border-[#779B75]/30 text-xs font-medium text-[#173B57] flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#779B75]" />
                {feedback}
              </span>
              <button
                type="button"
                onClick={() => setFeedback('')}
                className="text-[#24313A]/60 hover:text-[#173B57] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB: OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#173B57]">
                  Resumen de actividad
                </h1>
                <p className="text-sm text-[#24313A]/70 mt-1">
                  Seguimiento en tiempo real de tus establecimientos y reservas recibidas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-[#24313A]/10 p-5">
                  <span className="text-xs text-[#24313A]/65 block">Alojamientos publicados</span>
                  <strong className="text-2xl font-bold text-[#173B57] tabular-nums mt-1 block">
                    {accommodations.length}
                  </strong>
                </div>
                <div className="bg-white rounded-xl border border-[#24313A]/10 p-5">
                  <span className="text-xs text-[#24313A]/65 block">Reservas activas</span>
                  <strong className="text-2xl font-bold text-[#173B57] tabular-nums mt-1 block">
                    {metrics.activeCount}
                  </strong>
                </div>
                <div className="bg-white rounded-xl border border-[#24313A]/10 p-5">
                  <span className="text-xs text-[#24313A]/65 block">Ingresos proyectados</span>
                  <strong className="text-2xl font-bold text-[#173B57] tabular-nums mt-1 block">
                    {formatARS(metrics.totalRevenue)}
                  </strong>
                </div>
                <div className="bg-white rounded-xl border border-[#24313A]/10 p-5">
                  <span className="text-xs text-[#24313A]/65 block">Señas cobradas (20%)</span>
                  <strong className="text-2xl font-bold text-[#779B75] tabular-nums mt-1 block">
                    {formatARS(metrics.totalDeposits)}
                  </strong>
                </div>
              </div>

              {/* Recent Bookings Table */}
              <div className="bg-white rounded-xl border border-[#24313A]/10 overflow-hidden">
                <div className="px-5 py-4 border-b border-[#24313A]/10 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#173B57]">Últimas reservas recibidas</h2>
                  <button
                    type="button"
                    onClick={() => setTab('bookings')}
                    className="text-xs font-medium text-[#397B91] hover:underline cursor-pointer"
                  >
                    Ver todas
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F7F8F5] text-[#24313A]/70 border-b border-[#24313A]/10">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Código</th>
                        <th className="py-3 px-4 font-semibold">Alojamiento</th>
                        <th className="py-3 px-4 font-semibold">Huésped</th>
                        <th className="py-3 px-4 font-semibold">Fechas</th>
                        <th className="py-3 px-4 font-semibold text-right">Total ARS</th>
                        <th className="py-3 px-4 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#24313A]/8">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} className="hover:bg-[#F7F8F5]/60">
                          <td className="py-3 px-4 font-mono font-semibold text-[#173B57]">
                            {b.code}
                          </td>
                          <td className="py-3 px-4 font-medium text-[#24313A]">
                            {b.accommodationName}
                          </td>
                          <td className="py-3 px-4 text-[#24313A]/80">{b.guestName}</td>
                          <td className="py-3 px-4 tabular-nums text-[#24313A]/80">
                            {formatDateAR(b.checkIn)} — {formatDateAR(b.checkOut)}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-[#173B57] tabular-nums">
                            {formatARS(b.totalAmount)}
                          </td>
                          <td className="py-3 px-4 capitalize font-medium text-[#173B57]">
                            {b.status}
                          </td>
                        </tr>
                      ))}
                      {!loading && bookings.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#24313A]/60">
                            Aún no recibiste reservas en tus alojamientos.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROPERTIES */}
          {tab === 'properties' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-semibold text-[#173B57]">
                    Mis alojamientos ({accommodations.length})
                  </h1>
                  <p className="text-sm text-[#24313A]/70">
                    Actualizá precios por noche en ARS, capacidad o descripción comercial.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-[#173B57] hover:bg-[#102B40] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo establecimiento</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {accommodations.map((prop) => (
                  <article
                    key={prop.id}
                    className="bg-white rounded-xl border border-[#24313A]/10 overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[16/9] bg-[#F7F8F5] relative">
                      <ImageWithFallback
                        mediaKey={prop.galleryKeys[0] || 'cabanas_los_aromos'}
                        alt={prop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-[#397B91]">
                          <span>
                            {prop.type} · {prop.destination}
                          </span>
                          <span className="capitalize font-semibold text-[#173B57]">
                            {prop.status}
                          </span>
                        </div>
                        <h3 className="font-display text-xl font-semibold text-[#173B57]">
                          {prop.name}
                        </h3>
                        <p className="text-xs text-[#24313A]/75 line-clamp-2">
                          {prop.shortDescription}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#24313A]/10 flex items-center justify-between">
                        <div>
                          <div className="text-base font-bold text-[#173B57] tabular-nums">
                            {formatARS(prop.pricePerNight)} / noche
                          </div>
                          <div className="text-xs text-[#24313A]/60 tabular-nums">
                            Máx. {prop.maxGuests} huéspedes
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPropertyId(prop.id);
                              setTab('calendar');
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-[#173B57] bg-[#F7F8F5] hover:bg-[#EAECE6] rounded-lg cursor-pointer"
                          >
                            Calendario
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(prop)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#173B57] hover:bg-[#397B91] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* TAB: AVAILABILITY CALENDAR */}
          {tab === 'calendar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-semibold text-[#173B57]">
                    Calendario de disponibilidad
                  </h1>
                  <p className="text-sm text-[#24313A]/70">
                    Hacé clic en cualquier día libre para bloquearlo o desbloquearlo manualmente.
                  </p>
                </div>

                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="h-10 px-3 text-sm font-medium bg-white border border-[#24313A]/15 rounded-lg text-[#173B57]"
                >
                  {accommodations.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.destination})
                    </option>
                  ))}
                </select>
              </div>

              {calendarDetail ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-7">
                    <AvailabilityCalendar
                      bookedDates={calendarDetail.bookedDates}
                      blockedDates={calendarDetail.blockedDates}
                      interactiveMode="owner-toggle"
                      onToggleBlockDate={handleToggleDate}
                    />
                  </div>
                  <div className="md:col-span-5 bg-white rounded-xl border border-[#24313A]/10 p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-[#173B57]">
                      Resumen de ocupación — {calendarDetail.name}
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-2 border-b border-[#24313A]/8">
                        <span className="text-[#24313A]/70">Noches reservadas</span>
                        <strong className="text-[#173B57] tabular-nums">
                          {calendarDetail.bookedDates.length} días
                        </strong>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#24313A]/8">
                        <span className="text-[#24313A]/70">Bloqueos manuales</span>
                        <strong className="text-[#DC2626] tabular-nums">
                          {calendarDetail.blockedDates.length} días
                        </strong>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-[#24313A]/70">Tarifa vigente</span>
                        <strong className="text-[#173B57] tabular-nums">
                          {formatARS(calendarDetail.pricePerNight)} ARS
                        </strong>
                      </div>
                    </div>
                    {calendarDetail.blockedDates.length > 0 && (
                      <div className="pt-2">
                        <span className="text-xs font-medium text-[#24313A]/70 block mb-2">
                          Fechas bloqueadas manualmente (clic para liberar):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {calendarDetail.blockedDates.map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => handleToggleDate(d)}
                              className="px-2.5 py-1 text-xs font-mono bg-[#DC2626]/10 text-[#B91C1C] rounded hover:bg-[#DC2626]/20 cursor-pointer tabular-nums"
                            >
                              {formatDateAR(d)} ×
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#24313A]/10 p-8 text-sm text-[#24313A]/70">
                  Seleccioná un alojamiento para administrar su disponibilidad.
                </div>
              )}
            </div>
          )}

          {/* TAB: BOOKINGS & PAYMENTS */}
          {tab === 'bookings' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-semibold text-[#173B57]">
                  Reservas y estados de pago
                </h1>
                <p className="text-sm text-[#24313A]/70">
                  Gestioná señas abonadas (20%), saldos pendientes al check-in (80%) y confirmaciones.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-[#24313A]/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F7F8F5] text-[#24313A]/70 border-b border-[#24313A]/10">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Código</th>
                        <th className="py-3 px-4 font-semibold">Alojamiento</th>
                        <th className="py-3 px-4 font-semibold">Huésped</th>
                        <th className="py-3 px-4 font-semibold">Check-in / Out</th>
                        <th className="py-3 px-4 font-semibold text-right">Total</th>
                        <th className="py-3 px-4 font-semibold text-right">Seña 20%</th>
                        <th className="py-3 px-4 font-semibold">Pago</th>
                        <th className="py-3 px-4 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#24313A]/8">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-[#F7F8F5]/60">
                          <td className="py-3 px-4 font-mono font-semibold text-[#173B57]">
                            {b.code}
                          </td>
                          <td className="py-3 px-4 font-medium text-[#24313A]">
                            {b.accommodationName}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-[#173B57]">{b.guestName}</div>
                            <div className="text-[11px] text-[#24313A]/60">{b.guestPhone}</div>
                          </td>
                          <td className="py-3 px-4 tabular-nums">
                            {formatDateAR(b.checkIn)} → {formatDateAR(b.checkOut)}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold tabular-nums">
                            {formatARS(b.totalAmount)}
                          </td>
                          <td className="py-3 px-4 text-right text-[#779B75] font-semibold tabular-nums">
                            {formatARS(b.depositAmount)}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={b.paymentStatus}
                              onChange={(e) =>
                                handleBookingUpdate(b.id, {
                                  paymentStatus: e.target.value as PaymentStatus,
                                })
                              }
                              className="h-8 px-2 text-xs bg-[#F7F8F5] border border-[#24313A]/15 rounded-md"
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="sena_abonada">Seña abonada</option>
                              <option value="pago_completo">Pago completo</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={b.status}
                              onChange={(e) =>
                                handleBookingUpdate(b.id, {
                                  status: e.target.value as BookingStatus,
                                })
                              }
                              className="h-8 px-2 text-xs bg-[#F7F8F5] border border-[#24313A]/15 rounded-md"
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="confirmada">Confirmada</option>
                              <option value="completada">Completada</option>
                              <option value="cancelada">Cancelada</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Property Modal */}
      {editingProp && (
        <div className="fixed inset-0 z-50 bg-[#0D2233]/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-xl border border-[#24313A]/15 max-w-lg w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold text-[#173B57]">
                Editar {editingProp.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProp(null)}
                className="p-1.5 rounded-lg hover:bg-[#F7F8F5] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                  Precio por noche (ARS)
                </label>
                <input
                  type="number"
                  min={10000}
                  step={1000}
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full h-10 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                  Capacidad máxima
                </label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  required
                  value={editMaxGuests}
                  onChange={(e) => setEditMaxGuests(Number(e.target.value))}
                  className="w-full h-10 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                Estado de publicación
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as Accommodation['status'])}
                className="w-full h-10 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
              >
                <option value="publicado">Publicado</option>
                <option value="pausado">Pausado temporalmente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                Descripción destacada
              </label>
              <textarea
                rows={3}
                required
                value={editShortDesc}
                onChange={(e) => setEditShortDesc(e.target.value)}
                className="w-full p-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingProp(null)}
                className="px-4 py-2 text-sm font-medium text-[#24313A]/75 hover:bg-[#F7F8F5] rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-[#173B57] hover:bg-[#102B40] rounded-lg cursor-pointer"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Property Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#0D2233]/50 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateProperty}
            className="bg-white rounded-xl border border-[#24313A]/15 max-w-xl w-full p-6 space-y-4 my-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold text-[#173B57]">
                Publicar nuevo alojamiento
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg hover:bg-[#F7F8F5] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                  Nombre del establecimiento *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Cabañas Quebrada Verde"
                  className="w-full h-10 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#24313A]/75 mb-1">Tipo</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as AccommodationType)}
                  className="w-full h-10 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                  Localidad
                </label>
                <select
                  value={newDest}
                  onChange={(e) => setNewDest(e.target.value as DestinationName)}
                  className="w-full h-10 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
                >
                  {DESTINATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Ej. Av. Cárcano 1450"
                  className="w-full h-10 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                  Tarifa por noche (ARS) *
                </label>
                <input
                  type="number"
                  min={15000}
                  step={1000}
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full h-10 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                  Capacidad máxima *
                </label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  required
                  value={newGuests}
                  onChange={(e) => setNewGuests(Number(e.target.value))}
                  className="w-full h-10 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg tabular-nums"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                  Descripción *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newShortDesc}
                  onChange={(e) => setNewShortDesc(e.target.value)}
                  placeholder="Describí el entorno, pileta, vista y comodidades principales..."
                  className="w-full p-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#24313A]/75 mb-2">
                  Servicios incluidos
                </label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_CHOICES.map((am) => {
                    const active = newAmenities.includes(am);
                    return (
                      <button
                        key={am}
                        type="button"
                        onClick={() =>
                          setNewAmenities((prev) =>
                            prev.includes(am) ? prev.filter((x) => x !== am) : [...prev, am]
                          )
                        }
                        className={`px-3 py-1.5 text-xs rounded-lg border cursor-pointer ${
                          active
                            ? 'bg-[#173B57] text-white border-[#173B57]'
                            : 'bg-[#F7F8F5] text-[#24313A]/80 border-[#24313A]/12'
                        }`}
                      >
                        {am}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-[#24313A]/75 hover:bg-[#F7F8F5] rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-[#173B57] hover:bg-[#102B40] rounded-lg cursor-pointer"
              >
                Publicar ahora
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
