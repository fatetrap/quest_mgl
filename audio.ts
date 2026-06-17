// --- PRONUNCIATION PLAYBACK ---
//
// Speaks a Mongolian word using the browser's Web Speech API. Native Mongolian
// (mn-MN) voices are rarely installed, so when none is available we fall back to
// reading the romanized phonetic aloud with a default voice. That keeps the
// "hear it" affordance useful everywhere instead of silently doing nothing.

let cachedVoices: SpeechSynthesisVoice[] = [];

const refreshVoices = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  cachedVoices = window.speechSynthesis.getVoices();
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refreshVoices();
  // Voice lists often load asynchronously; pick them up when they arrive.
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

export const speak = (cyrillic: string, phonetic?: string): void => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    if (cachedVoices.length === 0) refreshVoices();

    const mongolianVoice = cachedVoices.find(v => v.lang?.toLowerCase().startsWith('mn'));
    const utter = new SpeechSynthesisUtterance();

    if (mongolianVoice) {
      utter.text = cyrillic;
      utter.voice = mongolianVoice;
      utter.lang = mongolianVoice.lang;
    } else {
      // No native voice — approximate the sound from the romanization.
      utter.text = phonetic && phonetic.trim().length > 0 ? phonetic : cyrillic;
      utter.lang = 'en-US';
    }

    utter.rate = 0.8;
    window.speechSynthesis.speak(utter);
  } catch {
    // Speech synthesis unavailable — fail silently.
  }
};
