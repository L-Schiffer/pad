import { useState, useEffect } from 'react';
import { X, Clock, User, Calendar } from 'lucide-react';
import { supabase, BookingHistory, Booking } from '../lib/supabase';

type HistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
};

export function HistoryModal({ isOpen, onClose, booking }: HistoryModalProps) {
  const [history, setHistory] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, booking.id]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('booking_history')
        .select('*')
        .eq('booking_id', booking.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const translateFieldName = (fieldName: string): string => {
    const translations: Record<string, string> = {
      'location': 'Ort',
      'start_time': 'Startzeit',
      'end_time': 'Endzeit',
      'cost': 'Preis pro Person',
      'created_by': 'Ersteller',
      'slot_1': 'Slot 1',
      'slot_2': 'Slot 2',
      'slot_3': 'Slot 3',
      'slot_4': 'Slot 4',
    };
    return translations[fieldName] || fieldName;
  };

  const formatValue = (fieldName: string, value: string): string => {
    if (fieldName === 'start_time' || fieldName === 'end_time') {
      const date = new Date(value);
      return date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (fieldName === 'cost') {
      return `${Number(value).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`;
    }
    return value;
  };

  const getActionText = (entry: BookingHistory) => {
    switch (entry.action) {
      case 'created':
        return {
          icon: <Calendar className="text-blue-500" size={16} />,
          text: 'Buchung erstellt',
          details: `Ort: ${booking.location}, Preis pro Person: ${booking.cost.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`,
        };
      case 'slot_filled':
        return {
          icon: <User className="text-green-500" size={16} />,
          text: `${entry.slot_value} hat sich in Slot ${entry.slot_number} eingetragen`,
          details: null,
        };
      case 'slot_removed':
        return {
          icon: <User className="text-red-500" size={16} />,
          text: `${entry.slot_value} hat sich aus Slot ${entry.slot_number} ausgetragen`,
          details: null,
        };
      case 'updated':
        const translatedField = translateFieldName(entry.field_name || '');
        const formattedOldValue = formatValue(entry.field_name || '', entry.old_value || '');
        const formattedNewValue = formatValue(entry.field_name || '', entry.new_value || '');
        return {
          icon: <Clock className="text-orange-500" size={16} />,
          text: `${translatedField} geändert`,
          details: `Von "${formattedOldValue}" zu "${formattedNewValue}"`,
        };
      default:
        return {
          icon: <Clock className="text-gray-500" size={16} />,
          text: entry.action,
          details: null,
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Änderungshistorie</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Keine Änderungshistorie verfügbar
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => {
                const action = getActionText(entry);
                return (
                  <div
                    key={entry.id}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-shrink-0 mt-1">{action.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{action.text}</p>
                      {action.details && (
                        <p className="text-sm text-gray-600 mt-1">{action.details}</p>
                      )}
                      {entry.changed_by && (
                        <p className="text-xs text-gray-500 mt-1">
                          von {entry.changed_by}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDateTime(entry.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
