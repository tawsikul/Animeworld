"""
Renders the site's sound cues as real audio files (WAV + MP3).
Everything is synthesised from scratch — layered noise, sub-bass, partials,
with a simple reverb tail — so there are no licensing strings attached.
"""
import numpy as np
from scipy import signal
from scipy.io import wavfile
import os, subprocess

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), 'sfx')
os.makedirs(OUT, exist_ok=True)

def t(dur): return np.linspace(0, dur, int(SR * dur), endpoint=False)
def env(n, a=0.005, d=0.1, s=0.0, r=0.2, hold=0.0):
    """ADSR-ish envelope in seconds → array of length n."""
    a_n, d_n, r_n = int(SR*a), int(SR*d), int(SR*r)
    h_n = max(0, n - a_n - d_n - r_n)
    parts = [np.linspace(0, 1, a_n, endpoint=False),
             np.linspace(1, s, d_n, endpoint=False),
             np.full(h_n, s),
             np.linspace(s, 0, r_n)]
    e = np.concatenate(parts)[:n]
    return np.pad(e, (0, n - len(e)))
def noise(n): return np.random.default_rng(7).standard_normal(n)
def bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo/(SR/2), hi/(SR/2)], 'band'); return signal.lfilter(b, a, x)
def lp(x, fc, order=2):
    b, a = signal.butter(order, fc/(SR/2), 'low'); return signal.lfilter(b, a, x)
def hp(x, fc, order=2):
    b, a = signal.butter(order, fc/(SR/2), 'high'); return signal.lfilter(b, a, x)
def sweep_bp(x, f_from, f_to, bw=0.6):
    """Band-pass whose centre glides — the classic whoosh."""
    n = len(x); out = np.zeros(n); chunk = 512
    for i in range(0, n, chunk):
        f = f_from * (f_to/f_from) ** (i/n)
        lo, hi = max(30, f/(1+bw)), min(SR/2-100, f*(1+bw))
        b, a = signal.butter(2, [lo/(SR/2), hi/(SR/2)], 'band')
        out[i:i+chunk] = signal.lfilter(b, a, x[i:i+chunk])
    return out
def reverb(x, decay=0.9, size=0.35):
    """Cheap convolution reverb with an exponentially decaying noise IR."""
    ir = noise(int(SR*size)) * np.exp(-np.linspace(0, 8, int(SR*size))) * decay
    ir = lp(ir, 6000); ir[0] = 1.0
    return signal.fftconvolve(x, ir)[:len(x) + int(SR*size)]
def norm(x, peak=0.92):
    m = np.max(np.abs(x)) or 1; return x / m * peak
def tone(freq, dur, kind='sine', glide=None, detune=0.0):
    tt = t(dur)
    if glide: f = freq * (glide/freq) ** (tt/dur); ph = 2*np.pi*np.cumsum(f)/SR
    else: ph = 2*np.pi*freq*tt
    if kind == 'sine': w = np.sin(ph)
    elif kind == 'tri': w = signal.sawtooth(ph, 0.5)
    elif kind == 'saw': w = signal.sawtooth(ph)
    else: w = signal.square(ph)
    if detune:
        w = w + np.sin(ph*(1+detune)) * .5 + np.sin(ph*(1-detune)) * .5
    return w
def mix(*parts):
    n = max(len(p) for p in parts); return sum(np.pad(p, (0, n-len(p))) for p in parts)
def save(name, x):
    x = norm(x); wav = os.path.join(OUT, name + '.wav')
    wavfile.write(wav, SR, (x * 32767).astype(np.int16))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '96k', os.path.join(OUT, name + '.mp3')])
    os.remove(wav)
    print('  ', name)

# ------------------------------------------------------------------ cues
# tick — tiny UI click
n = int(SR*.08); x = tone(1800, .08) * env(n, .001, .03, 0, .04) + hp(noise(n), 4000) * env(n, .0005, .01, 0, .02) * .4
save('tick', x)

# save — bright two-note confirm with a sparkle
n1 = int(SR*.35); a = tone(659.25, .35, detune=.004) * env(n1, .005, .12, .3, .2)
n2 = int(SR*.5);  b = tone(987.77, .5, detune=.004) * env(n2, .005, .16, .35, .3)
spark = bp(noise(n2), 6000, 12000) * env(n2, .001, .08, 0, .1) * .25
x = mix(a * .8, np.pad(b, (int(SR*.09), 0)), np.pad(spark, (int(SR*.09), 0)))
save('save', reverb(x, .5, .25))

# open — riser whoosh into a soft impact (sheet opens)
n = int(SR*.55)
wh = sweep_bp(noise(n), 250, 6000) * env(n, .05, .3, .4, .15)
sub = tone(70, .55, glide=140) * env(n, .01, .25, .2, .3) * .8
x = mix(wh, sub)
save('open', reverb(x, .6, .3))

# close — reverse-ish falling swish
n = int(SR*.35)
x = sweep_bp(noise(n), 5000, 300) * env(n, .01, .2, .1, .12) + tone(392, .35, glide=200) * env(n, .005, .15, 0, .1) * .3
save('close', x)

# impact — the figure landing: sub thump + noise crack + tail
n = int(SR*.9)
sub = tone(55, .9, glide=32) * env(n, .001, .35, .2, .5)
crack = bp(noise(n), 700, 4000) * env(n, .0005, .06, 0, .04)
body = lp(noise(n), 400) * env(n, .001, .12, 0, .2) * .7
x = mix(sub * 1.2, crack * .9, body)
save('impact', reverb(x, .8, .45))

# charge — rising power-up (figure raises arm)
n = int(SR*1.3)
saw = tone(110, 1.3, 'saw', glide=1320); saw = sweep_bp(saw, 300, 7000, .9) * env(n, .05, .5, .8, .35)
shim = sweep_bp(noise(n), 800, 9000) * env(n, .2, .5, .6, .3) * .5
x = mix(saw, shim)
save('charge', reverb(x, .5, .3))

# dive — the zoom into the depth: long descending tunnel whoosh
n = int(SR*1.6)
x = sweep_bp(noise(n), 6000, 120, .8) * env(n, .05, .6, .6, .6)
x = mix(x, tone(180, 1.6, glide=45) * env(n, .1, .6, .4, .5) * .5)
save('dive', reverb(x, .8, .5))

# bloom — the logo reveal: soft hit + shimmering major chord
n = int(SR*2.2)
hit = mix(tone(60, 2.2, glide=40) * env(n, .001, .4, .2, .9) * .9, bp(noise(n), 500, 3000) * env(n, .0005, .08, 0, .08) * .6)
chord = sum(tone(f, 2.2, detune=.003) * env(n, .02, .8, .5, 1.0) * g for f, g in
            [(261.63, .5), (329.63, .45), (392.0, .45), (523.25, .35), (783.99, .2)])
shim = bp(noise(n), 5000, 11000) * env(n, .3, .8, .4, .8) * .18
x = mix(hit, chord * .7, shim)
save('bloom', reverb(x, .9, .6))

# motifs — one short original 5-note phrase per archetype
MOTIFS = {
  'ninja':    ([392.00, 440.00, 523.25, 587.33, 783.99], .13, 'tri'),
  'swordsman':([329.63, 392.00, 493.88, 587.33, 659.25], .15, 'saw'),
  'hero':     ([523.25, 659.25, 783.99, 880.00, 1046.5], .11, 'sq'),
  'pirate':   ([349.23, 440.00, 523.25, 659.25, 698.46], .14, 'tri'),
  'sorcerer': ([293.66, 349.23, 440.00, 523.25, 622.25], .17, 'sine'),
  'pilot':    ([261.63, 311.13, 392.00, 466.16, 523.25], .12, 'saw'),
  'hunter':   ([311.13, 415.30, 466.16, 622.25, 830.61], .13, 'tri'),
  'athlete':  ([440.00, 554.37, 659.25, 739.99, 880.00], .10, 'sq'),
  'spirit':   ([523.25, 622.25, 698.46, 830.61, 1046.5], .19, 'sine'),
  'default':  ([349.23, 440.00, 523.25, 622.25, 698.46], .14, 'tri'),
}
for name, (notes, step, kind) in MOTIFS.items():
    total = step * len(notes) + .9
    parts = []
    for i, f in enumerate(notes):
        d = step * 2.6 if i < len(notes)-1 else 1.0
        nn = int(SR*d)
        w = lp(tone(f, d, kind, detune=.003), 3200) * env(nn, .01, d*.5, .25, d*.4)
        parts.append(np.pad(w, (int(SR*step*i), 0)))
    bass = tone(notes[-1]/2, 1.0) * env(int(SR*1.0), .02, .5, .2, .4) * .5
    parts.append(np.pad(bass, (int(SR*step*(len(notes)-1)), 0)))
    save('motif-' + name, reverb(mix(*parts), .6, .4))

print('done ->', OUT)
