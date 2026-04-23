const AUDIO_PROMPT_ACK_KEY = 'site-audio-prompt-acknowledged';
const AUDIO_PROMPT_SESSION_KEY = 'site-audio-session-started';

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

export function shouldShowEntryAudioPrompt() {
  if (typeof window === 'undefined') return false;

  const alreadyAcknowledged = window.localStorage.getItem(AUDIO_PROMPT_ACK_KEY) === 'true';
  const sessionStarted = window.sessionStorage.getItem(AUDIO_PROMPT_SESSION_KEY) === 'true';

  if (!sessionStarted) {
    window.sessionStorage.setItem(AUDIO_PROMPT_SESSION_KEY, 'true');
  }

  return !alreadyAcknowledged && !sessionStarted && isExternalEntry();
}

export function acknowledgeEntryAudioPrompt() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUDIO_PROMPT_ACK_KEY, 'true');
}
