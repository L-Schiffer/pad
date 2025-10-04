# Automatische Bereinigung gelöschter Einträge

## Setup in Supabase

### 1. Edge Function deployen

```bash
# Im Projektverzeichnis
cd project
supabase functions deploy cleanup-deleted-bookings
```

### 2. Cron Job einrichten

Gehen Sie im Supabase Dashboard zu **Database** → **Cron Jobs** und erstellen Sie einen neuen Job:

**Name:** `cleanup-deleted-bookings`

**Schedule:** `0 3 * * *` (Täglich um 3 Uhr nachts)

**SQL Command:**
```sql
SELECT
  net.http_post(
    url:='https://pediisirpbcrximyafkc.supabase.co/functions/v1/cleanup-deleted-bookings',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
  ) as request_id;
```

**Alternative: Direkt per SQL (ohne Edge Function)**

Falls Sie die Edge Function nicht nutzen möchten, können Sie auch direkt einen Cron Job mit SQL erstellen:

```sql
-- Aktivieren Sie die pg_cron Extension (falls noch nicht aktiv)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Erstellen Sie den Cron Job
SELECT cron.schedule(
  'cleanup-deleted-bookings',
  '0 3 * * *', -- Täglich um 3 Uhr nachts
  $$
  DELETE FROM bookings
  WHERE deleted_at IS NOT NULL
    AND deleted_at < NOW() - INTERVAL '45 days';
  $$
);
```

## Was passiert?

- Jeden Tag um 3 Uhr nachts werden alle gelöschten Einträge (`deleted_at IS NOT NULL`) entfernt, die älter als 45 Tage sind
- Die Historie (`booking_history`) bleibt erhalten
- Aktive Buchungen werden nicht gelöscht

## Manuelle Ausführung (zum Testen)

Sie können den Cleanup auch manuell testen:

```sql
DELETE FROM bookings
WHERE deleted_at IS NOT NULL
  AND deleted_at < NOW() - INTERVAL '45 days';
```
