import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  CreditCard,
  Landmark,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react';
import type { AccommodationDetail, Booking, PaymentMethod } from '../types';
import { api } from '../lib/api';
import { calculateNights, formatARS, formatDateAR } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface BookingFlowPageProps {
  accommodation: AccommodationDetail;
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuests: number;
  onCancel: () => void;
  onCompleteToExplore: () => void;
  onGoToBookings: () => void;
}

const STEPS = [
  { num: 1, label: 'Alojamiento' },
  { num: 2, label: 'Fechas' },
  { num: 3, label: 'Datos del huésped' },
  { num: 4, label: 'Resumen' },
  { num: 5, label: 'Pago de seña' },
  { num: 6, label: 'Confirmación' },
];

export const BookingFlowPage: React.FC<BookingFlowPageProps> = ({
  accommodation,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  onCancel,
  onCompleteToExplore,
  onGoToBookings,
}) => {
  const { user } = useAuth();

  // Visual steps start at step 3 (since 1 & 2 were chosen on detail, and user can step back to 2 to adjust dates!)
  const [step, setStep] = useState<number>(3);

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guestsCount, setGuestsCount] = useState(initialGuests);

  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestDni, setGuestDni] = useState('');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [arrivalTime, setArrivalTime] = useState('15:00');
  const [specialRequests, setSpecialRequests] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transferencia bancaria');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const nights = calculateNights(checkIn, checkOut);
  const totalAmount = nights * accommodation.pricePerNight;
  const depositAmount = Math.round(totalAmount * 0.2);
  const balanceAmount = totalAmount - depositAmount;

  const validateGuestForm = (): boolean => {
    setError('');
    if (guestName.trim().length < 3) {
      setError('Ingresá tu nombre y apellido completo.');
      return false;
    }
    if (guestDni.trim().length < 7) {
      setError('Ingresá un número de DNI válido.');
      return false;
    }
    if (!guestEmail.includes('@')) {
      setError('Ingresá un correo electrónico válido.');
      return false;
    }
    if (guestPhone.trim().length < 8) {
      setError('Ingresá un teléfono o WhatsApp de contacto.');
      return false;
    }
    return true;
  };

  const handleConfirmPayment = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await api.createBooking({
        accommodationId: accommodation.id,
        touristId: user?.id,
        guestName,
        guestDni,
        guestEmail,
        guestPhone,
        arrivalTime,
        specialRequests,
        checkIn,
        checkOut,
        guestsCount,
        paymentMethod,
      });
      setConfirmedBooking(res.booking);
      setStep(6);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No pudimos confirmar la reserva. Intentá nuevamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8">
      {step < 6 && (
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#397B91] hover:text-[#173B57] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a {accommodation.name}</span>
        </button>
      )}

      {/* 6-Step Progress Bar */}
      <nav aria-label="Progreso de reserva" className="bg-white rounded-xl border border-[#24313A]/10 p-4 sm:p-5">
        <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STEPS.map((s) => {
            const isCompleted = step > s.num || (step === 6 && s.num === 6);
            const isCurrent = step === s.num && step < 6;
            const clickable = s.num >= 2 && s.num < step && step < 6;

            return (
              <li key={s.num}>
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && setStep(s.num)}
                  className={`w-full flex items-center gap-2.5 text-left p-2 rounded-lg transition-colors ${
                    clickable ? 'cursor-pointer hover:bg-[#F7F8F5]' : 'cursor-default'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 tabular-nums ${
                      isCompleted
                        ? 'bg-[#779B75] text-white'
                        : isCurrent
                        ? 'bg-[#173B57] text-white'
                        : 'bg-[#F7F8F5] text-[#24313A]/50 border border-[#24313A]/15'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </span>
                  <span
                    className={`text-xs font-semibold leading-tight ${
                      isCurrent || isCompleted ? 'text-[#173B57]' : 'text-[#24313A]/55'
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Confirmation Screen (Step 6) */}
      {step === 6 && confirmedBooking ? (
        <div className="bg-white rounded-xl border border-[#24313A]/12 p-6 sm:p-10 max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#779B75]/15 text-[#779B75] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-[#173B57]">
              ¡Reserva confirmada en {confirmedBooking.accommodationName}!
            </h1>
            <p className="text-sm text-[#24313A]/75 max-w-lg mx-auto">
              Enviamos el comprobante a <strong>{confirmedBooking.guestEmail}</strong> y notificamos al anfitrión sobre tu llegada.
            </p>
            <div className="inline-block bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg px-5 py-2.5 mt-2">
              <span className="text-xs text-[#24313A]/65 block">Código de reserva único</span>
              <span className="font-mono text-xl font-bold text-[#173B57] tracking-wider tabular-nums">
                {confirmedBooking.code}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7F8F5] rounded-xl p-5 text-sm">
            <div>
              <span className="text-xs text-[#24313A]/60 block">Alojamiento y destino</span>
              <strong className="text-[#173B57]">
                {confirmedBooking.accommodationName} · {confirmedBooking.accommodationDestination}
              </strong>
            </div>
            <div>
              <span className="text-xs text-[#24313A]/60 block">Titular de la reserva</span>
              <strong className="text-[#173B57]">
                {confirmedBooking.guestName} (DNI {confirmedBooking.guestDni})
              </strong>
            </div>
            <div>
              <span className="text-xs text-[#24313A]/60 block">Fechas seleccionadas</span>
              <strong className="text-[#173B57] tabular-nums">
                {formatDateAR(confirmedBooking.checkIn)} al {formatDateAR(confirmedBooking.checkOut)} (
                {confirmedBooking.nights} noches)
              </strong>
            </div>
            <div>
              <span className="text-xs text-[#24313A]/60 block">Huéspedes y llegada</span>
              <strong className="text-[#173B57] tabular-nums">
                {confirmedBooking.guestsCount} huéspedes · {confirmedBooking.arrivalTime} hs
              </strong>
            </div>
          </div>

          <div className="border-t border-[#24313A]/10 pt-5 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-[#24313A]/75">Precio total de la estadía</span>
              <span className="font-semibold text-[#173B57] tabular-nums">
                {formatARS(confirmedBooking.totalAmount)} ARS
              </span>
            </div>
            <div className="flex justify-between text-[#779B75] font-semibold">
              <span>Seña abonada (20% · {confirmedBooking.paymentMethod})</span>
              <span className="tabular-nums">{formatARS(confirmedBooking.depositAmount)} ARS</span>
            </div>
            <div className="flex justify-between font-semibold text-[#173B57] pt-2 border-t border-[#24313A]/10">
              <span>Saldo pendiente al ingresar (80%)</span>
              <span className="tabular-nums">{formatARS(confirmedBooking.balanceAmount)} ARS</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {user && (
              <button
                type="button"
                onClick={onGoToBookings}
                className="flex-1 py-3 bg-[#173B57] hover:bg-[#102B40] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Ver mis reservas
              </button>
            )}
            <button
              type="button"
              onClick={onCompleteToExplore}
              className="flex-1 py-3 bg-white hover:bg-[#F7F8F5] text-[#173B57] border border-[#24313A]/15 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Seguir explorando alojamientos
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Active Step Form */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#24313A]/10 p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3.5 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/25 text-xs text-[#991B1B] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 2: Adjust Dates */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#173B57]">
                    Ajustá las fechas de tu estadía
                  </h2>
                  <p className="text-sm text-[#24313A]/70 mt-1">
                    Podés modificar el ingreso, la salida o la cantidad de huéspedes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#24313A]/75 mb-1.5">
                      Ingreso
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#24313A]/75 mb-1.5">
                      Salida
                    </label>
                    <input
                      type="date"
                      min={checkIn}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#24313A]/75 mb-1.5">
                      Huéspedes
                    </label>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
                    >
                      {Array.from({ length: accommodation.maxGuests }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'huésped' : 'huéspedes'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    disabled={nights <= 0}
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 bg-[#173B57] hover:bg-[#102B40] text-white text-sm font-semibold rounded-lg cursor-pointer disabled:opacity-50"
                  >
                    Continuar a datos del huésped
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Guest Data */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#173B57]">
                    Datos del huésped titular
                  </h2>
                  <p className="text-sm text-[#24313A]/70 mt-1">
                    Esta información figurará en el comprobante enviado al establecimiento.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#24313A]/75 mb-1.5">
                      Nombre y apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Ej. Sofía Martínez"
                      className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397B91]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#24313A]/75 mb-1.5">
                      DNI / Pasaporte *
                    </label>
                    <input
                      type="text"
                      required
                      value={guestDni}
                      onChange={(e) => setGuestDni(e.target.value)}
                      placeholder="Ej. 36.412.908"
                      className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-[#397B91]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#24313A]/75 mb-1.5">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397B91]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#24313A]/75 mb-1.5">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+54 9 351 400-0000"
                      className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-[#397B91]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#24313A]/75 mb-1.5">
                      Horario estimado de llegada
                    </label>
                    <select
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
                    >
                      <option value="14:00">14:00 hs (Inicio check-in)</option>
                      <option value="15:00">15:00 hs</option>
                      <option value="17:00">17:00 hs</option>
                      <option value="19:00">19:00 hs</option>
                      <option value="21:00">21:00 hs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#24313A]/75 mb-1.5">
                      Consultas o pedidos especiales
                    </label>
                    <input
                      type="text"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Ej. Cuna, cochera techada, mascota..."
                      className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-sm font-medium text-[#397B91] hover:underline cursor-pointer"
                  >
                    Modificar fechas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateGuestForm()) setStep(4);
                    }}
                    className="px-6 py-2.5 bg-[#173B57] hover:bg-[#102B40] text-white text-sm font-semibold rounded-lg cursor-pointer"
                  >
                    Revisar resumen
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Summary */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#173B57]">
                    Resumen de tu reserva
                  </h2>
                  <p className="text-sm text-[#24313A]/70 mt-1">
                    Verificá que las fechas, los datos personales y el monto de seña sean correctos.
                  </p>
                </div>

                <div className="bg-[#F7F8F5] rounded-xl p-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#24313A]/70">Establecimiento</span>
                    <strong className="text-[#173B57]">{accommodation.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#24313A]/70">Ubicación</span>
                    <span className="font-medium text-[#24313A]">
                      {accommodation.address}, {accommodation.destination}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#24313A]/70">Estadía</span>
                    <strong className="text-[#173B57] tabular-nums">
                      {formatDateAR(checkIn)} al {formatDateAR(checkOut)} ({nights} noches)
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#24313A]/70">Huésped titular</span>
                    <span className="font-medium text-[#24313A]">
                      {guestName} · DNI {guestDni}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#24313A]/70">Contacto</span>
                    <span className="font-medium text-[#24313A]">
                      {guestEmail} · {guestPhone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-sm font-medium text-[#397B91] hover:underline cursor-pointer"
                  >
                    Editar datos
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="px-6 py-2.5 bg-[#173B57] hover:bg-[#102B40] text-white text-sm font-semibold rounded-lg cursor-pointer"
                  >
                    Ir al pago de seña (20%)
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Simulated Deposit Payment */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#173B57]">
                    Pago de seña del 20%
                  </h2>
                  <p className="text-sm text-[#24313A]/70 mt-1">
                    Abonás únicamente{' '}
                    <strong className="text-[#173B57] tabular-nums">
                      {formatARS(depositAmount)} ARS
                    </strong>{' '}
                    para bloquear tus fechas. El saldo restante de{' '}
                    <strong className="tabular-nums">{formatARS(balanceAmount)} ARS</strong> se abona al ingresar.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#397B91]/10 border border-[#397B91]/25 text-xs text-[#173B57] flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#397B91] shrink-0 mt-0.5" />
                  <span>
                    <strong>Modo demostración segura:</strong> Este flujo simula la confirmación de seña sin solicitar ni almacenar datos reales de tarjetas bancarias.
                  </span>
                </div>

                <div className="space-y-3">
                  {(
                    [
                      {
                        id: 'Transferencia bancaria',
                        icon: Landmark,
                        title: 'Transferencia bancaria inmediata (CBU / Alias)',
                        desc: 'Alias simulado: SERRANO.RESERVAS.VCP · Acreditación instantánea.',
                      },
                      {
                        id: 'Billetera virtual',
                        icon: Smartphone,
                        title: 'Billetera virtual / Pago QR (Simulado)',
                        desc: 'Compatible con billeteras argentinas sin recargos.',
                      },
                      {
                        id: 'Débito simulado',
                        icon: CreditCard,
                        title: 'Validación bancaria de demostración',
                        desc: 'Simula aprobación automática de seña del 20% para pruebas.',
                      },
                    ] as const
                  ).map((opt) => {
                    const Icon = opt.icon;
                    const selected = paymentMethod === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPaymentMethod(opt.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-colors flex items-start gap-3.5 cursor-pointer ${
                          selected
                            ? 'border-[#173B57] bg-[#173B57]/5'
                            : 'border-[#24313A]/12 hover:border-[#397B91]'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-[#173B57] mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-[#173B57]">{opt.title}</div>
                          <div className="text-xs text-[#24313A]/70 mt-0.5">{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-3">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="text-sm font-medium text-[#397B91] hover:underline cursor-pointer"
                  >
                    Volver al resumen
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleConfirmPayment}
                    className="px-6 py-3 bg-[#779B75] hover:bg-[#658863] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {submitting
                      ? 'Confirmando reserva...'
                      : `Confirmar y abonar seña (${formatARS(depositAmount)})`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Card */}
          <aside className="lg:col-span-5 bg-white rounded-xl border border-[#24313A]/10 p-6 space-y-5">
            <div className="flex gap-4 items-center pb-5 border-b border-[#24313A]/10">
              <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0">
                <ImageWithFallback
                  mediaKey={accommodation.galleryKeys[0] || 'cabanas_los_aromos'}
                  alt={accommodation.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xs font-medium text-[#397B91]">
                  {accommodation.type} · {accommodation.destination}
                </span>
                <h3 className="font-display text-lg font-semibold text-[#173B57]">
                  {accommodation.name}
                </h3>
                <p className="text-xs text-[#24313A]/70">{accommodation.address}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-[#24313A]/80">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#397B91]" />
                  Fechas
                </span>
                <span className="font-medium tabular-nums">
                  {formatDateAR(checkIn)} — {formatDateAR(checkOut)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#24313A]/80">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#397B91]" />
                  Huéspedes
                </span>
                <span className="font-medium tabular-nums">
                  {guestsCount} {guestsCount === 1 ? 'persona' : 'personas'} · {nights}{' '}
                  {nights === 1 ? 'noche' : 'noches'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#24313A]/10 space-y-2.5 text-sm">
              <div className="flex justify-between text-[#24313A]/75">
                <span className="tabular-nums">
                  {formatARS(accommodation.pricePerNight)} × {nights} noches
                </span>
                <span className="tabular-nums">{formatARS(totalAmount)} ARS</span>
              </div>
              <div className="flex justify-between font-semibold text-[#173B57] text-base pt-2 border-t border-[#24313A]/10">
                <span>Precio total</span>
                <span className="tabular-nums">{formatARS(totalAmount)} ARS</span>
              </div>
              <div className="bg-[#F7F8F5] rounded-lg p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold text-[#173B57]">
                  <span>Importe de la seña (20%)</span>
                  <span className="tabular-nums">{formatARS(depositAmount)} ARS</span>
                </div>
                <div className="flex justify-between text-[#24313A]/75">
                  <span>Saldo pendiente en el complejo (80%)</span>
                  <span className="tabular-nums">{formatARS(balanceAmount)} ARS</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
