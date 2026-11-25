let ac: AudioContext | null = null;
const ctx = () => (ac ??= new AudioContext());

export function playShutter() {
  const a = ctx();
  const len = a.sampleRate * 0.12;
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const src = a.createBufferSource();
  src.buffer = buf;
  const g = a.createGain();
  g.gain.value = 0.5;
  src.connect(g).connect(a.destination);
  src.start();
}

export function playWhirr() {
  const a = ctx();
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(90, a.currentTime);
  o.frequency.linearRampToValueAtTime(140, a.currentTime + 1.4);
  g.gain.setValueAtTime(0.04, a.currentTime);
  g.gain.linearRampToValueAtTime(0, a.currentTime + 1.5);
  o.connect(g).connect(a.destination);
  o.start();
  o.stop(a.currentTime + 1.5);
}
