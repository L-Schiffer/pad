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

  useEffect(() => {
    fetchBookings();

    const subscription = supabase
      .channel('bookings-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .gt('end_time', new Date().toISOString())
        .order('start_time', { ascending: true });

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
  }) => {
    try {
      const { error } = await supabase.from('bookings').insert({
        location: bookingData.location,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        created_by: bookingData.createdBy,
        slot_1: bookingData.addToSlot1 ? bookingData.createdBy : null,
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
      const { error } = await supabase
        .from('bookings')
        .update({ [`slot_${selectedBooking.slotNumber}`]: name })
        .eq('id', selectedBooking.id);

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Padel Court Buchungen</h1>
          <p className="text-gray-600">Verwalte deine Padel-Spieltermine</p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            <span className="font-medium">Neuen Eintrag anlegen</span>
          </button>
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
