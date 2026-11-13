import React, { useEffect, useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import type { Booking } from '../types';
import { api } from '../lib/api';
import { formatARS, formatDateAR } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface TouristBookingsPageProps {
  onExplore: () => void;
  onSelectAccommodation: (id: string) => void;
}

const STATUS_LABEL: Record<Booking['status'], string> = {
  confirmada: 'Confirmada',
  pendiente: 'Pendiente',
  cancelada: 'Cancelada',
  completada: 'Finalizada',
};

const PAYMENT_LABEL: Record<Booking['paymentStatus'], string> = {
  sena_abonada: 'Seña 20% abonada',
  pago_completo: 'Pago completo',
  pendiente: 'Seña pendiente',
};

export const TouristBookingsPage: React.FC<TouristBookingsPageProps> = ({
  onExplore,
  onSelectAccommodation,
}) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = () => {
    if (!user) return;
    setLoading(true);
    api
      .listBookings({ touristId: user.id })
      .then((res) => setBookings(res.bookings))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, [user?.id]);

  const handleCancel = async (bookingId: string) => {
    await api.updateBooking(bookingId, { status: 'cancelada' });
    loadBookings();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#173B57]">
            Mis reservas en las sierras
          </h1>
          <p className="text-sm text-[#24313A]/75 mt-1">
            Hola, {user?.name}. Consultá tus códigos de reserva, señas abonadas y saldos pendientes.
          </p>
        </div>
        <button
          type="button"
          onClick={onExplore}
          className="px-4 py-2 bg-[#173B57] hover:bg-[#102B40] text-white text-sm font-semibold rounded-lg cursor-pointer self-start"
        >
          Nueva búsqueda
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-36 bg-white rounded-xl border border-[#24313A]/10 animate-pulse"
            />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#24313A]/10 p-10 text-center space-y-4">
          <h2 className="font-display text-2xl font-semibold text-[#173B57]">
            Todavía no tenés reservas registradas
          </h2>
          <p className="text-sm text-[#24313A]/70 max-w-md mx-auto">
            Explorá las cabañas, hoteles y complejos disponibles en Villa Carlos Paz y confirmá tu estadía con un 20% de seña.
          </p>
          <button
            type="button"
            onClick={onExplore}
            className="px-5 py-2.5 bg-[#173B57] text-white text-sm font-semibold rounded-lg cursor-pointer"
          >
            Explorar alojamientos
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <article
              key={b.id}
              className="bg-white rounded-xl border border-[#24313A]/10 p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
            >
              <div className="flex gap-4 items-center">
                <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0">
                  <ImageWithFallback
                    mediaKey={b.accommodationImageKey}
                    alt={b.accommodationName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#24313A]/70">
                    <span className="font-mono font-semibold text-[#173B57]">{b.code}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-semibold ${
                        b.status === 'cancelada'
                          ? 'text-[#DC2626]'
                          : b.status === 'pendiente'
                          ? 'text-[#D97706]'
                          : 'text-[#779B75]'
                      }`}
                    >
                      {STATUS_LABEL[b.status]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{PAYMENT_LABEL[b.paymentStatus]}</span>
                  </div>

                  <h3 className="font-display text-xl font-semibold text-[#173B57]">
                    <button
                      type="button"
                      onClick={() => onSelectAccommodation(b.accommodationId)}
                      className="hover:text-[#397B91] transition-colors cursor-pointer text-left"
                    >
                      {b.accommodationName}
                    </button>
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#24313A]/75 tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#779B75]" />
                      {b.accommodationDestination}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#397B91]" />
                      {formatDateAR(b.checkIn)} al {formatDateAR(b.checkOut)} ({b.nights} noches)
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-[#24313A]/10">
                <div className="text-left md:text-right">
                  <div className="text-base font-bold text-[#173B57] tabular-nums">
                    Total {formatARS(b.totalAmount)} ARS
                  </div>
                  <div className="text-xs text-[#24313A]/70 tabular-nums">
                    Saldo al ingresar: {formatARS(b.balanceAmount)} ARS
                  </div>
                </div>
                {b.status !== 'cancelada' && b.status !== 'completada' && (
                  <button
                    type="button"
                    onClick={() => handleCancel(b.id)}
                    className="text-xs font-medium text-[#DC2626] hover:underline cursor-pointer"
                  >
                    Cancelar reserva
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
