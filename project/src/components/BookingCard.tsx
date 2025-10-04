import { Trash2, MapPin, Calendar, X, Info, Edit } from 'lucide-react';
import { Booking } from '../lib/supabase';

type BookingCardProps = {
  booking: Booking;
  onSlotClick: (bookingId: string, slotNumber: number) => void;
  onDelete: (bookingId: string) => void;
  onRemoveFromSlot: (bookingId: string, slotNumber: number) => void;
  onShowHistory: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
};

export function BookingCard({ booking, onSlotClick, onDelete, onRemoveFromSlot, onShowHistory, onEdit }: BookingCardProps) {
  const formatDateTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const weekday = start.toLocaleDateString('de-DE', {
      weekday: 'long',
    });

    const dateStr = start.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const startTimeStr = start.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const endTimeStr = end.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${weekday}, ${dateStr} ${startTimeStr}–${endTimeStr}`;
  };

  const handleDelete = () => {
    if (confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
      onDelete(booking.id);
    }
  };

  const getCardBackgroundColor = () => {
    const filledSlots = [booking.slot_1, booking.slot_2, booking.slot_3, booking.slot_4].filter(slot => slot !== null).length;

    if (filledSlots === 4) {
      return 'bg-green-50 border-green-200';
    } else if (filledSlots >= 2) {
      return 'bg-yellow-50 border-yellow-200';
    } else {
      return 'bg-white';
    }
  };

  const slots = [
    { number: 1, name: booking.slot_1 },
    { number: 2, name: booking.slot_2 },
    { number: 3, name: booking.slot_3 },
    { number: 4, name: booking.slot_4 },
  ];

  const cardColor = getCardBackgroundColor();

  return (
    <div className={`rounded-lg shadow-md p-4 space-y-3 border ${cardColor}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar size={18} />
            <span className="font-medium">{formatDateTime(booking.start_time, booking.end_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={18} />
            <span>{booking.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span>Gebucht von: {booking.created_by}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-900">
            <span className="font-semibold">Kosten: {booking.cost}€</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onShowHistory(booking)}
            className="text-blue-500 hover:text-blue-700 transition-colors p-2"
            title="Historie anzeigen"
          >
            <Info size={20} />
          </button>
          <button
            onClick={() => onEdit(booking)}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2"
            title="Eintrag bearbeiten"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 transition-colors p-2"
            title="Eintrag löschen"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        {slots.map((slot) => (
          <div key={slot.number}>
            {slot.name ? (
              <div className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm">
                <div className="font-medium text-gray-700 mb-1">Slot {slot.number}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{slot.name}</span>
                  <button
                    onClick={() => onRemoveFromSlot(booking.id, slot.number)}
                    className="text-red-500 hover:text-red-700 transition-colors ml-2"
                    title="Austragen"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onSlotClick(booking.id, slot.number)}
                className="w-full px-3 py-2 rounded border border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium"
              >
                <div>Slot {slot.number}</div>
                <div className="text-xs mt-1">Frei</div>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
