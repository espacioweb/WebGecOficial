"""Configure isolated brief recovery bindings without exposing credentials.

Uses Wrangler's existing OAuth session. Does not send emails or deploy code.
"""
import argparse
import json
import os
from pathlib import Path
import re
import secrets
import urllib.request

ACCOUNT = '659c2e0cabd21dda588758bee336c9d0'
PROJECT = 'webgecoficial'
API = f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/pages/projects/{PROJECT}'
PRIVATE = Path('.brief-recovery-secrets.local')


def api(method, data=None):
    config = (Path.home() / '.wrangler/config/default.toml').read_text()
    match = re.search(r'^oauth_token\s*=\s*("[^"\n]+")', config, re.MULTILINE)
    if not match:
        raise RuntimeError('Wrangler OAuth session unavailable')
    token = json.loads(match.group(1))
    req = urllib.request.Request(API, method=method, headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }, data=json.dumps(data).encode() if data is not None else None)
    with urllib.request.urlopen(req, timeout=30) as response:
        result = json.load(response)
    if not result.get('success'):
        raise RuntimeError('Cloudflare rejected configuration update')
    return result['result']


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--preview-db')
    parser.add_argument('--recipient')
    parser.add_argument('--production-db')
    args = parser.parse_args()
    project = api('GET')
    configs = project['deployment_configs']
    if not args.preview_db and not args.production_db:
        print(json.dumps({env: {
            'compatibility_date': cfg.get('compatibility_date'),
            'd1_bindings': list((cfg.get('d1_databases') or {}).keys()),
            'variables': {name: value.get('type') for name, value in (cfg.get('env_vars') or {}).items()},
        } for env, cfg in configs.items()}, indent=2))
        return
    private = Path('.brief-recovery-production-secrets.local') if args.production_db else PRIVATE
    secret = private.read_text().strip() if private.exists() else secrets.token_urlsafe(48)
    if not private.exists():
        fd = os.open(private, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'w') as file:
            file.write(secret)
    env = 'production' if args.production_db else 'preview'
    cfg = configs[env]
    before = {
        'deployment_configs': {env: {
            'd1_databases': cfg.get('d1_databases') or {},
            'env_vars': {k: v for k, v in (cfg.get('env_vars') or {}).items() if k.startswith('BRIEF_')},
        }},
    }
    backup = Path('.backups/brief-recovery-20261011')
    backup.mkdir(parents=True, exist_ok=True)
    backup_path = backup / f'cloudflare-{env}-before.local'
    if not backup_path.exists():
        fd = os.open(backup_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'w') as file:
            json.dump(before, file)
    # PATCH merges env_vars. Never round-trip redacted existing secret entries:
    # an entry without its value can replace a configured secret with an empty one.
    bindings = {**(cfg.get('d1_databases') or {}), 'BRIEF_DB': {'id': args.production_db or args.preview_db}}
    variables = {
        'BRIEF_RECOVERY_SECRET': {'type': 'secret_text', 'value': secret},
        'BRIEF_SITE_URL': {'type': 'plain_text', 'value': 'https://grupoespaciocreativo.com' if env == 'production' else 'https://brief-recovery.webgecoficial.pages.dev'},
    }
    if env == 'preview':
        variables['BRIEF_REMINDER_DELAY_MS'] = {'type': 'plain_text', 'value': '60000'}
        variables['BRIEF_TEST_RECIPIENT'] = {'type': 'plain_text', 'value': args.recipient or 'disabled-test@example.invalid'}
    api('PATCH', {'deployment_configs': {env: {'d1_databases': bindings, 'env_vars': variables}}})
    after = api('GET')['deployment_configs'][env]
    print(json.dumps({'environment': env, 'binding': after.get('d1_databases', {}).get('BRIEF_DB'),
                      'recovery_secret_configured': 'BRIEF_RECOVERY_SECRET' in after.get('env_vars', {}),
                      'resend_configured': 'RESEND_API_KEY' in after.get('env_vars', {}),
                      'test_recipient_configured': bool(args.recipient)}, indent=2))


if __name__ == '__main__':
    main()
