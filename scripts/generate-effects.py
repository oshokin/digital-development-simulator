"""Regenerate the four original game effects as normalized MP3 files.

Requires ffmpeg on PATH; no runtime dependency is needed by the website.
"""
import math
import random
import struct
import subprocess
import tempfile
import wave
from pathlib import Path

RATE = 44100
DEST = Path(__file__).resolve().parent.parent / "dist/assets/audio"


def tone(frequency, time, decay):
    return math.sin(2 * math.pi * frequency * time) * math.exp(-decay * time)


def bell(time):
    if time < 0:
        return 0
    partials = ((228, .52, 3.3), (371, .28, 5), (516, .24, 6),
                (816, .16, 8), (1231, .10, 12))
    ring = sum(amp * tone(freq, time, damping) for freq, amp, damping in partials)
    return ring * min(1, time * 180)


def pickup(time):
    notes = ((0, 523), (.10, 659), (.20, 784), (.32, 1046))
    out = 0
    for start, frequency in notes:
        age = time - start
        if age >= 0:
            out += .32 * tone(frequency, age, 8) + .12 * tone(frequency * 2.01, age, 16)
    return out


def breaking(time, noise):
    if time < 0:
        return 0
    # A short crack followed by falling glassy notes.
    out = noise * .38 * math.exp(-24 * time)
    for start, frequency in ((0, 1175), (.075, 784), (.16, 523), (.25, 340)):
        age = time - start
        if age >= 0:
            out += .23 * tone(frequency, age, 12) + .07 * tone(frequency * 2.4, age, 20)
    return out


def coffee(time, noise):
    # Three liquid glugs and a quiet, rising finish; replace with a recording anytime.
    out = 0
    for start, frequency in ((0, 175), (.14, 145), (.29, 112)):
        age = time - start
        if 0 <= age < .2:
            envelope = math.sin(math.pi * age / .2) ** 2
            wobble = 1 + .10 * math.sin(2 * math.pi * 17 * age)
            out += .35 * envelope * math.sin(2 * math.pi * frequency * wobble * age)
            out += .055 * envelope * noise
    if time > .43:
        out += .2 * tone(430, time - .43, 11)
    return out


def render(name, duration, generator, target):
    rng = random.Random(4189)
    samples = [generator(i / RATE, rng.uniform(-1, 1)) for i in range(int(duration * RATE))]
    peak = max(abs(sample) for sample in samples)
    samples = [max(-1, min(1, sample * .8 / peak)) for sample in samples]
    with tempfile.TemporaryDirectory() as temporary:
        source = Path(temporary) / "effect.wav"
        with wave.open(str(source), "wb") as output:
            output.setnchannels(1)
            output.setsampwidth(2)
            output.setframerate(RATE)
            output.writeframes(b"".join(struct.pack("<h", int(s * 32767)) for s in samples))
        subprocess.run([
            "ffmpeg", "-y", "-loglevel", "error", "-i", str(source),
            "-af", f"loudnorm=I={target}:TP=-1.5:LRA=7",
            "-codec:a", "libmp3lame", "-b:a", "192k", str(DEST / f"{name}.mp3")
        ], check=True)


if __name__ == "__main__":
    DEST.mkdir(parents=True, exist_ok=True)
    render("hit-gong", 1.0, lambda t, n: bell(t) + n * .18 * math.exp(-95 * t), -15)
    render("shield-pickup", .8, lambda t, n: pickup(t), -17)
    render("shield-break", .72, breaking, -16)
    render("coffee-pickup", .75, coffee, -17)
