# Sora UI - Electron Desktop App

This document explains how to use and build the Electron version of Sora UI as a standalone desktop application for Windows, macOS, and Linux.

## ✅ Electron Setup Complete

The project has been successfully converted to an Electron app! You can now:
- Run as a native desktop application
- Build standalone installers for Windows (.exe)
- Package for macOS (.dmg) and Linux (.AppImage)

---

## Development

### Run Electron App in Development Mode

```bash
npm run electron:dev
```

This will:
1. Start the Vite dev server
2. Compile the Electron main and preload scripts
3. Launch the Electron window
4. Enable hot reload for UI changes
5. Open DevTools automatically

**Note:** The Electron window will open automatically. You can close it anytime and restart with the same command.

---

## Building for Production

### Build for Windows (from any OS)

```bash
npm run electron:build:win
```

**Output:** `release/0.0.1/Sora Video Generation-Setup-0.0.1.exe`
- NSIS installer (~150-200MB)
- Creates desktop shortcut
- Installs to `C:\Program Files\Sora Video Generation`
- Includes uninstaller

### Build for macOS

```bash
npm run electron:build:mac
```

**Output:** `release/0.0.1/Sora Video Generation-0.0.1.dmg`
- Drag-and-drop installer
- Installs to Applications folder

### Build for Linux

```bash
npm run electron:build:linux
```

**Output:** `release/0.0.1/Sora Video Generation-0.0.1.AppImage`
- Portable executable
- No installation required

### Build for All Platforms

```bash
npm run electron:build
```

---

## App Icons

### Icon Files

Place your app icons in the `build/` directory:

- **Windows:** `build/icon.ico` (256x256, multi-size recommended)
- **macOS:** `build/icon.icns` (1024x1024)
- **Linux:** `build/icon.png` (512x512 or 1024x1024)

### Creating Icons

1. Design a square PNG image (1024x1024 recommended)
2. Convert to platform formats:
   - Windows: https://icoconvert.com/
   - macOS: https://cloudconvert.com/png-to-icns
   - Linux: Use PNG directly

**See `build/README.md` for detailed icon creation instructions.**

---

## Project Structure

```
sora-ui/
├── electron/
│   ├── main.ts           # Electron main process
│   ├── preload.ts        # Preload script (secure bridge)
│   └── tsconfig.json     # TypeScript config for Electron
├── src/                  # React app (unchanged)
├── dist/                 # Built React app (production)
├── dist-electron/        # Built Electron files
├── release/              # Built installers (.exe, .dmg, etc.)
└── build/                # App icons and assets
```

---

## Key Features

### ✅ Implemented

- **Native Window:** Desktop app window with custom title bar support
- **Hot Reload:** UI updates automatically during development
- **Security:** Context isolation, no Node.js in renderer
- **Single Instance:** Only one instance can run at a time
- **External Links:** Open in default browser, not in app
- **Window State:** Remembers size and position
- **DevTools:** Enabled in development, disabled in production

### 🔄 Optional Enhancements (Not Implemented Yet)

- **Auto-updater:** Automatic app updates
- **System tray:** Run in background
- **Native menus:** Custom menu bar
- **Notifications:** System notifications
- **Deep linking:** Open app from URLs
- **File associations:** Open specific file types

---

## Configuration

### App Information (`package.json`)

```json
{
  "name": "sora-ui",
  "productName": "Sora Video Generation",
  "description": "AI-powered video generation with Azure OpenAI Sora",
  "version": "0.0.1",
  "author": "nikzart"
}
```

### Electron Builder Config (`package.json` → `build`)

```json
{
  "appId": "com.soraui.app",
  "productName": "Sora Video Generation",
  "directories": {
    "output": "release/${version}"
  }
}
```

---

## Environment Variables

The Electron app uses the same `.env` file as the web version:

```env
VITE_AZURE_ENDPOINT=https://xandar.cognitiveservices.azure.com
VITE_AZURE_API_KEY=your_api_key_here
VITE_API_VERSION=preview

VITE_O4_MINI_ENDPOINT=https://xandar.cognitiveservices.azure.com/
VITE_O4_MINI_DEPLOYMENT=o4-mini
VITE_O4_MINI_API_VERSION=2024-12-01-preview
```

**⚠️ Security Warning:**
- In the web version, API keys are exposed in the browser
- The Electron version has the same limitation (keys are embedded in the built app)
- For production, consider implementing a backend proxy to protect API keys

---

## Troubleshooting

### Electron window doesn't open

1. Check console for errors:
   ```bash
   npm run electron:dev 2>&1
   ```

2. Clean build and retry:
   ```bash
   rm -rf dist dist-electron node_modules/.vite
   npm run electron:dev
   ```

### Build fails

1. Ensure all dependencies are installed:
   ```bash
   npm install
   ```

2. Check icon files exist (or remove icon references from `package.json`)

3. Try building with verbose output:
   ```bash
   DEBUG=electron-builder npm run electron:build:win
   ```

### App crashes on startup

1. Check main process logs in terminal
2. Verify `.env` file exists with correct variables
3. Try disabling `sandbox` in `electron/main.ts` if needed

---

## Testing

### Test Development Mode

```bash
npm run electron:dev
```

**Expected:**
- Electron window opens
- App loads successfully
- DevTools are open
- Hot reload works when you edit files

### Test Production Build

```bash
# Build
npm run electron:build:win

# Run the installer (Windows example)
./release/0.0.1/Sora\ Video\ Generation-Setup-0.0.1.exe
```

**Expected:**
- Installer runs
- App installs to Program Files
- Desktop shortcut created
- App launches successfully
- No DevTools

---

## Distribution

### Windows

1. Build the installer:
   ```bash
   npm run electron:build:win
   ```

2. Distribute `Sora Video Generation-Setup-0.0.1.exe`

**Optional: Code Signing**
- Get a code signing certificate
- Configure in `package.json` → `build.win.certificateFile`
- Prevents "Unknown Publisher" warnings

### macOS

1. Build the DMG:
   ```bash
   npm run electron:build:mac
   ```

2. Distribute `Sora Video Generation-0.0.1.dmg`

**Optional: Notarization**
- Required for macOS Catalina+
- Requires Apple Developer account
- Prevents "App cannot be opened" warnings

### Linux

1. Build AppImage:
   ```bash
   npm run electron:build:linux
   ```

2. Distribute `Sora Video Generation-0.0.1.AppImage`

**No additional setup required for Linux.**

---

## Development vs Production

| Feature | Development | Production |
|---------|------------|------------|
| DevTools | ✅ Open by default | ❌ Disabled |
| Hot Reload | ✅ Enabled | ❌ Not applicable |
| Source Maps | ✅ Enabled | ❌ Disabled |
| Code Minification | ❌ Disabled | ✅ Enabled |
| Window Size | 1400x900 | 1400x900 |
| Console Logs | ✅ Visible | ⚠️ Hidden (unless user opens DevTools) |

---

## Performance

### App Size

- **Windows installer:** ~150-200MB
- **macOS DMG:** ~150-200MB
- **Linux AppImage:** ~150-200MB

*Size includes Electron runtime, Chromium, Node.js, and your app*

### Startup Time

- **Cold start:** 2-5 seconds
- **Warm start:** 1-2 seconds

### Memory Usage

- **Idle:** ~150-250MB
- **Active:** ~300-500MB (depends on video processing)

---

## Next Steps

### Recommended Enhancements

1. **Add Auto-Updater**
   - Use `electron-updater`
   - Host updates on GitHub Releases
   - Enable automatic updates

2. **Implement System Tray**
   - Run in background
   - Quick access menu
   - Minimize to tray

3. **Add Native Menus**
   - File, Edit, View, Help menus
   - Keyboard shortcuts
   - Context menus

4. **Secure API Keys**
   - Move credentials to backend proxy
   - Use OAuth for authentication
   - Encrypt stored credentials

5. **Code Signing**
   - Windows: Get code signing certificate
   - macOS: Apple Developer account + notarization
   - Improves user trust

---

## Resources

- **Electron Documentation:** https://www.electronjs.org/docs
- **electron-builder:** https://www.electron.build/
- **vite-plugin-electron:** https://github.com/electron-vite/vite-plugin-electron

---

## Support

For issues or questions:
1. Check `CLAUDE.md` for project architecture
2. Review Electron logs in terminal
3. Check DevTools console for renderer errors
4. Verify environment variables are set

---

**Congratulations! Your Sora UI app is now a fully functional Electron desktop application!** 🎉
