import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bath,
  BedDouble,
  Calendar,
  Check,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import type { AccommodationDetail } from '../types';
import { api } from '../lib/api';
import { calculateNights, formatARS, getDatesInRange } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar';

interface AccommodationDetailPageProps {
  accommodationId: string;
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuests: number;
  onBack: () => void;
  onStartBooking: (params: {
    accommodation: AccommodationDetail;
    checkIn: string;
    checkOut: string;
    guestsCount: number;
  }) => void;
}

export const AccommodationDetailPage: React.FC<AccommodationDetailPageProps> = ({
  accommodationId,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  onBack,
  onStartBooking,
}) => {
  const { user } = useAuth();
  const [detail, setDetail] = useState<AccommodationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guestsCount, setGuestsCount] = useState(initialGuests);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .getAccommodation(accommodationId)
      .then((res) => {
        if (!cancelled) {
          setDetail(res.accommodation);
          setActivePhotoIndex(0);
          setGuestsCount((prev) => Math.min(prev, res.accommodation.maxGuests));
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'No se pudo cargar el alojamiento.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accommodationId]);

  const nights = calculateNights(checkIn, checkOut);
  const totalAmount = detail ? nights * detail.pricePerNight : 0;
  const depositAmount = Math.round(totalAmount * 0.2);
  const balanceAmount = totalAmount - depositAmount;

  const hasConflict = useMemo(() => {
    if (!detail || nights <= 0) return false;
    const requested = getDatesInRange(checkIn, checkOut);
    const unavailable = new Set([...detail.bookedDates, ...detail.blockedDates]);
    return requested.some((d) => unavailable.has(d));
  }, [detail, checkIn, checkOut, nights]);

  const handleReserveClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || nights <= 0 || hasConflict) return;
    onStartBooking({
      accommodation: detail,
      checkIn,
      checkOut,
      guestsCount,
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !reviewComment.trim()) return;
    setReviewSubmitting(true);
    setReviewMessage('');
    try {
      const res = await api.addReview(detail.id, {
        authorName: user?.name || 'Viajero verificado',
        authorCity: user?.city || 'Córdoba',
        rating: reviewRating,
        comment: reviewComment,
      });
      setDetail(res.accommodation);
      setReviewComment('');
      setReviewMessage('Tu reseña fue publicada con éxito.');
    } catch (err) {
      setReviewMessage(err instanceof Error ? err.message : 'No se pudo enviar la reseña.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-pulse">
        <div className="h-6 bg-[#24313A]/10 rounded w-48" />
        <div className="h-[420px] bg-[#24313A]/10 rounded-xl" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-display text-2xl font-semibold text-[#173B57]">
          {error || 'Alojamiento no encontrado'}
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 bg-[#173B57] text-white text-sm font-semibold rounded-lg cursor-pointer"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  const gallery = detail.galleryKeys.length > 0 ? detail.galleryKeys : ['cabanas_los_aromos'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-10">
      {/* Breadcrumb & Header */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#397B91] hover:text-[#173B57] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a alojamientos</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#397B91]">
              <span>{detail.type}</span>
              <span aria-hidden="true">·</span>
              <span>{detail.destination}, Córdoba</span>
              {detail.verified && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-[#779B75]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Alojamiento verificado
                  </span>
                </>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#173B57] tracking-tight">
              {detail.name}
            </h1>

            <p className="text-sm text-[#24313A]/75 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#779B75] shrink-0" />
              <span>
                {detail.address} — {detail.zoneReference}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-[#173B57] tabular-nums shrink-0">
            <Star className="w-4 h-4 fill-[#173B57]" />
            <span>{detail.rating.toFixed(1).replace('.', ',')}</span>
            <span className="font-normal text-[#24313A]/70">
              ({detail.reviewCount} opiniones de huéspedes)
            </span>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-9 aspect-[16/9] rounded-xl overflow-hidden bg-[#F7F8F5] border border-[#24313A]/10">
          <ImageWithFallback
            mediaKey={gallery[activePhotoIndex] || gallery[0]}
            alt={`${detail.name} - fotografía principal`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="lg:col-span-3 grid grid-cols-3 lg:grid-cols-1 gap-3">
          {gallery.map((key, idx) => (
            <button
              key={`${key}-${idx}`}
              type="button"
              onClick={() => setActivePhotoIndex(idx)}
              className={`aspect-[4/3] lg:aspect-auto lg:h-full rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                activePhotoIndex === idx
                  ? 'border-[#173B57]'
                  : 'border-transparent opacity-80 hover:opacity-100'
              }`}
            >
              <ImageWithFallback
                mediaKey={key}
                alt={`${detail.name} vista ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content + Sticky Booking Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-10">
          {/* Capacity & Quick Facts */}
          <div className="bg-white rounded-xl border border-[#24313A]/10 p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-[#24313A]/60 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#397B91]" />
                <span>Capacidad máxima</span>
              </div>
              <div className="font-semibold text-[#173B57] tabular-nums">
                {detail.maxGuests} huéspedes
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-[#24313A]/60 flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5 text-[#397B91]" />
                <span>Dormitorios</span>
              </div>
              <div className="font-semibold text-[#173B57] tabular-nums">
                {detail.bedrooms} {detail.bedrooms === 1 ? 'ambiente' : 'dormitorios'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-[#24313A]/60 flex items-center gap-1.5">
                <Bath className="w-3.5 h-3.5 text-[#397B91]" />
                <span>Baños</span>
              </div>
              <div className="font-semibold text-[#173B57] tabular-nums">
                {detail.bathrooms} {detail.bathrooms === 1 ? 'baño completo' : 'baños'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-[#24313A]/60 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#397B91]" />
                <span>Ingreso / Salida</span>
              </div>
              <div className="font-semibold text-[#173B57] tabular-nums">
                {detail.checkInTime} / {detail.checkOutTime} hs
              </div>
            </div>
          </div>

          {/* Description */}
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-[#173B57]">
              Sobre el alojamiento
            </h2>
            <p className="text-base text-[#24313A]/85 leading-relaxed">{detail.description}</p>
            <p className="text-sm text-[#24313A]/70 pt-1">
              Anfitrión responsable: <strong className="text-[#173B57]">{detail.ownerName}</strong>
            </p>
          </section>

          {/* Amenities */}
          <section className="space-y-4 pt-6 border-t border-[#24313A]/10">
            <h2 className="font-display text-2xl font-semibold text-[#173B57]">
              Servicios disponibles
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {detail.amenities.map((am) => (
                <div
                  key={am}
                  className="flex items-center gap-2.5 bg-white px-4 py-3 rounded-lg border border-[#24313A]/10 text-sm font-medium text-[#24313A]"
                >
                  <Check className="w-4 h-4 text-[#779B75] shrink-0" />
                  <span>{am}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Availability Calendar */}
          <section className="space-y-4 pt-6 border-t border-[#24313A]/10">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#173B57]">
                Disponibilidad actualizada
              </h2>
              <p className="text-sm text-[#24313A]/70 mt-1">
                Consultá las fechas libres para tu estadía antes de confirmar.
              </p>
            </div>
            <AvailabilityCalendar
              bookedDates={detail.bookedDates}
              blockedDates={detail.blockedDates}
              selectedCheckIn={checkIn}
              selectedCheckOut={checkOut}
            />
          </section>

          {/* Reference Map */}
          <section className="space-y-4 pt-6 border-t border-[#24313A]/10">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#173B57]">
                Ubicación de referencia
              </h2>
              <p className="text-sm text-[#24313A]/70 mt-1">
                {detail.address} · {detail.destination}, Córdoba.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#24313A]/10 overflow-hidden">
              <div className="relative h-64 bg-[#EAF0ED] p-6 flex flex-col justify-between overflow-hidden">
                {/* Stylized Punilla / Lago San Roque Topographic Reference */}
                <svg
                  viewBox="0 0 600 240"
                  className="absolute inset-0 w-full h-full object-cover opacity-85"
                  aria-hidden="true"
                >
                  <rect width="600" height="240" fill="#EDF1EC" />
                  {/* Sierras contours */}
                  <path
                    d="M0 70 Q130 20 260 65 T520 45 L600 55 L600 0 L0 0 Z"
                    fill="#DCE5DA"
                  />
                  {/* Lago San Roque stylized shape */}
                  <path
                    d="M320 65 C370 55, 440 85, 460 120 C480 155, 430 185, 370 165 C330 150, 290 110, 320 65 Z"
                    fill="#BBD4DF"
                    stroke="#397B91"
                    strokeWidth="1.5"
                  />
                  {/* Río San Antonio */}
                  <path
                    d="M120 235 Q210 185 335 145"
                    fill="none"
                    stroke="#397B91"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                  />
                  {/* Ruta 38 / Autopista */}
                  <path d="M50 130 L560 110" fill="none" stroke="#173B57" strokeWidth="1.2" strokeOpacity="0.25" />
                  <text x="348" y="122" fill="#173B57" fontSize="11" fontWeight="600">
                    Lago San Roque
                  </text>
                  <text x="155" y="198" fill="#397B91" fontSize="10">
                    Río San Antonio
                  </text>
                </svg>

                <div className="relative z-10 inline-flex items-center gap-2 self-start bg-white/95 px-3 py-1.5 rounded-lg border border-[#24313A]/12 text-xs font-semibold text-[#173B57]">
                  <MapPin className="w-3.5 h-3.5 text-[#397B91]" />
                  <span>{detail.name}</span>
                </div>

                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/95 rounded-lg border border-[#24313A]/10 p-3 text-xs">
                  <div>
                    <span className="text-[#24313A]/60 block">Centro Carlos Paz</span>
                    <strong className="text-[#173B57] tabular-nums">
                      {detail.coordinates.distanceCenterKm.toFixed(1).replace('.', ',')} km
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#24313A]/60 block">Lago San Roque</span>
                    <strong className="text-[#173B57] tabular-nums">
                      {detail.coordinates.distanceLakeKm.toFixed(1).replace('.', ',')} km
                    </strong>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[#24313A]/60 block">Coordenadas</span>
                    <strong className="font-mono text-[#173B57] tabular-nums">
                      {detail.coordinates.lat.toFixed(3)}, {detail.coordinates.lng.toFixed(3)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Guest Reviews */}
          <section className="space-y-6 pt-6 border-t border-[#24313A]/10">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-[#173B57]">
                Opiniones de huéspedes ({detail.reviews.length})
              </h2>
              <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#173B57] tabular-nums">
                <Star className="w-4 h-4 fill-[#173B57]" />
                <span>{detail.rating.toFixed(1).replace('.', ',')} / 5</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detail.reviews.map((rev) => (
                <article
                  key={rev.id}
                  className="bg-white rounded-xl border border-[#24313A]/10 p-5 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-[#173B57] text-sm block">{rev.authorName}</strong>
                      <span className="text-[#24313A]/60">
                        {rev.authorCity} · {rev.stayDate}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#173B57] tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-[#173B57]" />
                      {rev.rating}.0
                    </span>
                  </div>
                  <p className="text-sm text-[#24313A]/85 leading-relaxed">{rev.comment}</p>
                </article>
              ))}
            </div>

            {/* Leave a Review Form */}
            <form
              onSubmit={handleSubmitReview}
              className="bg-white rounded-xl border border-[#24313A]/10 p-5 space-y-4"
            >
              <h3 className="text-sm font-semibold text-[#173B57]">
                ¿Ya te hospedaste acá? Dejá tu opinión
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                <div>
                  <label className="block text-xs text-[#24313A]/70 mb-1">Puntuación</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full h-10 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
                  >
                    <option value={5}>5 estrellas — Excelente</option>
                    <option value={4}>4 estrellas — Muy bueno</option>
                    <option value={3}>3 estrellas — Bueno</option>
                    <option value={2}>2 estrellas — Regular</option>
                    <option value={1}>1 estrella — A mejorar</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs text-[#24313A]/70 mb-1">Tu comentario</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Contanos cómo fue la atención, limpieza y ubicación..."
                      className="flex-1 h-10 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397B91]"
                    />
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-4 h-10 bg-[#173B57] hover:bg-[#102B40] text-white text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      {reviewSubmitting ? 'Publicando...' : 'Publicar'}
                    </button>
                  </div>
                </div>
              </div>
              {reviewMessage && (
                <p className="text-xs font-medium text-[#779B75]">{reviewMessage}</p>
              )}
            </form>
          </section>
        </div>

        {/* Sticky Booking Panel */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24">
          <form
            onSubmit={handleReserveClick}
            className="bg-white rounded-xl border border-[#24313A]/12 shadow-sm p-6 space-y-5"
          >
            <div className="flex items-baseline justify-between pb-4 border-b border-[#24313A]/10">
              <div>
                <span className="text-2xl font-bold text-[#173B57] tabular-nums">
                  {formatARS(detail.pricePerNight)}
                </span>
                <span className="text-xs text-[#24313A]/65 ml-1.5">por noche</span>
              </div>
              <span className="text-xs font-medium text-[#779B75]">Tarifa en ARS</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                    Ingreso
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-[#397B91] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full h-10 pl-8 pr-2 text-xs font-medium bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-[#397B91]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                    Salida
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-[#397B91] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      required
                      min={checkIn}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full h-10 pl-8 pr-2 text-xs font-medium bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-[#397B91]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                  Cantidad de huéspedes (máx. {detail.maxGuests})
                </label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full h-10 px-3 text-sm font-medium bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-[#397B91]"
                >
                  {Array.from({ length: detail.maxGuests }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'huésped' : 'huéspedes'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {nights <= 0 && (
              <div className="p-3 rounded-lg bg-[#D97706]/10 border border-[#D97706]/25 text-xs text-[#92400E] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>La fecha de salida debe ser al menos 1 noche posterior al ingreso.</span>
              </div>
            )}

            {hasConflict && (
              <div className="p-3 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/25 text-xs text-[#991B1B] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  El rango seleccionado incluye fechas ocupadas o bloqueadas. Elegí otras fechas en el calendario.
                </span>
              </div>
            )}

            {nights > 0 && (
              <div className="space-y-2.5 pt-3 border-t border-[#24313A]/10 text-sm">
                <div className="flex justify-between text-[#24313A]/80">
                  <span className="tabular-nums">
                    {formatARS(detail.pricePerNight)} × {nights}{' '}
                    {nights === 1 ? 'noche' : 'noches'}
                  </span>
                  <span className="font-medium tabular-nums">{formatARS(totalAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-[#173B57] pt-2 border-t border-[#24313A]/10">
                  <span>Precio total estimado</span>
                  <span className="tabular-nums">{formatARS(totalAmount)}</span>
                </div>
                <div className="bg-[#F7F8F5] rounded-lg p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold text-[#173B57]">
                    <span>Seña para confirmar (20%)</span>
                    <span className="tabular-nums">{formatARS(depositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[#24313A]/75">
                    <span>Saldo al ingresar (80%)</span>
                    <span className="tabular-nums">{formatARS(balanceAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={nights <= 0 || hasConflict}
              className="w-full py-3 bg-[#173B57] hover:bg-[#102B40] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reservar ahora
            </button>

            <p className="text-[11px] text-center text-[#24313A]/60">
              Confirmación inmediata con código único · Sin cargos ocultos.
            </p>
          </form>
        </aside>
      </div>
    </div>
  );
};
