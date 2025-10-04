import { Trash2, X, Info, Edit } from 'lucide-react';
import { Booking } from '../lib/supabase';

type BookingTableProps = {
  bookings: Booking[];
  onSlotClick: (bookingId: string, slotNumber: number) => void;
  onDelete: (bookingId: string) => void;
  onRemoveFromSlot: (bookingId: string, slotNumber: number) => void;
  onShowHistory: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
};

export function BookingTable({ bookings, onSlotClick, onDelete, onRemoveFromSlot, onShowHistory, onEdit }: BookingTableProps) {
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

  const handleDelete = (bookingId: string) => {
    if (confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
      onDelete(bookingId);
    }
  };

  const getBookingRowColor = (booking: Booking) => {
    // Gelöschte Einträge haben Priorität bei der Darstellung
    if (booking.deleted_at) {
      return 'bg-red-50 opacity-60 hover:bg-red-100';
    }

    const filledSlots = [booking.slot_1, booking.slot_2, booking.slot_3, booking.slot_4].filter(slot => slot !== null).length;

    if (filledSlots === 4) {
      return 'bg-green-50 hover:bg-green-100';
    } else if (filledSlots >= 2) {
      return 'bg-yellow-50 hover:bg-yellow-100';
    } else {
      return 'hover:bg-gray-50';
    }
  };

  const renderSlot = (booking: Booking, slotNumber: number) => {
    const slotName = booking[`slot_${slotNumber}` as keyof Booking] as string | null;

    if (slotName) {
      return (
        <div className="flex items-center justify-center gap-2">
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
            {slotName}
          </span>
          <button
            onClick={() => onRemoveFromSlot(booking.id, slotNumber)}
            className="text-red-500 hover:text-red-700 transition-colors p-1"
            title="Austragen"
          >
            <X size={14} />
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => onSlotClick(booking.id, slotNumber)}
        className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-sm font-medium transition-colors"
      >
        Frei
      </button>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Datum</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ort</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Gebucht von</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Kosten</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Slot 1</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Slot 2</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Slot 3</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Slot 4</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Aktionen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {bookings.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                Keine Einträge vorhanden
              </td>
            </tr>
          ) : (
            bookings.map((booking) => {
              const rowColor = getBookingRowColor(booking);
              return (
                <tr key={booking.id} className={`transition-colors ${rowColor}`}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      {formatDateTime(booking.start_time, booking.end_time)}
                      {booking.deleted_at && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
                          GELÖSCHT
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{booking.location}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{booking.created_by}</td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">{booking.cost}€</td>
                  <td className="px-4 py-3 text-center">{renderSlot(booking, 1)}</td>
                  <td className="px-4 py-3 text-center">{renderSlot(booking, 2)}</td>
                  <td className="px-4 py-3 text-center">{renderSlot(booking, 3)}</td>
                  <td className="px-4 py-3 text-center">{renderSlot(booking, 4)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onShowHistory(booking)}
                        className="text-blue-500 hover:text-blue-700 transition-colors p-2"
                        title="Historie anzeigen"
                      >
                        <Info size={18} />
                      </button>
                      {!booking.deleted_at && (
                        <>
                          <button
                            onClick={() => onEdit(booking)}
                            className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                            title="Eintrag bearbeiten"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2"
                            title="Eintrag löschen"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
