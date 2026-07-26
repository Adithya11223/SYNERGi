export type SpeechState = 'idle' | 'starting' | 'recording' | 'processing' | 'error';

export interface SpeechCallbacks {
  onStateChange: (state: SpeechState) => void;
  onResult: (interim: string, final: string) => void;
  onError: (errorMsg: string) => void;
}

class SpeechRecognitionServiceClass {
  private recognition: any = null;
  private callbacks: SpeechCallbacks | null = null;
  
  private finalTranscript: string = '';
  private interimTranscript: string = '';
  
  private isStopping: boolean = false;
  private state: SpeechState = 'idle';

  public initialize(callbacks: SpeechCallbacks) {
    this.callbacks = callbacks;
  }

  public removeCallbacks() {
    this.callbacks = null;
  }

  private setState(newState: SpeechState) {
    this.state = newState;
    if (this.callbacks) {
      this.callbacks.onStateChange(newState);
    }
  }

  public async start() {
    if (this.state === 'recording' || this.state === 'starting') return;
    
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.isStopping = false;
    
    this.setState('starting');

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      this.handleError('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      // Ensure we request permission first through the native API rather than getUserMedia
      // as getUserMedia can sometimes lock the stream and prevent webkitSpeechRecognition from accessing it.
    } catch (err) {
      this.handleError('Microphone access denied.');
      return;
    }

    this.cleanup(); // ensure clean slate

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = navigator.language || 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onaudiostart = () => console.log('[STT] onaudiostart: Audio capturing started');
    this.recognition.onsoundstart = () => console.log('[STT] onsoundstart: Some sound detected');
    this.recognition.onspeechstart = () => console.log('[STT] onspeechstart: Speech detected');
    
    let lastInterim = '';

    this.recognition.onresult = (event: any) => {
      console.log('[STT] onresult fired:', event.results);
      let currentInterim = '';
      let currentFinal = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          currentFinal += result[0].transcript;
        } else {
          currentInterim += result[0].transcript;
        }
      }
      
      if (currentFinal) {
        this.finalTranscript += (this.finalTranscript ? ' ' : '') + currentFinal;
      }
      
      if (currentInterim !== lastInterim || currentFinal) {
        this.interimTranscript = currentInterim;
        lastInterim = currentInterim;
        if (this.callbacks) {
          this.callbacks.onResult(this.interimTranscript, this.finalTranscript);
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      if (this.isStopping) return;
      
      if (event.error === 'not-allowed') {
        this.handleError('Microphone access denied.');
      } else if (event.error === 'network') {
        this.handleError('Network error occurred.');
      } else if (event.error !== 'no-speech') {
        this.handleError('Error recognizing speech: ' + event.error);
      }
    };

    this.recognition.onend = () => {
      if (this.isStopping) {
        this.setState('processing');
      } else if (this.state === 'recording') {
        // Engine died unexpectedly, restart
        try { 
          if (this.recognition) this.recognition.start(); 
        } catch(e) {
          this.setState('idle');
        }
      }
    };

    try {
      this.recognition.start();
      this.setState('recording');
    } catch (e) {
      this.handleError('Failed to start recording.');
    }
  }

  public stop() {
    this.isStopping = true;
    if (this.recognition && this.state === 'recording') {
      this.recognition.stop();
    } else {
      this.setState('processing');
    }
  }

  public abort() {
    this.isStopping = true;
    this.cleanup();
    this.setState('idle');
  }

  private handleError(msg: string) {
    this.cleanup();
    this.setState('error');
    if (this.callbacks) {
      this.callbacks.onError(msg);
    }
  }

  private cleanup() {
    if (this.recognition) {
      this.recognition.onend = null;
      this.recognition.onerror = null;
      this.recognition.onresult = null;
      try {
        this.recognition.abort();
      } catch (e) {}
      this.recognition = null;
    }
  }
}

export const SpeechRecognitionService = new SpeechRecognitionServiceClass();
