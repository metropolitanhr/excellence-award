// Shared helper: POST to the Apps Script backend with automatic retries.
// No Content-Type header is set on purpose: text/plain avoids a CORS preflight that Apps Script cannot answer.
window.rsvpCall = async function (payload, tries) {
  tries = tries || 3;
  var url = window.RSVP_API_URL;
  if (!url || url.indexOf('PASTE_') === 0) {
    return { ok: false, error: 'This page is not connected yet. Please contact HR (2624 - Dakshila).' };
  }
  var lastErr = null;
  for (var i = 0; i < tries; i++) {
    try {
      var res = await fetch(url, { method: 'POST', body: JSON.stringify(payload), redirect: 'follow' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      // Retry only on the generic "busy" answer, not on real validation errors
      if (data && data.ok === false && /busy/i.test(data.error || '') && i < tries - 1) {
        await new Promise(function (r) { setTimeout(r, 1200 * (i + 1)); });
        continue;
      }
      return data;
    } catch (e) {
      lastErr = e;
      await new Promise(function (r) { setTimeout(r, 1200 * (i + 1)); });
    }
  }
  return { ok: false, error: 'Could not reach the server. Check your internet connection and try again.', network: true };
};
