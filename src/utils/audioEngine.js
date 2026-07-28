class SyntheticAudioEngine {
  constructor() {
    this.ctx = null;
    this.droneOsc = null;
    this.droneGain = null;
    this.filter = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    // Drone Sub-bass (55Hz - Note A1)
    this.droneOsc = this.ctx.createOscillator();
    this.droneGain = this.ctx.createGain();
    this.filter = this.ctx.createBiquadFilter();

    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(120, this.ctx.currentTime);

    this.droneGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

    this.droneOsc.connect(this.filter);
    this.filter.connect(this.droneGain);
    this.droneGain.connect(this.ctx.destination);

    this.droneOsc.start();
    this.isInitialized = true;
  }

  updateScrollAudio(progress) {
    if (!this.isInitialized || this.ctx.state !== 'running') return;

    const targetFreq = 55 + progress * 55;
    this.droneOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);

    const targetCutoff = 120 + progress * 350;
    this.filter.frequency.setTargetAtTime(targetCutoff, this.ctx.currentTime, 0.1);
  }

  playMilestoneChime(frequency = 220) {
    if (!this.isInitialized || this.ctx.state !== 'running') return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.4);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  dispose() {
    if (!this.isInitialized) return;

    this.droneOsc.stop();
    this.droneOsc.disconnect();
    this.filter.disconnect();
    this.droneGain.disconnect();
    this.ctx.close();

    this.ctx = null;
    this.droneOsc = null;
    this.droneGain = null;
    this.filter = null;
    this.isInitialized = false;
  }
}

export const audioEngine = new SyntheticAudioEngine();
