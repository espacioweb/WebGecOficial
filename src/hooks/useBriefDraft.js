import { useEffect, useRef, useState, useCallback } from 'react';

// Single flight + latest pending snapshot: a slow save never overwrites a newer one.
export default function useBriefDraft({ answers, step, source, consent, enabled, initialToken }) {
  const token = useRef(initialToken || null);
  const clientId = useRef(null);
  useEffect(() => { if (!clientId.current) clientId.current = crypto.randomUUID(); }, []);
  const pending = useRef(null);
  const running = useRef(null);
  const stopped = useRef(false);
  const mounted = useRef(true);
  const [status, setStatus] = useState('idle');
  const [lastSaved, setLastSaved] = useState(null);
  const snapshotKey = JSON.stringify({ answers, step, source, reminderConsent: consent });
  const latest = useRef(null);
  const canSave = useRef(enabled);
  useEffect(() => { canSave.current = enabled; }, [enabled]);
  useEffect(() => { latest.current = { answers, step, source, reminderConsent: consent, eligible: enabled }; }, [answers, step, source, consent, enabled]);
  useEffect(() => { if (initialToken) token.current = initialToken; }, [initialToken]);

  const flush = useCallback(() => {
    if (stopped.current) return Promise.resolve(token.current);
    if (latest.current?.reminderConsent && !latest.current.eligible) return Promise.reject(new Error('Valida el correo actual antes de guardar el avance.'));
    pending.current = latest.current;
    if (running.current) return running.current;
    running.current = (async () => {
      while (pending.current && !stopped.current) {
        const snapshot = pending.current;
        pending.current = null;
        if (!snapshot.reminderConsent && !token.current) continue;
        if (snapshot.reminderConsent && !snapshot.eligible) continue;
        if (mounted.current) setStatus('saving');
        try {
          const payload = { answers: snapshot.answers, step: snapshot.step, source: snapshot.source, reminderConsent: snapshot.reminderConsent };
          const response = await fetch('/api/brief/draft', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, clientId: clientId.current, ...(token.current ? { token: token.current } : {}) }),
            keepalive: true,
          });
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const error = new Error('No se pudo guardar el avance.');
            error.saved = data.saved === true;
            throw error;
          }
          const data = await response.json();
          if (data.cancelled) { token.current = null; clientId.current = crypto.randomUUID(); }
          else if (data.token) token.current = data.token;
          // Consent may be withdrawn while the first creation is in flight,
          // before its token exists. Queue that latest withdrawal immediately.
          if (token.current && latest.current && !latest.current.reminderConsent) pending.current = latest.current;
          if (mounted.current) {
            setLastSaved(snapshot.reminderConsent ? JSON.stringify(payload) : null);
            setStatus(snapshot.reminderConsent ? 'saved' : 'idle');
          }
        } catch (error) {
          pending.current = pending.current || snapshot;
          if (mounted.current) setStatus('error');
          throw error;
        }
      }
      return token.current;
    })().finally(() => { running.current = null; });
    return running.current;
  }, []);

  useEffect(() => {
    const withdrawing = !consent && Boolean(token.current);
    if (stopped.current || (!enabled && !withdrawing) || (!consent && !token.current)) return undefined;
    const timeout = setTimeout(() => { flush().catch(() => {}); }, 650);
    return () => clearTimeout(timeout);
  }, [answers, step, source, consent, enabled, flush]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // Closing is a final save opportunity; inactivity in the server determines reminders.
      if (!stopped.current && ((!latest.current?.reminderConsent && token.current) || (latest.current?.reminderConsent && canSave.current))) flush().catch(() => {});
    };
  }, [flush]);

  const visibleStatus = consent && !enabled && status !== 'idle' ? 'paused'
    : status === 'saved' && lastSaved !== snapshotKey ? 'pending' : status;
  return { status: visibleStatus, flush, reset: () => { stopped.current = false; token.current = null; clientId.current = crypto.randomUUID(); pending.current = null; setLastSaved(null); setStatus('idle'); }, stop: () => { stopped.current = true; pending.current = null; }, token };
}
