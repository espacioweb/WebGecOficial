"""Invoke the protected preview scheduler; its recipient allowlist stays active."""
import json
from pathlib import Path
import urllib.request
import urllib.error

req = urllib.request.Request(
    'https://brief-recovery.webgecoficial.pages.dev/api/brief/reminders',
    method='POST',
    headers={
        'Authorization': 'Bearer ' + Path('.brief-recovery-secrets.local').read_text().strip(),
        'User-Agent': 'GEC-Brief-Recovery-Preview/1.0',
    },
)
try:
    with urllib.request.urlopen(req, timeout=60) as response:
        result = json.load(response)
    print(json.dumps(result))
except urllib.error.HTTPError as error:
    print(json.dumps({'status': error.code, 'content_type': error.headers.get('Content-Type'),
                      'mitigated': error.headers.get('cf-mitigated'),
                      'response_start': error.read(200).decode(errors='replace')}))
    raise SystemExit(1)
