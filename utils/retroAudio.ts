
export class RetroAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private tempo: number = 140;
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // s
  private nextNoteTime: number = 0.0;
  private current16thNote: number = 0;
  private timerID: number | undefined;

  // Simple melody sequence (MIDI note numbers)
  // 0 = rest
  // C major-ish pentatonic whimsical loop
  private melodyLine = [
    60, 0, 64, 0, 67, 69, 67, 64, // C E G A G E
    60, 0, 60, 64, 67, 0, 60, 0,  // C C E G C
    59, 0, 62, 0, 65, 67, 65, 62, // B D F G F D
    59, 0, 55, 59, 62, 0, 59, 0   // B G B D B
  ];
  
  private bassLine = [
    36, 0, 36, 0, 48, 0, 36, 0,
    36, 0, 36, 0, 48, 0, 43, 0,
    35, 0, 35, 0, 47, 0, 35, 0,
    35, 0, 35, 0, 47, 0, 43, 0
  ];

  constructor() {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
    }
  }

  public init() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx) {
      if (muted) {
        this.ctx.suspend();
      } else {
        this.ctx.resume();
      }
    }
  }

  public startBGM() {
    if (this.isPlaying || !this.ctx) return;
    this.isPlaying = true;
    this.nextNoteTime = this.ctx.currentTime;
    this.scheduler();
  }

  public stopBGM() {
    this.isPlaying = false;
    if (this.timerID) window.clearTimeout(this.timerID);
  }

  private nextNote() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += 0.25 * secondsPerBeat; // Advance by 16th note
    this.current16thNote = (this.current16thNote + 1) % 32; // Loop length
  }

  private scheduleNote(beatNumber: number, time: number) {
    if (!this.ctx || this.isMuted) return;

    // Play Melody
    const note = this.melodyLine[beatNumber % this.melodyLine.length];
    if (note !== 0) {
      this.playOscillator(note, time, 0.1, 'square', 0.1);
    }

    // Play Bass
    if (beatNumber % 4 === 0) { // On beat
        const bassNote = this.bassLine[beatNumber % this.bassLine.length];
        if (bassNote !== 0) {
           this.playOscillator(bassNote, time, 0.15, 'triangle', 0.2);
        }
    }
  }

  private scheduler() {
    if (!this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.current16thNote, this.nextNoteTime);
      this.nextNote();
    }
    if (this.isPlaying) {
      this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
    }
  }

  private playOscillator(midiNote: number, time: number, duration: number, type: OscillatorType, vol: number) {
     if (!this.ctx) return;
     const osc = this.ctx.createOscillator();
     const gain = this.ctx.createGain();
     
     const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
     osc.frequency.value = freq;
     osc.type = type;
     
     gain.gain.setValueAtTime(vol, time);
     gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
     
     osc.connect(gain);
     gain.connect(this.ctx.destination);
     
     osc.start(time);
     osc.stop(time + duration);
  }

  // --- SFX ---

  public playJump() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(300, now + 0.1);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playCollect() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    
    // Coin sound: B5 then E6
    const t1 = 0.05;
    const t2 = 0.2;
    
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(987, now); // B5
    gain1.gain.setValueAtTime(0.05, now);
    gain1.gain.linearRampToValueAtTime(0, now + t1);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + t1);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1318, now + t1); // E6
    gain2.gain.setValueAtTime(0.05, now + t1);
    gain2.gain.linearRampToValueAtTime(0, now + t2);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + t1);
    osc2.stop(now + t2);
  }

  public playDamage() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }
  
  public playWin() {
    if (!this.ctx || this.isMuted) return;
    // Simple Arpeggio
    const now = this.ctx.currentTime;
    [60, 64, 67, 72, 76].forEach((note, i) => {
        this.playOscillator(note, now + i*0.1, 0.1, 'square', 0.1);
    });
  }
}
