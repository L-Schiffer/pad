import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

type DeletionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, details: string) => void;
  bookingInfo: string;
};

const DELETION_REASONS = [
  'Versehentlich erstellt',
  'Wetter schlecht',
  'Zu wenig Teilnehmer',
  'Anderer Grund',
];

export function DeletionModal({ isOpen, onClose, onConfirm, bookingInfo }: DeletionModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(reason, details);
    setReason('');
    setDetails('');
  };

  const handleClose = () => {
    setReason('');
    setDetails('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Eintrag löschen</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-700">
            Möchten Sie folgenden Eintrag wirklich löschen?
          </p>
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <p className="text-sm font-medium text-gray-900">{bookingInfo}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grund (optional)
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Bitte wählen...</option>
              {DELETION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {reason && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zusätzliche Details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Weitere Informationen..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
