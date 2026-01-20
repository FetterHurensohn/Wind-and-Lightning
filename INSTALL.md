# Installation Instructions

## Prerequisites

Before you can run or build this video editor, you need to install the following:

### 1. Node.js and npm

Download and install Node.js (version 18 or higher) from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version
npm --version
```

### 2. FFmpeg

FFmpeg is required for video processing.

#### Windows:
1. Download FFmpeg from [ffmpeg.org](https://ffmpeg.org/download.html#build-windows)
2. Extract the archive
3. Add the `bin` folder to your system PATH
4. Verify: Open Command Prompt and run `ffmpeg -version`

#### Alternative - Using Chocolatey:
```bash
choco install ffmpeg
```

#### Alternative - Using Scoop:
```bash
scoop install ffmpeg
```

### 3. Install Project Dependencies

```bash
npm install
```

## Running the Application

### Development Mode

Run the application in development mode with hot-reload:

```bash
npm run dev
```

This will:
- Start the Vite development server on port 3000
- Compile and run the Electron application
- Open DevTools automatically

### Building for Production

#### Build the Application

```bash
npm run build
```

This compiles both the React app and Electron main process.

#### Create Windows Installer

```bash
npm run build:win
```

The installer will be created in the `release` directory:
- `Professional Video Editor-1.0.0-Setup.exe`

## Troubleshooting

### FFmpeg Not Found

If you get an error about FFmpeg not being found:

1. Make sure FFmpeg is installed and in your PATH
2. Set the FFMPEG_PATH environment variable:
   ```bash
   set FFMPEG_PATH=C:\path\to\ffmpeg\bin\ffmpeg.exe
   set FFPROBE_PATH=C:\path\to\ffmpeg\bin\ffprobe.exe
   ```

### Module Not Found Errors

If you get module not found errors:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Electron Won't Start

1. Clear the Electron cache:
   ```bash
   npm run clean
   ```

2. Rebuild native modules:
   ```bash
   npm rebuild
   ```

### TypeScript Errors

Make sure all TypeScript files compile without errors:

```bash
npx tsc --noEmit
```

## Project Structure

```
professional-video-editor/
├── electron/           # Electron main process
│   ├── main.ts        # Main entry point
│   ├── preload.ts     # Preload script for IPC
│   └── ffmpeg/        # FFmpeg integration
├── src/               # React application
│   ├── components/    # UI components
│   ├── store/         # Redux store
│   ├── engine/        # Video/audio engines
│   └── utils/         # Utilities
├── dist/              # Compiled output
├── release/           # Built installers
└── build/             # Build resources
```

## Development Tips

### Hot Reload

The React app supports hot reload. Changes to React components will update automatically.

Electron main process changes require a restart. After changing `electron/main.ts`, stop and restart with `npm run dev`.

### Debugging

- React DevTools: Available in the opened DevTools
- Redux DevTools: Install the Redux DevTools extension
- Electron DevTools: Automatically opened in development mode

### Code Style

This project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting

Run linting:
```bash
npm run lint
```

## Next Steps

After installation, you can:

1. Start importing media files
2. Drag clips to the timeline
3. Apply effects and transitions
4. Export your video

See the [README.md](README.md) for full feature documentation.

## Support

For issues and questions:
- Check existing GitHub issues
- Create a new issue with detailed information
- Include error messages and system information

## System Requirements

### Minimum:
- Windows 10 (64-bit)
- 8 GB RAM
- 2 GHz dual-core processor
- 2 GB free disk space

### Recommended:
- Windows 11 (64-bit)
- 16 GB RAM
- 3 GHz quad-core processor
- SSD with 10 GB free space
- Dedicated GPU with 2 GB VRAM
