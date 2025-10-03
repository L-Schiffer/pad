import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase, Booking } from './lib/supabase';
import { BookingModal } from './components/BookingModal';
import { SlotModal } from './components/SlotModal';
import { BookingTable } from './components/BookingTable';
import { BookingCard } from './components/BookingCard';

function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{ id: string; slotNumber: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPastBookings, setShowPastBookings] = useState(false);

  useEffect(() => {
    fetchBookings();

    // Realtime Subscription für Live-Updates
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          // Bei jeder Änderung Daten neu laden
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showPastBookings]);

  const fetchBookings = async () => {
    try {
      let query = supabase
        .from('bookings')
        .select('*');

      // Nur zukünftige Termine anzeigen, wenn Filter nicht aktiv
      if (!showPastBookings) {
        query = query.gt('end_time', new Date().toISOString());
      }

      const { data, error } = await query.order('start_time', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (bookingData: {
    location: string;
    startTime: string;
    endTime: string;
    createdBy: string;
    addToSlot1: boolean;
    cost: number;
  }) => {
    try {
      const { error } = await supabase.from('bookings').insert({
        location: bookingData.location,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        created_by: bookingData.createdBy,
        slot_1: bookingData.addToSlot1 ? bookingData.createdBy : null,
        cost: bookingData.cost,
      });

      if (error) throw error;
      setIsBookingModalOpen(false);
      fetchBookings(); // Daten nach dem Erstellen neu laden
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Fehler beim Erstellen des Eintrags');
    }
  };

  const handleSlotClick = (bookingId: string, slotNumber: number) => {
    setSelectedBooking({ id: bookingId, slotNumber });
    setIsSlotModalOpen(true);
  };

  const handleSlotSubmit = async (name: string) => {
    if (!selectedBooking) return;

    try {
      // Zuerst aktuellen Status des Slots prüfen
      const { data: currentBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', selectedBooking.id)
        .single();

      if (fetchError) throw fetchError;

      // Prüfen ob der Slot noch frei ist
      const slotKey = `slot_${selectedBooking.slotNumber}` as keyof Booking;
      if (currentBooking[slotKey] !== null) {
        alert('Dieser Slot wurde bereits von jemand anderem belegt. Bitte wähle einen anderen Slot.');
        setIsSlotModalOpen(false);
        setSelectedBooking(null);
        fetchBookings(); // Aktualisierte Daten laden
        return;
      }

      // Slot ist frei, jetzt Update durchführen
      const { error } = await supabase
        .from('bookings')
        .update({ [`slot_${selectedBooking.slotNumber}`]: name })
        .eq('id', selectedBooking.id)
        .is(`slot_${selectedBooking.slotNumber}`, null); // Nur updaten wenn noch null

      if (error) throw error;

      setIsSlotModalOpen(false);
      setSelectedBooking(null);
      fetchBookings(); // Daten nach dem Update neu laden
    } catch (error) {
      console.error('Error updating slot:', error);
      alert('Fehler beim Eintragen');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId);

      if (error) throw error;
      fetchBookings(); // Daten nach dem Löschen neu laden
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Fehler beim Löschen des Eintrags');
    }
  };

  const handleRemoveFromSlot = async (bookingId: string, slotNumber: number) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ [`slot_${slotNumber}`]: null })
        .eq('id', bookingId);

      if (error) throw error;
      fetchBookings(); // Daten nach dem Update neu laden
    } catch (error) {
      console.error('Error removing from slot:', error);
      alert('Fehler beim Austragen');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Padel Court Buchungen</h1>

          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">Wichtige Hinweise</h2>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>Bitte tragt euch selbst in die Slots ein.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>First come, first serve.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>Wer nicht kann, trägt sich selbst wieder aus. Sind es weniger als 24h bis zum Termin, sorgt man selbst für Ersatz.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>Jeder sollte mal Bälle beisteuern.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>Bitte bezahlt umgehend.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            <span className="font-medium">Neuen Eintrag anlegen</span>
          </button>

          <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPastBookings}
                onChange={(e) => setShowPastBookings(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Vergangene Termine anzeigen</span>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <BookingTable
                bookings={bookings}
                onSlotClick={handleSlotClick}
                onDelete={handleDeleteBooking}
                onRemoveFromSlot={handleRemoveFromSlot}
              />
            </div>

            <div className="md:hidden grid gap-4">
              {bookings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                  Keine Einträge vorhanden
                </div>
              ) : (
                bookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onSlotClick={handleSlotClick}
                    onDelete={handleDeleteBooking}
                    onRemoveFromSlot={handleRemoveFromSlot}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={handleCreateBooking}
      />

      <SlotModal
        isOpen={isSlotModalOpen}
        onClose={() => {
          setIsSlotModalOpen(false);
          setSelectedBooking(null);
        }}
        onSubmit={handleSlotSubmit}
        slotNumber={selectedBooking?.slotNumber || 1}
      />
    </div>
  );
}

export default App;
