#!/bin/sh
set -e

# Start the CUPS scheduler used by the rasterizing print path. The Next.js
# server submits jobs to it via `lp`, and CUPS converts the PDF into the format
# the printer understands (IPP Everywhere driver).
mkdir -p /var/run/cups /var/log/cups /var/spool/cups
/usr/sbin/cupsd

# Wait for the scheduler to come up (best effort).
for _ in $(seq 1 40); do
  if lpstat -r >/dev/null 2>&1; then break; fi
  sleep 0.5
done

exec node server.js
