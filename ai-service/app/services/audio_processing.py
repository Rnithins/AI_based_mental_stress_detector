from __future__ import annotations

import numpy as np
import librosa

try:
    import noisereduce as nr
except Exception:  # pragma: no cover - optional dependency fallback
    nr = None


def preprocess_audio(file_path: str, target_sr: int = 16000) -> tuple[np.ndarray, int]:
    try:
        signal, sample_rate = librosa.load(file_path, sr=target_sr, mono=True)
    except Exception as err:
        raise ValueError("Unsupported audio format. Use WAV, MP3, OGG, or FLAC.") from err

    if signal.size == 0:
        raise ValueError("Audio file contains no signal")

    if nr is not None:
        signal = nr.reduce_noise(y=signal, sr=sample_rate, stationary=False)

    signal = librosa.util.normalize(signal)
    return signal.astype(np.float32), sample_rate
