import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Accommodation, SearchFilters } from '../types';
import { formatARS } from '../lib/format';
import { SearchBar } from '../components/SearchBar';
import { AccommodationCard } from '../components/AccommodationCard';

interface ExplorePageProps {
  accommodations: Accommodation[];
  loading: boolean;
  filters: SearchFilters;
  onFiltersChange: (patch: Partial<SearchFilters>) => void;
  onApplySearch: () => void;
  onResetFilters: () => void;
  onSelectAccommodation: (id: string) => void;
}

const PROPERTY_TYPES = ['Todos', 'Cabaña', 'Hotel', 'Complejo', 'Apart', 'Posada'];

const AMENITY_OPTIONS = [
  'Pileta',
  'Parrilla',
  'Wi-Fi',
  'Estacionamiento',
  'Vista al lago',
  'Aire acondicionado',
  'Desayuno',
  'Pet friendly',
];

export const ExplorePage: React.FC<ExplorePageProps> = ({
  accommodations,
  loading,
  filters,
  onFiltersChange,
  onApplySearch,
  onResetFilters,
  onSelectAccommodation,
}) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleAmenity = (amenity: string) => {
    const exists = filters.amenities.includes(amenity);
    const next = exists
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onFiltersChange({ amenities: next });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.destination !== 'Todos') count++;
    if (filters.type !== 'Todos') count++;
    if (filters.maxPrice < 250000) count++;
    count += filters.amenities.length;
    return count;
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold text-[#173B57] tracking-tight">
              Alojamientos en Villa Carlos Paz y alrededores
            </h1>
            <p className="text-sm text-[#24313A]/75 mt-1">
              Filtrá por localidad, tipo de establecimiento, presupuesto en ARS y servicios.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#24313A]/15 rounded-lg text-sm font-medium text-[#173B57]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
          </button>
        </div>

        <SearchBar
          compact
          destination={filters.destination}
          checkIn={filters.checkIn}
          checkOut={filters.checkOut}
          guests={filters.guests}
          onChange={(patch) => onFiltersChange(patch)}
          onSubmit={onApplySearch}
        />
      </div>

      {/* Type Segmented Filter Bar + Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#24313A]/10">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {PROPERTY_TYPES.map((t) => {
            const active = filters.type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onFiltersChange({ type: t })}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#173B57] text-white'
                    : 'bg-white text-[#24313A]/80 border border-[#24313A]/12 hover:border-[#397B91]'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
          <span className="text-xs font-medium text-[#24313A]/70 tabular-nums">
            {accommodations.length}{' '}
            {accommodations.length === 1 ? 'alojamiento encontrado' : 'alojamientos encontrados'}
          </span>

          <select
            aria-label="Ordenar resultados"
            value={filters.sortBy}
            onChange={(e) =>
              onFiltersChange({ sortBy: e.target.value as SearchFilters['sortBy'] })
            }
            className="h-9 px-3 text-xs font-medium bg-white border border-[#24313A]/15 rounded-lg text-[#173B57] focus:outline-none focus:ring-2 focus:ring-[#397B91]"
          >
            <option value="recommended">Ordenar: Recomendados</option>
            <option value="price_asc">Menor precio por noche</option>
            <option value="price_desc">Mayor precio por noche</option>
            <option value="rating_desc">Mejor puntuación</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside
          className={`lg:col-span-3 bg-white rounded-xl border border-[#24313A]/10 p-5 space-y-6 ${
            mobileFiltersOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#173B57]">Refinar búsqueda</h2>
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-medium text-[#397B91] hover:underline cursor-pointer"
            >
              Limpiar todo
            </button>
          </div>

          <div className="space-y-3 pt-2 border-t border-[#24313A]/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#24313A]">Precio máximo / noche</span>
              <span className="font-semibold text-[#173B57] tabular-nums">
                {formatARS(filters.maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min={80000}
              max={250000}
              step={5000}
              value={filters.maxPrice}
              onChange={(e) => onFiltersChange({ maxPrice: Number(e.target.value) })}
              className="w-full accent-[#173B57] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#24313A]/60 tabular-nums">
              <span>$ 80.000</span>
              <span>$ 250.000+</span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#24313A]/10">
            <h3 className="text-xs font-semibold text-[#24313A]">Servicios incluidos</h3>
            <div className="space-y-2.5">
              {AMENITY_OPTIONS.map((amenity) => {
                const checked = filters.amenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    className="flex items-center gap-2.5 text-sm text-[#24313A]/85 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(amenity)}
                      className="w-4 h-4 rounded border-[#24313A]/30 accent-[#173B57] cursor-pointer"
                    />
                    <span>{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {mobileFiltersOpen && (
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full lg:hidden py-2.5 bg-[#173B57] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Aplicar y cerrar
            </button>
          )}
        </aside>

        {/* Results Grid */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-xl border border-[#24313A]/10 overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-[#24313A]/10" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-[#24313A]/10 rounded w-1/2" />
                    <div className="h-6 bg-[#24313A]/10 rounded w-2/3" />
                    <div className="h-4 bg-[#24313A]/10 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : accommodations.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#24313A]/10 p-10 text-center space-y-4">
              <h3 className="font-display text-2xl font-semibold text-[#173B57]">
                No encontramos alojamientos con esa combinación
              </h3>
              <p className="text-sm text-[#24313A]/75 max-w-md mx-auto">
                Probá ampliando el presupuesto máximo por noche, quitando algún servicio específico o seleccionando otras fechas en Villa Carlos Paz y Punilla.
              </p>
              <button
                type="button"
                onClick={onResetFilters}
                className="px-5 py-2.5 bg-[#173B57] hover:bg-[#102B40] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accommodations.map((acc) => (
                <AccommodationCard
                  key={acc.id}
                  accommodation={acc}
                  onSelect={onSelectAccommodation}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
