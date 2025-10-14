// Web Speech API utilities for voice input and output

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
  start(): void;
  stop(): void;
}

export class VoiceRecognition {
  private recognition: SpeechRecognition | null = null;
  private onResultCallback: ((text: string) => void) | null = null;

  constructor() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  start(onResult: (text: string) => void, onError?: (error: string) => void) {
    if (!this.recognition) {
      onError?.('Speech recognition not supported in this browser');
      return;
    }

    this.onResultCallback = onResult;

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.onResultCallback?.(transcript);
    };

    this.recognition.onerror = (event) => {
      onError?.(event.error);
    };

    this.recognition.start();
  }

  stop() {
    this.recognition?.stop();
  }

  isSupported() {
    return this.recognition !== null;
  }
}

export class VoiceSynthesis {
  private synth: SpeechSynthesis;
  private maleVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    const voices = this.synth.getVoices();
    if (voices.length > 0) {
      this.selectMaleVoice(voices);
    } else {
      // Chrome loads voices asynchronously
      this.synth.onvoiceschanged = () => {
        const voices = this.synth.getVoices();
        this.selectMaleVoice(voices);
      };
    }
  }

  private selectMaleVoice(voices: SpeechSynthesisVoice[]) {
    // Prefer male voices
    const maleVoices = voices.filter(voice => 
      voice.name.toLowerCase().includes('male') ||
      voice.name.toLowerCase().includes('david') ||
      voice.name.toLowerCase().includes('james') ||
      voice.name.toLowerCase().includes('george')
    );

    if (maleVoices.length > 0) {
      this.maleVoice = maleVoices[0];
    } else {
      // Fallback to first available voice
      this.maleVoice = voices[0];
    }
  }

  speak(text: string, onEnd?: () => void) {
    if (this.synth.speaking) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.maleVoice) {
      utterance.voice = this.maleVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 0.8; // Lower pitch for more masculine sound
    utterance.volume = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synth.speak(utterance);
  }

  stop() {
    this.synth.cancel();
  }

  isSupported() {
    return 'speechSynthesis' in window;
  }
}
