export const speechService = {
  speak: (text: string, onEnd: () => void) => {
    if (!('speechSynthesis' in window)) {
      alert("Sorry, your browser doesn't support text-to-speech.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = onEnd;
    speechSynthesis.speak(utterance);
  },

  stop: () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  },

  listen: (onResult: (transcript: string) => void, onEnd: () => void, onError: (error: string) => void) => {
    // FIX: Cast window to `any` to access non-standard SpeechRecognition APIs without TypeScript errors.
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError("Sorry, your browser doesn't support speech-to-text.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event) => {
      onError(`Speech recognition error: ${event.error}`);
    };
    
    recognition.onend = () => {
        onEnd();
    };

    recognition.start();
    return recognition;
  }
};