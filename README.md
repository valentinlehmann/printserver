# Familie Drucker — Remote Print & Scan

A self-hosted web app that lets family members **outside the home network**
print to and scan from a **Canon GX7100-series** multifunction printer on the
LAN. It runs in Docker on a host inside the network (so it can reach the printer
by IP) and is exposed to the internet through your existing **Caddy** reverse
proxy. Authentication is **passkeys only** (WebAuthn). The UI is in German; the
code and these docs are in English.

> Built on vendor-neutral standards — **IPP** for printing and **eSCL/AirScan**
> for scanning — with runtime capability discovery, so it generalizes to most
> modern AirPrint/Mopria printers (see [Other printers](#other-printers)).

## Features

- **Drucken (Print):** upload a PDF and choose copies, collation, page ranges,
  color/black-white, simplex/duplex (long/short edge), orientation, pages-per-
  sheet, paper size and quality — mirroring a desktop print dialog.
- **Scannen (Scan):** flatbed or ADF, simplex/duplex, color/grayscale/B&W,
  resolution, document size, and **Dokument (→ PDF)** vs **Foto (→ ZIP of
  JPEGs)** output. Progress is shown live; the result downloads when ready.
- **Passkey auth** with admin-managed accounts (no open sign-up).
- Works **offline for development** via a mock printer.

## Architecture

```
 family device ──HTTPS──▶ Caddy (TLS) ──▶ Docker: Next.js app ─┬─ IPP  :631  ─▶ printer
 (outside LAN)                              (on the home LAN)   └─ eSCL :80   ─▶ printer
```

- **Next.js** (App Router) standalone server in a single container.
- **Printing:** direct IPP from Node (`ipp`) — sends the PDF as
  `application/pdf` with job attributes. No CUPS/daemon.
- **Scanning:** a small typed **eSCL** HTTP client — starts a scan job, pulls
  JPEG pages, then assembles a PDF (`pdf-lib`) or a ZIP (`archiver`) server-side.
- **Auth:** [better-auth](https://better-auth.com) with the passkey + admin +
  magic-link plugins; **SQLite** (`better-sqlite3`) on a Docker volume.
- **Capabilities** are discovered at runtime (IPP `Get-Printer-Attributes` /
  eSCL `ScannerCapabilities`) and drive the forms, with a static GX7100 fallback
  when the printer is unreachable.

## Prerequisites

- Node 24+ and pnpm 11+ (for local development)
- Docker + Docker Compose (for deployment)
- A Canon GX7100-series (or other IPP+eSCL) printer reachable by IP on the LAN
- Caddy (or another TLS reverse proxy) to expose the app publicly

## Quick start (local development)

```bash
pnpm install
cp .env.example .env.local          # adjust as needed (defaults work for mock)

# Develop with no real printer — the UI uses mock capabilities/results:
echo "PRINTER_MOCK=1" >> .env.local

pnpm migrate                        # create the SQLite schema
pnpm seed                           # create the admin + print an enrollment link
pnpm dev                            # http://localhost:3000
```

Open the **enrollment link** printed by `pnpm seed`, register your passkey, and
you land on the print page. Passkeys require a secure context — `localhost`
qualifies. To test without a hardware authenticator, use Chrome DevTools →
**WebAuthn** → add a virtual authenticator.

## Environment variables

See `.env.example`. Key ones:

| Variable | Purpose | Default |
| --- | --- | --- |
| `PRINTER_IP` | Printer LAN IP (empty → fallback profile) | `""` |
| `PRINTER_IPP_PORT` / `PRINTER_IPP_PATH` | IPP endpoint | `631` / `/ipp/print` |
| `PRINTER_ESCL_SCHEME/PORT/PATH` | eSCL endpoint | `http` / `80` / `/eSCL` |
| `PRINTER_MOCK` | Serve fixtures instead of hardware | `0` |
| `BETTER_AUTH_SECRET` | Session/cookie secret (set in prod!) | dev-only |
| `BETTER_AUTH_URL` | Public HTTPS URL | `http://localhost:3000` |
| `PASSKEY_RP_ID` | WebAuthn relying-party ID = public host (no scheme/port) | `localhost` |
| `DATABASE_PATH` | SQLite file | `./data/sqlite.db` |
| `MAX_UPLOAD_MB` | Max PDF upload size | `100` |
| `SCAN_JOB_TTL_SECONDS` | How long finished scans stay downloadable | `900` |
| `SEED_ADMIN_EMAIL` | First-run admin to auto-create (Docker) | — |

## Auth model

- **No public sign-up.** An admin creates accounts; the only day-to-day login is
  a passkey.
- **First passkey enrollment** uses an admin-issued, single-use magic link.
  There is no email server: the link is shown to the admin (admin page) or
  printed to the logs (seed / first Docker boot) to share out-of-band.
- The **Verwaltung** (admin) page lets an admin create users and (re)issue
  enrollment links. It is only visible to admins.
- Lost device? Re-issue an enrollment link from the admin page.

## Connecting to a real printer

Set `PRINTER_IP` (and unset `PRINTER_MOCK`). Then verify reachability:

```bash
# IPP (print) — confirm the printer advertises PDF + duplex + color:
ipptool -tv ipp://<PRINTER_IP>:631/ipp/print get-printer-attributes.test

# eSCL (scan) — should return ScannerCapabilities XML:
curl http://<PRINTER_IP>/eSCL/ScannerCapabilities
```

The print/scan pages show live capabilities once reachable; otherwise a banner
indicates the static fallback is in use.

## Docker deployment (behind Caddy)

1. Create a `.env` next to `docker-compose.yml`:

   ```env
   PRINTER_IP=192.168.1.50
   BETTER_AUTH_SECRET=<openssl rand -base64 32>
   BETTER_AUTH_URL=https://print.example.com
   PASSKEY_RP_ID=print.example.com
   SEED_ADMIN_EMAIL=you@example.com      # first boot only
   ```

2. Start it:

   ```bash
   docker compose up -d --build
   docker compose logs -f app            # copy the one-time enrollment link
   ```

   On first boot the container migrates the DB, creates the admin, and logs a
   passkey-enrollment link. Open it (over your public HTTPS URL) and register.

3. Point Caddy at it (see `Caddyfile.example`):

   ```caddy
   print.example.com {
       encode zstd gzip
       request_body { max_size 120MB }
       reverse_proxy 127.0.0.1:3000
   }
   ```

   Caddy must forward the original `Host` (the default) so WebAuthn
   `rpID`/origin match `BETTER_AUTH_URL` / `PASSKEY_RP_ID`.

The SQLite DB persists in the `printerserver-data` volume.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build / run |
| `pnpm migrate` | Apply the better-auth DB schema |
| `pnpm seed` | Create the admin + print an enrollment link |
| `pnpm test` | Unit tests (vitest) |
| `pnpm lint` | ESLint |

## Testing

`pnpm test` covers the printer-independent logic (page-range parsing, IPP
attribute mapping, capability normalization, eSCL XML build/parse, PDF/ZIP
assembly). For an end-to-end check without hardware, run with `PRINTER_MOCK=1`:
the mock produces sample pages so the whole print/scan UI flow works offline.

## Other printers

The app targets the Canon GX7100 but is built on vendor-neutral IPP + eSCL with
capability discovery, so most modern AirPrint/Mopria printers should work by
just changing `PRINTER_IP`. Model-specific assumptions are isolated behind the
`PrinterCapabilities` / `ScannerCapabilities` types and `*_FALLBACK` profiles.
Search the code for `TODO(multi-printer)` and `TODO(quirk)` for the places to
extend (e.g. additional fallback profiles, IPP enum encodings, eSCL firmware
quirks, and an optional CUPS fallback if a printer rejects `application/pdf`).

## Project structure

```
src/app/(auth)/        login + passkey enrollment
src/app/(app)/         dashboard shell: /print, /scan, /admin
src/app/api/           auth, printer/scan capabilities, print, scan job routes
src/lib/auth/          better-auth instance, client, session, enrollment store
src/lib/printer/       IPP capabilities, types, page-range + media helpers
src/lib/print/         IPP client + settings mapping
src/lib/scan/          eSCL client, XML, capabilities, assembly, job store
src/components/         shadcn UI + print/scan/admin forms
scripts/               migrate + seed (tsx)
```
