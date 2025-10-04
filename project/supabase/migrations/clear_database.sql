-- Komplette Datenbank bereinigen
-- WARNUNG: Löscht ALLE Daten aus allen Tabellen!

-- Lösche alle Buchungen
DELETE FROM bookings;

-- Lösche alle Historien-Einträge
DELETE FROM booking_history;

-- Optional: Sequences zurücksetzen (falls gewünscht)
-- ALTER SEQUENCE bookings_id_seq RESTART WITH 1;
-- ALTER SEQUENCE booking_history_id_seq RESTART WITH 1;
