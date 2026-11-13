import React from 'react';
import { Calendar, MapPin, Search, Users } from 'lucide-react';

interface SearchBarProps {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  onChange: (patch: {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }) => void;
  onSubmit: () => void;
  compact?: boolean;
}

const DESTINATIONS = [
  'Todos',
  'Villa Carlos Paz',
  'Tanti',
  'Cabalango',
  'Cuesta Blanca',
  'San Antonio de Arredondo',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  destination,
  checkIn,
  checkOut,
  guests,
  onChange,
  onSubmit,
  compact = false,
}) => {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className={`bg-white rounded-xl border border-[#24313A]/12 shadow-lg ${
        compact ? 'p-3' : 'p-4 sm:p-5'
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        <div className="lg:col-span-4">
          <label className="block text-xs font-medium text-[#24313A]/75 mb-1.5">Destino</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-[#397B91] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={destination}
              onChange={(e) => onChange({ destination: e.target.value })}
              className="w-full h-11 pl-9 pr-3 text-sm font-medium text-[#24313A] bg-[#F7F8F5] border border-[#24313A]/12 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397B91] focus:bg-white"
            >
              {DESTINATIONS.map((dest) => (
                <option key={dest} value={dest}>
                  {dest === 'Todos' ? 'Todos los destinos de Punilla' : dest}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="lg:col-span-3">
          <label className="block text-xs font-medium text-[#24313A]/75 mb-1.5">
            Fecha de ingreso
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-[#397B91] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => onChange({ checkIn: e.target.value })}
              className="w-full h-11 pl-9 pr-3 text-sm font-medium text-[#24313A] bg-[#F7F8F5] border border-[#24313A]/12 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-[#397B91] focus:bg-white"
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-[#24313A]/75 mb-1.5">
            Fecha de salida
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-[#397B91] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => onChange({ checkOut: e.target.value })}
              className="w-full h-11 pl-9 pr-3 text-sm font-medium text-[#24313A] bg-[#F7F8F5] border border-[#24313A]/12 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-[#397B91] focus:bg-white"
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-[#24313A]/75 mb-1.5">Huéspedes</label>
          <div className="relative">
            <Users className="w-4 h-4 text-[#397B91] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={guests}
              onChange={(e) => onChange({ guests: Number(e.target.value) })}
              className="w-full h-11 pl-8 pr-2 text-sm font-medium text-[#24313A] bg-[#F7F8F5] border border-[#24313A]/12 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-[#397B91] focus:bg-white"
            >
              {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="lg:col-span-2">
          <button
            type="submit"
            className="w-full h-11 px-4 bg-[#173B57] hover:bg-[#102B40] text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#397B91]"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>Buscar alojamientos</span>
          </button>
        </div>
      </div>
    </form>
  );
};
