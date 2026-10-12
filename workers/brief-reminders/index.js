// Pages owns the database and the existing Resend credential. The scheduled
// Worker only invokes its authenticated reminder endpoint.
export default {
  async scheduled(_event, env) {
    if (!env.BRIEF_RECOVERY_SECRET || !env.BRIEF_ENDPOINT) {
      throw new Error('Brief reminder scheduler is not configured');
    }
    const response = await fetch(env.BRIEF_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.BRIEF_RECOVERY_SECRET}` },
      signal: AbortSignal.timeout(55000),
    });
    if (!response.ok) {
      throw new Error(`Brief reminder endpoint returned ${response.status}`);
    }
    const result = await response.json();
    console.log(JSON.stringify({ event: 'brief_reminder_run', ...result }));
  },
};
