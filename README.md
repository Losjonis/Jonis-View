# Jonis View

USB UVC capture viewer by Jonis Apps. Local video and audio with a dark pink interface.

## Downloads

Download packages from [Releases](https://github.com/Losjonis/Jonis-View/releases):

- [Windows 0.3.0 — portable EXE](https://github.com/Losjonis/Jonis-View/releases/tag/windows-v0.3.0)
- [macOS 0.1.2 — Intel and Apple Silicon DMG](https://github.com/Losjonis/Jonis-View/releases/tag/macos-v0.1.2)
- [Linux 0.1.2 — x64 AppImage](https://github.com/Losjonis/Jonis-View/releases/tag/linux-v0.1.2)

Official website: https://jonisapps.com.

| Directory | Version | Platform |
| --- | --- | --- |
| windows/ | 0.3.0 | Windows 10/11 x64 |
| macos/ | 0.1.2 | macOS Intel and Apple Silicon |
| linux/ | 0.1.2 | Linux x64 |

Windows 0.3.0 supports PNG screenshots, MP4 clips, recent-footage saving, optional GPU export and six languages. The macOS and Linux 0.1.2 editions are viewers without these recording features.

## Build

Install Node.js 22 LTS and npm. In the appropriate platform directory:

```sh
npm ci
npm test
npm start
npm run dist
```

Build each edition on its native OS. See its README for platform requirements.

## Hardware and privacy

Requires a UVC capture device recognised by the OS. Resolution, frame rate, audio and latency depend on hardware and format. HDCP is not bypassed. Synthetic-device tests do not certify physical devices or every Linux distribution. Video and audio stay local.

## Licence

Copyright (C) 2026 Jonis Apps. Original source and artwork are licensed under GNU GPL version 3 only (GPL-3.0-only), without warranty. See LICENSE. Dependencies retain their own licences; see THIRD_PARTY.md.

## Contributing

Include reproducible steps, OS and version in issues. Do not upload private footage, identity documents or credentials. Run tests for the affected platform. Contributions use GPL-3.0-only.
