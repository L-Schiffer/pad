import { useState } from 'react';
import { X } from 'lucide-react';

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: {
    location: string;
    startTime: string;
    endTime: string;
    createdBy: string;
    addToSlot1: boolean;
  }) => void;
};

export function BookingModal({ isOpen, onClose, onSubmit }: BookingModalProps) {
  const [location, setLocation] = useState('Uni Köln');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [addToSlot1, setAddToSlot1] = useState(true);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!createdBy.trim()) {
      setError('Bitte geben Sie Ihren Namen ein');
      return;
    }

    if (!date || !startTime || !endTime) {
      setError('Bitte füllen Sie alle Felder aus');
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (startDateTime >= endDateTime) {
      setError('Die Startzeit muss vor der Endzeit liegen');
      return;
    }

    if (endDateTime <= new Date()) {
      setError('Die Endzeit muss in der Zukunft liegen');
      return;
    }

    onSubmit({
      location,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      createdBy: createdBy.trim(),
      addToSlot1,
    });

    setLocation('Uni Köln');
    setDate('');
    setStartTime('');
    setEndTime('');
    setCreatedBy('');
    setAddToSlot1(true);
    setError('');
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Neuen Eintrag anlegen</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ort
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Padelbox Weiden">Padelbox Weiden</option>
              <option value="Padelbox Lövenich">Padelbox Lövenich</option>
              <option value="Uni Köln">Uni Köln</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Startzeit (24h Format)
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Wählen Sie eine Zeit</option>
                {Array.from({ length: 96 }, (_, i) => {
                  const hours = Math.floor(i / 4);
                  const minutes = (i % 4) * 15;
                  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                  return (
                    <option key={timeString} value={timeString}>
                      {timeString}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endzeit (24h Format)
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Wählen Sie eine Zeit</option>
                {Array.from({ length: 96 }, (_, i) => {
                  const hours = Math.floor(i / 4);
                  const minutes = (i % 4) * 15;
                  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                  return (
                    <option key={timeString} value={timeString}>
                      {timeString}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ihr Name
            </label>
            <input
              type="text"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              placeholder="Max Mustermann"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="addToSlot1"
              checked={addToSlot1}
              onChange={(e) => setAddToSlot1(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="addToSlot1" className="ml-2 text-sm text-gray-700">
              Mich direkt in Slot 1 eintragen
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
