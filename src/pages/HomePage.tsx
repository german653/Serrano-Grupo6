import React from 'react';
import { ArrowRight, CheckCircle2, CreditCard, Headphones, ShieldCheck } from 'lucide-react';
import type { Accommodation, SearchFilters } from '../types';
import { SearchBar } from '../components/SearchBar';
import { AccommodationCard } from '../components/AccommodationCard';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface HomePageProps {
  accommodations: Accommodation[];
  loading: boolean;
  filters: SearchFilters;
  onFiltersChange: (patch: Partial<SearchFilters>) => void;
  onSearch: () => void;
  onSelectAccommodation: (id: string) => void;
  onSelectDestination: (destination: string) => void;
  onGoExplore: () => void;
  onGoAuth: () => void;
}

const DESTINOS_POPULARES = [
  {
    name: 'Villa Carlos Paz',
    subtitle: 'Costanera, Lago San Roque, teatros y gastronomía serrana.',
    travelTime: 'Centro neurálgico del Valle de Punilla',
    mediaKey: 'hero_carlos_paz',
    spanClass: 'md:col-span-2 lg:col-span-2',
  },
  {
    name: 'Tanti',
    subtitle: 'Cascada Los Chorrillos, senderos de piedra y aire puro.',
    travelTime: 'A 15 min de Villa Carlos Paz',
    mediaKey: 'cabanas_del_sol',
    spanClass: 'md:col-span-1 lg:col-span-1',
  },
  {
    name: 'Cabalango',
    subtitle: 'Ollas cristalinas del arroyo y playas tranquilas de arena.',
    travelTime: 'A 12 min de Villa Carlos Paz',
    mediaKey: 'destino_rio_serrano',
    spanClass: 'md:col-span-1 lg:col-span-1',
  },
  {
    name: 'Cuesta Blanca',
    subtitle: 'Reserva natural, río de montaña y vistas panorámicas.',
    travelTime: 'A 18 min de Villa Carlos Paz',
    mediaKey: 'posada_el_mirador',
    spanClass: 'md:col-span-1 lg:col-span-1',
  },
  {
    name: 'San Antonio de Arredondo',
    subtitle: 'Balnearios familiares sobre el río San Antonio y parques.',
    travelTime: 'A 10 min de Villa Carlos Paz',
    mediaKey: 'complejo_las_sierras',
    spanClass: 'md:col-span-1 lg:col-span-1',
  },
];

const BENEFICIOS = [
  {
    index: '01',
    icon: CheckCircle2,
    title: 'Reservas sencillas',
    description:
      'Elegí fechas, verificá disponibilidad en tiempo real y confirmá tu estadía en pocos pasos con cálculo transparente en pesos argentinos.',
  },
  {
    index: '02',
    icon: ShieldCheck,
    title: 'Alojamientos verificados',
    description:
      'Cada cabaña, hotel, apart y posada cuenta con validación presencial de ubicación, servicios reales y fotografías verificadas.',
  },
  {
    index: '03',
    icon: Headphones,
    title: 'Atención personalizada',
    description:
      'Equipo de asistencia turística con base en Villa Carlos Paz para acompañarte antes, durante y después de tu viaje por las sierras.',
  },
  {
    index: '04',
    icon: CreditCard,
    title: 'Pagos seguros',
    description:
      'Congelás tu tarifa abonando únicamente el 20% de seña al reservar y cancelás el 80% restante directamente al ingresar al alojamiento.',
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  accommodations,
  loading,
  filters,
  onFiltersChange,
  onSearch,
  onSelectAccommodation,
  onSelectDestination,
  onGoExplore,
  onGoAuth,
}) => {
  const featuredIds = [
    'acc-los-aromos',
    'acc-vista-lago',
    'acc-las-sierras',
    'acc-del-sol',
    'acc-costa-azul',
    'acc-el-mirador',
  ];

  const featured = featuredIds
    .map((id) => accommodations.find((a) => a.id === id))
    .filter((a): a is Accommodation => Boolean(a));

  const displayFeatured = featured.length >= 6 ? featured : accommodations.slice(0, 6);

  return (
    <div>
      {/* B. HERO PRINCIPAL */}
      <section className="relative min-h-[560px] lg:min-h-[620px] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <ImageWithFallback
            mediaKey="hero_carlos_paz"
            alt="Vista panorámica de Villa Carlos Paz, el Lago San Roque y las Sierras de Córdoba"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E2436]/90 via-[#0E2436]/55 to-[#0E2436]/35" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20 space-y-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs sm:text-sm font-medium tracking-wide text-white/85">
              Villa Carlos Paz · Valle de Punilla · Córdoba, Argentina
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-semibold text-white leading-[1.08] tracking-tight text-balance">
              Tu próxima escapada comienza en las sierras.
            </h1>
            <p className="text-base sm:text-lg text-white/90 max-w-2xl leading-relaxed">
              Encontrá el alojamiento ideal y disfrutá Villa Carlos Paz como nunca.
            </p>
          </div>

          <div className="max-w-5xl">
            <SearchBar
              destination={filters.destination}
              checkIn={filters.checkIn}
              checkOut={filters.checkOut}
              guests={filters.guests}
              onChange={(patch) => onFiltersChange(patch)}
              onSubmit={onSearch}
            />
          </div>
        </div>
      </section>

      {/* C. ALOJAMIENTOS DESTACADOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#173B57] tracking-tight text-balance">
              Alojamientos destacados en las sierras
            </h2>
            <p className="text-sm sm:text-base text-[#24313A]/75 max-w-2xl">
              Establecimientos seleccionados por su ubicación, atención de sus anfitriones y tarifas claras en pesos argentinos.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoExplore}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#173B57] hover:text-[#397B91] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Explorar catálogo completo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-[#24313A]/10 overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-[#24313A]/10" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-[#24313A]/10 rounded w-1/2" />
                  <div className="h-6 bg-[#24313A]/10 rounded w-3/4" />
                  <div className="h-4 bg-[#24313A]/10 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayFeatured.map((acc) => (
              <AccommodationCard
                key={acc.id}
                accommodation={acc}
                onSelect={onSelectAccommodation}
              />
            ))}
          </div>
        )}
      </section>

      {/* D. DESTINOS POPULARES */}
      <section id="destinos" className="bg-white border-y border-[#24313A]/10 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 mb-10">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#173B57] tracking-tight text-balance">
              Destinos populares del Valle de Punilla
            </h2>
            <p className="text-sm sm:text-base text-[#24313A]/75 max-w-2xl">
              Elegí entre el movimiento de la costanera del Lago San Roque o la calma de los arroyos serranos a pocos minutos de distancia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DESTINOS_POPULARES.map((dest) => (
              <button
                key={dest.name}
                type="button"
                onClick={() => onSelectDestination(dest.name)}
                className={`group relative overflow-hidden rounded-xl min-h-[260px] text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#397B91] ${dest.spanClass}`}
              >
                <ImageWithFallback
                  mediaKey={dest.mediaKey}
                  alt={`Destino turístico ${dest.name} en Córdoba`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D2233]/85 via-[#0D2233]/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-1.5">
                  <p className="text-xs font-medium text-white/80">{dest.travelTime}</p>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-2xl font-semibold">{dest.name}</h3>
                    <ArrowRight className="w-5 h-5 shrink-0 transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="text-sm text-white/85 line-clamp-2">{dest.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* E. SECCIÓN DE BENEFICIOS Y CÓMO FUNCIONA */}
      <section id="como-funciona" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-5">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#173B57] tracking-tight text-balance">
              Cómo funciona Serrano Reservas
            </h2>
            <p className="text-base text-[#24313A]/80 leading-relaxed">
              Diseñamos un proceso directo para que reserves sin intermediarios opacos. Consultás disponibilidad real, congelás tu estadía con una seña del 20% y coordinás tu llegada directamente con el anfitrión.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onGoExplore}
                className="px-5 py-2.5 bg-[#173B57] hover:bg-[#102B40] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Buscar disponibilidad
              </button>
              <button
                type="button"
                onClick={onGoAuth}
                className="px-5 py-2.5 bg-white hover:bg-[#F7F8F5] text-[#173B57] border border-[#24313A]/15 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Sumar mi establecimiento
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {BENEFICIOS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.index}
                  className="bg-white rounded-xl border border-[#24313A]/10 p-6 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#397B91] tabular-nums">
                      {item.index}.
                    </span>
                    <Icon className="w-5 h-5 text-[#779B75]" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#173B57]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#24313A]/75 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
