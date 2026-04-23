const AUDIO_ENTRY_SESSION_KEY = 'site-audio-entry-session-started';

function isExternalEntry() {
  if (typeof window === 'undefined') return false;

  const referrer = document.referrer;
  if (!referrer) return true;

  try {
    return new URL(referrer).origin !== window.location.origin;
  } catch {
    return true;
  }
}

export function initializeAudioEntrySession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(AUDIO_ENTRY_SESSION_KEY, 'true');
}

export function shouldShowEntryAudioPrompt() {
  if (typeof window === 'undefined') return false;

  const sessionStarted = window.sessionStorage.getItem(AUDIO_ENTRY_SESSION_KEY) === 'true';
  if (sessionStarted) return false;

  window.sessionStorage.setItem(AUDIO_ENTRY_SESSION_KEY, 'true');
  return isExternalEntry();
}

export function acknowledgeEntryAudioPrompt() {
  initializeAudioEntrySession();
}
