#!/usr/bin/env python3
import base64
import sys

if len(sys.argv) < 2:
    print("Usage: python encode_audio.py <audio_file_path>")
    print("Example: python encode_audio.py test.wav")
    sys.exit(1)

audio_file = sys.argv[1]

try:
    with open(audio_file, "rb") as f:
        audio_base64 = base64.b64encode(f.read()).decode()
        print(audio_base64)
except FileNotFoundError:
    print(f"Error: File '{audio_file}' not found")
except Exception as e:
    print(f"Error: {e}")
