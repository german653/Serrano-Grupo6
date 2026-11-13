import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDatesInRange } from '../lib/format';

interface AvailabilityCalendarProps {
  bookedDates: string[];
  blockedDates: string[];
  selectedCheckIn?: string;
  selectedCheckOut?: string;
  interactiveMode?: 'owner-toggle' | 'readonly';
  onToggleBlockDate?: (isoDate: string) => void;
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  bookedDates,
  blockedDates,
  selectedCheckIn,
  selectedCheckOut,
  interactiveMode = 'readonly',
  onToggleBlockDate,
}) => {
  // Default month: November 2026
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(10); // 0-indexed: 10 = Noviembre

  const bookedSet = useMemo(() => new Set(bookedDates), [bookedDates]);
  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);
  const selectedSet = useMemo(() => {
    if (!selectedCheckIn || !selectedCheckOut) return new Set<string>();
    return new Set(getDatesInRange(selectedCheckIn, selectedCheckOut));
  }, [selectedCheckIn, selectedCheckOut]);

  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  // Convert Sunday=0..Saturday=6 to Monday=0..Sunday=6
  const firstDayRaw = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const leadingEmpty = (firstDayRaw + 6) % 7;

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < leadingEmpty; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white rounded-xl border border-[#24313A]/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-base text-[#173B57]">
          {MONTH_NAMES[month]} {year}
        </h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Mes anterior"
            className="p-2 rounded-lg border border-[#24313A]/12 text-[#173B57] hover:bg-[#F7F8F5] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Mes siguiente"
            className="p-2 rounded-lg border border-[#24313A]/12 text-[#173B57] hover:bg-[#F7F8F5] cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-[#24313A]/60 mb-2">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="py-1">
            {wd}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-10" />;
          }
          const mm = String(month + 1).padStart(2, '0');
          const dd = String(day).padStart(2, '0');
          const iso = `${year}-${mm}-${dd}`;
          const isBooked = bookedSet.has(iso);
          const isBlocked = blockedSet.has(iso);
          const isSelected = selectedSet.has(iso) || selectedCheckIn === iso;

          let cellClass =
            'h-10 rounded-lg text-xs font-medium tabular-nums flex items-center justify-center transition-colors ';
          let label = 'Disponible';

          if (isBooked) {
            cellClass += 'bg-[#173B57]/12 text-[#173B57] line-through cursor-not-allowed';
            label = 'Reservado';
          } else if (isBlocked) {
            cellClass +=
              interactiveMode === 'owner-toggle'
                ? 'bg-[#DC2626]/12 text-[#B91C1C] border border-[#DC2626]/30 hover:bg-[#DC2626]/20 cursor-pointer'
                : 'bg-[#24313A]/10 text-[#24313A]/50 line-through cursor-not-allowed';
            label = 'Bloqueado';
          } else if (isSelected) {
            cellClass += 'bg-[#397B91] text-white font-semibold';
            label = 'Seleccionado';
          } else {
            cellClass +=
              interactiveMode === 'owner-toggle'
                ? 'bg-[#779B75]/15 text-[#173B57] hover:bg-[#779B75]/30 cursor-pointer'
                : 'bg-[#F7F8F5] text-[#24313A]';
          }

          return (
            <button
              key={iso}
              type="button"
              disabled={interactiveMode !== 'owner-toggle' || isBooked}
              onClick={() => {
                if (interactiveMode === 'owner-toggle' && !isBooked && onToggleBlockDate) {
                  onToggleBlockDate(iso);
                }
              }}
              title={`${dd}/${mm}/${year} · ${label}`}
              className={cellClass}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[#24313A]/10 flex flex-wrap items-center gap-4 text-xs text-[#24313A]/75">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#779B75]/25 border border-[#779B75]/50 inline-block" />
          Disponible
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#173B57]/20 inline-block" />
          Reservado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#DC2626]/20 border border-[#DC2626]/30 inline-block" />
          Bloqueado por propietario
        </span>
        {selectedCheckIn && selectedCheckOut && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#397B91] inline-block" />
            Tu selección
          </span>
        )}
      </div>
    </div>
  );
};
