# VoiceForge

Desktop app Linux pour la synthèse vocale (TTS) et la transcription (STT) avec des voix IA de haute qualité.

![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Linux-green)
![Tauri](https://img.shields.io/badge/Tauri-2.10-orange)

## Features

### Parler (Text-to-Speech)
- Coller du texte et l'écouter avec une voix IA naturelle
- **OpenAI TTS-HD** : 9 voix (alloy, ash, coral, echo, fable, nova, onyx, sage, shimmer)
- **ElevenLabs** : voix multilingues ultra-réalistes
- Contrôle de la vitesse (0.25x → 4x)
- Export MP3

### Dicter (Speech-to-Text)
- Enregistrement micro en un clic
- Transcription via **OpenAI Whisper**
- Support français, anglais, et 99+ langues
- Copier/coller le résultat

## Stack

- **Desktop** : Tauri 2 (Rust, ~9MB binaire)
- **Frontend** : React 19 + Zustand + Vite 8
- **Backend** : Hono sur Bun (port 3002)
- **APIs** : OpenAI TTS/Whisper, ElevenLabs

## Installation

### Depuis le .deb (recommandé)

```bash
# Build
cd app
bun install
npx tauri build --bundles deb

# Install
sudo dpkg -i src-tauri/target/release/bundle/deb/voiceforge_0.1.0_amd64.deb
```

### Dev mode

```bash
cd app
bun install
bun run dev          # frontend (port 5173)
bun src/backend/server.ts  # backend (port 3002)
```

## Configuration

Au premier lancement, cliquer sur ⚙ et entrer :
- **OpenAI API Key** — pour TTS et Whisper
- **ElevenLabs API Key** — optionnel, pour les voix ElevenLabs

Les settings sont stockés dans `~/.config/voiceforge/settings.json`.

## License

MIT — [Ethernity Solution](https://github.com/koburafab) / Fabrice Steriti
