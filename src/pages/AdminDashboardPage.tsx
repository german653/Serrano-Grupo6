import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import type {
  Accommodation,
  AccommodationStatus,
  AdminOverview,
  Booking,
  BookingStatus,
  User,
} from '../types';
import { api } from '../lib/api';
import { formatARS, formatDateAR } from '../lib/format';

type AdminTab = 'overview' | 'accommodations' | 'users' | 'bookings';

export const AdminDashboardPage: React.FC = () => {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('todas');
  const [feedback, setFeedback] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ovRes, accRes, usrRes, bkgRes] = await Promise.all([
        api.getAdminOverview(),
        api.listAccommodations({ includeAllStatuses: true }),
        api.listUsers(),
        api.listBookings(),
      ]);
      setOverview(ovRes.overview);
      setAccommodations(accRes.accommodations);
      setUsers(usrRes.users);
      setBookings(bkgRes.bookings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAccommodationStatus = async (id: string, status: AccommodationStatus) => {
    await api.updateAccommodation(id, { status });
    setFeedback('Estado de publicación actualizado.');
    loadAll();
  };

  const handleAccommodationVerified = async (id: string, verified: boolean) => {
    await api.updateAccommodation(id, { verified });
    setFeedback('Verificación de establecimiento actualizada.');
    loadAll();
  };

  const handleToggleUserActive = async (u: User) => {
    await api.updateUser(u.id, { active: !u.active });
    setFeedback(`Cuenta de ${u.name} ${!u.active ? 'activada' : 'suspendida'}.`);
    loadAll();
  };

  const handleBookingStatus = async (id: string, status: BookingStatus) => {
    await api.updateBooking(id, { status });
    setFeedback('Estado de reserva actualizado.');
    loadAll();
  };

  const filteredAccommodations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return accommodations;
    return accommodations.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.destination.toLowerCase().includes(q) ||
        a.ownerName.toLowerCase().includes(q)
    );
  }, [accommodations, searchQuery]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchesStatus =
        bookingStatusFilter === 'todas' || b.status === bookingStatusFilter;
      const matchesSearch =
        !q ||
        b.code.toLowerCase().includes(q) ||
        b.guestName.toLowerCase().includes(q) ||
        b.accommodationName.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [bookings, bookingStatusFilter, searchQuery]);

  const maxMonthlyRevenue = useMemo(() => {
    if (!overview) return 1;
    return Math.max(...overview.monthlyMetrics.map((m) => m.revenueARS), 1);
  }, [overview]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <aside className="lg:col-span-3 bg-white rounded-xl border border-[#24313A]/10 p-4 space-y-4">
          <div className="px-2 pb-3 border-b border-[#24313A]/10">
            <span className="text-xs font-medium text-[#397B91]">Consola de Administración</span>
            <h2 className="font-display text-lg font-semibold text-[#173B57]">
              Serrano Reservas
            </h2>
            <p className="text-xs text-[#24313A]/65">Villa Carlos Paz, Córdoba</p>
          </div>

          <nav className="space-y-1">
            {(
              [
                { id: 'overview', label: 'Métricas generales', icon: BarChart3 },
                { id: 'accommodations', label: 'Alojamientos', icon: Building2 },
                { id: 'users', label: 'Usuarios', icon: Users },
                { id: 'bookings', label: 'Reservas', icon: ClipboardList },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTab(item.id);
                    setSearchQuery('');
                  }}
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
        </aside>

        {/* Main Viewport */}
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
                  Tablero general de la plataforma
                </h1>
                <p className="text-sm text-[#24313A]/70 mt-1">
                  Indicadores operativos de alojamientos, usuarios y volumen de reservas en ARS.
                </p>
              </div>

              {loading || !overview ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className="h-24 bg-white rounded-xl border border-[#24313A]/10 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <>
                  {/* 5 Required KPIs */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white rounded-xl border border-[#24313A]/10 p-4">
                      <span className="text-xs text-[#24313A]/65 block">
                        Alojamientos publicados
                      </span>
                      <strong className="text-2xl font-bold text-[#173B57] tabular-nums mt-1 block">
                        {overview.totalPublishedAccommodations}
                      </strong>
                    </div>
                    <div className="bg-white rounded-xl border border-[#24313A]/10 p-4">
                      <span className="text-xs text-[#24313A]/65 block">Usuarios registrados</span>
                      <strong className="text-2xl font-bold text-[#173B57] tabular-nums mt-1 block">
                        {overview.totalUsers}
                      </strong>
                    </div>
                    <div className="bg-white rounded-xl border border-[#24313A]/10 p-4">
                      <span className="text-xs text-[#24313A]/65 block">Reservas realizadas</span>
                      <strong className="text-2xl font-bold text-[#173B57] tabular-nums mt-1 block">
                        {overview.totalBookings}
                      </strong>
                    </div>
                    <div className="bg-white rounded-xl border border-[#24313A]/10 p-4">
                      <span className="text-xs text-[#24313A]/65 block">Ingresos estimados</span>
                      <strong className="text-xl font-bold text-[#779B75] tabular-nums mt-1 block">
                        {formatARS(overview.estimatedRevenueARS)}
                      </strong>
                    </div>
                    <div className="bg-white rounded-xl border border-[#24313A]/10 p-4 col-span-2 lg:col-span-1">
                      <span className="text-xs text-[#24313A]/65 block">Reservas pendientes</span>
                      <strong className="text-2xl font-bold text-[#D97706] tabular-nums mt-1 block">
                        {overview.pendingBookings}
                      </strong>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Monthly Revenue Bar Chart */}
                    <div className="lg:col-span-7 bg-white rounded-xl border border-[#24313A]/10 p-6 space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-sm font-semibold text-[#173B57]">
                            Evolución mensual de ingresos (ARS)
                          </h2>
                          <p className="text-xs text-[#24313A]/60">
                            Segundo semestre 2026 · Temporada de primavera y verano
                          </p>
                        </div>
                        <span className="text-xs font-mono font-semibold text-[#397B91] tabular-nums">
                          Ocupación media: {overview.occupancyRatePercent}%
                        </span>
                      </div>

                      <div className="grid grid-cols-6 gap-3 items-end h-48 pt-4">
                        {overview.monthlyMetrics.map((m) => {
                          const heightPercent = Math.max(
                            14,
                            Math.round((m.revenueARS / maxMonthlyRevenue) * 100)
                          );
                          return (
                            <div
                              key={m.month}
                              className="flex flex-col items-center gap-2 h-full justify-end"
                            >
                              <span className="text-[10px] font-mono text-[#24313A]/70 tabular-nums">
                                {m.bookings} res.
                              </span>
                              <div className="w-full flex-1 flex items-end">
                                <div
                                  style={{ height: `${heightPercent}%` }}
                                  title={`${m.month}: ${formatARS(m.revenueARS)} ARS`}
                                  className="w-full rounded-t-md bg-[#173B57] hover:bg-[#397B91] transition-colors"
                                />
                              </div>
                              <span className="text-[11px] font-medium text-[#24313A]/80 whitespace-nowrap">
                                {m.month}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Destination Breakdown */}
                    <div className="lg:col-span-5 bg-white rounded-xl border border-[#24313A]/10 p-6 space-y-4">
                      <h2 className="text-sm font-semibold text-[#173B57]">
                        Distribución por destino turístico
                      </h2>
                      <div className="space-y-3.5">
                        {overview.destinationBreakdown.map((item) => {
                          const pct = Math.max(
                            15,
                            Math.round(
                              (item.accommodations / Math.max(overview.totalAccommodations, 1)) *
                                100
                            )
                          );
                          return (
                            <div key={item.destination} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-[#173B57]">
                                  {item.destination}
                                </span>
                                <span className="text-[#24313A]/70 tabular-nums">
                                  {item.accommodations} aloj. · {item.bookings} res.
                                </span>
                              </div>
                              <div className="h-2 bg-[#F7F8F5] rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${pct}%` }}
                                  className="h-full bg-[#397B91] rounded-full"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: ACCOMMODATIONS MANAGEMENT */}
          {tab === 'accommodations' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-semibold text-[#173B57]">
                    Gestión de alojamientos
                  </h1>
                  <p className="text-sm text-[#24313A]/70">
                    Moderación, verificación presencial y control de publicaciones activas.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#24313A]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar complejo o localidad..."
                    className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-[#24313A]/15 rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#24313A]/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F7F8F5] text-[#24313A]/70 border-b border-[#24313A]/10">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Establecimiento</th>
                        <th className="py-3 px-4 font-semibold">Destino</th>
                        <th className="py-3 px-4 font-semibold">Propietario</th>
                        <th className="py-3 px-4 font-semibold text-right">Tarifa ARS</th>
                        <th className="py-3 px-4 font-semibold">Verificación</th>
                        <th className="py-3 px-4 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#24313A]/8">
                      {filteredAccommodations.map((a) => (
                        <tr key={a.id} className="hover:bg-[#F7F8F5]/60">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#173B57]">{a.name}</div>
                            <div className="text-[11px] text-[#24313A]/60">{a.type}</div>
                          </td>
                          <td className="py-3 px-4">{a.destination}</td>
                          <td className="py-3 px-4 text-[#24313A]/80">{a.ownerName}</td>
                          <td className="py-3 px-4 text-right font-semibold tabular-nums">
                            {formatARS(a.pricePerNight)}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => handleAccommodationVerified(a.id, !a.verified)}
                              className={`inline-flex items-center gap-1 font-medium cursor-pointer ${
                                a.verified ? 'text-[#779B75]' : 'text-[#24313A]/55'
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {a.verified ? 'Verificado' : 'Sin verificar'}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={a.status}
                              onChange={(e) =>
                                handleAccommodationStatus(
                                  a.id,
                                  e.target.value as AccommodationStatus
                                )
                              }
                              className="h-8 px-2 text-xs bg-[#F7F8F5] border border-[#24313A]/15 rounded-md"
                            >
                              <option value="publicado">Publicado</option>
                              <option value="revision">En revisión</option>
                              <option value="pausado">Pausado</option>
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

          {/* TAB: USERS MANAGEMENT */}
          {tab === 'users' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-semibold text-[#173B57]">
                    Gestión de usuarios ({users.length})
                  </h1>
                  <p className="text-sm text-[#24313A]/70">
                    Turistas, propietarios de complejos y administradores habilitados.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#24313A]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre o rol..."
                    className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-[#24313A]/15 rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#24313A]/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F7F8F5] text-[#24313A]/70 border-b border-[#24313A]/10">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Nombre</th>
                        <th className="py-3 px-4 font-semibold">Correo</th>
                        <th className="py-3 px-4 font-semibold">Rol</th>
                        <th className="py-3 px-4 font-semibold">Ciudad</th>
                        <th className="py-3 px-4 font-semibold">Estado</th>
                        <th className="py-3 px-4 font-semibold text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#24313A]/8">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-[#F7F8F5]/60">
                          <td className="py-3 px-4 font-semibold text-[#173B57]">{u.name}</td>
                          <td className="py-3 px-4 text-[#24313A]/80">{u.email}</td>
                          <td className="py-3 px-4 capitalize font-medium text-[#397B91]">
                            {u.role}
                          </td>
                          <td className="py-3 px-4 text-[#24313A]/75">{u.city}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-semibold ${
                                u.active ? 'text-[#779B75]' : 'text-[#DC2626]'
                              }`}
                            >
                              {u.active ? 'Activo' : 'Suspendido'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {u.role !== 'administrador' && (
                              <button
                                type="button"
                                onClick={() => handleToggleUserActive(u)}
                                className="text-xs font-medium text-[#173B57] hover:underline cursor-pointer"
                              >
                                {u.active ? 'Suspender' : 'Reactivar'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BOOKINGS MANAGEMENT */}
          {tab === 'bookings' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-semibold text-[#173B57]">
                    Gestión global de reservas
                  </h1>
                  <p className="text-sm text-[#24313A]/70">
                    Control de operaciones, señas y estados de confirmación en la plataforma.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="h-9 px-3 text-xs bg-white border border-[#24313A]/15 rounded-lg"
                  >
                    <option value="todas">Todos los estados</option>
                    <option value="confirmada">Confirmadas</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="completada">Completadas</option>
                    <option value="cancelada">Canceladas</option>
                  </select>
                  <div className="relative w-52">
                    <Search className="w-4 h-4 text-[#24313A]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Código SR o huésped..."
                      className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-[#24313A]/15 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#24313A]/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F7F8F5] text-[#24313A]/70 border-b border-[#24313A]/10">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Código</th>
                        <th className="py-3 px-4 font-semibold">Alojamiento</th>
                        <th className="py-3 px-4 font-semibold">Huésped</th>
                        <th className="py-3 px-4 font-semibold">Estadía</th>
                        <th className="py-3 px-4 font-semibold text-right">Total ARS</th>
                        <th className="py-3 px-4 font-semibold text-right">Seña 20%</th>
                        <th className="py-3 px-4 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#24313A]/8">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-[#F7F8F5]/60">
                          <td className="py-3 px-4 font-mono font-semibold text-[#173B57]">
                            {b.code}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-[#173B57]">{b.accommodationName}</div>
                            <div className="text-[11px] text-[#24313A]/60">
                              {b.accommodationDestination}
                            </div>
                          </td>
                          <td className="py-3 px-4">{b.guestName}</td>
                          <td className="py-3 px-4 tabular-nums">
                            {formatDateAR(b.checkIn)} — {formatDateAR(b.checkOut)}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold tabular-nums">
                            {formatARS(b.totalAmount)}
                          </td>
                          <td className="py-3 px-4 text-right text-[#779B75] font-semibold tabular-nums">
                            {formatARS(b.depositAmount)}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={b.status}
                              onChange={(e) =>
                                handleBookingStatus(b.id, e.target.value as BookingStatus)
                              }
                              className="h-8 px-2 text-xs bg-[#F7F8F5] border border-[#24313A]/15 rounded-md"
                            >
                              <option value="confirmada">Confirmada</option>
                              <option value="pendiente">Pendiente</option>
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
    </div>
  );
};
