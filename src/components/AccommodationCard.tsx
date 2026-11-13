import React from 'react';
import { MapPin, Star, Users } from 'lucide-react';
import type { Accommodation } from '../types';
import { formatARS } from '../lib/format';
import { ImageWithFallback } from './ImageWithFallback';

interface AccommodationCardProps {
  accommodation: Accommodation;
  onSelect: (id: string) => void;
}

export const AccommodationCard: React.FC<AccommodationCardProps> = ({
  accommodation,
  onSelect,
}) => {
  const topAmenities = accommodation.amenities.slice(0, 3).join(' · ');

  return (
    <article className="group bg-white rounded-xl border border-[#24313A]/10 overflow-hidden transition-shadow duration-200 hover:shadow-md flex flex-col">
      <button
        type="button"
        onClick={() => onSelect(accommodation.id)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#F7F8F5] cursor-pointer text-left"
      >
        <ImageWithFallback
          mediaKey={accommodation.galleryKeys[0] || 'cabanas_los_aromos'}
          alt={`${accommodation.name} en ${accommodation.destination}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </button>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          {/* Clean unboxed metadata row */}
          <div className="flex items-center justify-between gap-2 text-xs text-[#24313A]/70">
            <span className="truncate font-medium text-[#397B91]">
              {accommodation.type} · {accommodation.destination}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#173B57] tabular-nums shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#173B57] text-[#173B57]" />
              {accommodation.rating.toFixed(1).replace('.', ',')}
              <span className="font-normal text-[#24313A]/60">({accommodation.reviewCount})</span>
            </span>
          </div>

          <h3 className="font-display text-xl font-semibold text-[#173B57] leading-snug">
            <button
              type="button"
              onClick={() => onSelect(accommodation.id)}
              className="text-left hover:text-[#397B91] transition-colors cursor-pointer"
            >
              {accommodation.name}
            </button>
          </h3>

          <p className="text-xs text-[#24313A]/70 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#779B75] shrink-0" />
            <span className="truncate">{accommodation.zoneReference}</span>
          </p>

          <p className="text-sm text-[#24313A]/85 line-clamp-2 leading-relaxed">
            {accommodation.shortDescription}
          </p>

          <div className="pt-1 flex items-center gap-2 text-xs text-[#24313A]/70">
            <span className="inline-flex items-center gap-1 shrink-0 tabular-nums">
              <Users className="w-3.5 h-3.5 text-[#397B91]" />
              Hasta {accommodation.maxGuests} huéspedes
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{topAmenities}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#24313A]/8 flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-[#173B57] tabular-nums">
              {formatARS(accommodation.pricePerNight)}
            </div>
            <div className="text-xs text-[#24313A]/60">por noche · ARS</div>
          </div>

          <button
            type="button"
            onClick={() => onSelect(accommodation.id)}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#173B57] hover:bg-[#397B91] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Ver alojamiento
          </button>
        </div>
      </div>
    </article>
  );
};
