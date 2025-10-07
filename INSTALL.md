# Installation Guide - Sora Video Generation

This guide will help you install and run the Sora Video Generation desktop app on Windows, macOS, or Linux.

---

## 📋 Before You Install

### System Requirements

**Minimum:**
- **RAM:** 4GB (8GB recommended)
- **Storage:** 500MB free space
- **OS:**
  - Windows 10 or later (64-bit)
  - macOS 10.13 High Sierra or later
  - Ubuntu 18.04 / Fedora 32 or equivalent

**Required:**
- Internet connection (for video generation API)
- Azure OpenAI API credentials (see [Configuration](#configuration))

---

## 🪟 Windows Installation

### Method 1: Installer (Recommended)

1. **Download** the latest installer:
   - Go to [Releases](https://github.com/nikzart/sora-ui/releases)
   - Download `Sora-Video-Generation-Setup-X.X.X.exe`

2. **Run the installer:**
   - Double-click the `.exe` file
   - If you see "Windows protected your PC":
     - Click "More info"
     - Click "Run anyway"
   - Choose installation location
   - Click "Install"

3. **Launch the app:**
   - Desktop shortcut: Double-click "Sora Video Generation"
   - Start menu: Search for "Sora Video Generation"

### Method 2: Portable (No Installation)

1. **Download** the portable version:
   - Go to [Releases](https://github.com/nikzart/sora-ui/releases)
   - Download `Sora-Video-Generation-X.X.X-Windows-Portable.zip`

2. **Extract:**
   - Right-click → "Extract All..."
   - Choose a location (e.g., `C:\Apps\SoraUI`)

3. **Run:**
   - Open the extracted folder
   - Double-click `Sora Video Generation.exe`

**Note:** Portable version can run from a USB drive!

---

## 🍎 macOS Installation

### Installation Steps

1. **Download** the DMG file:
   - Go to [Releases](https://github.com/nikzart/sora-ui/releases)
   - Download `Sora-Video-Generation-X.X.X.dmg`

2. **Open the DMG:**
   - Double-click the downloaded `.dmg` file
   - A window will open

3. **Install:**
   - Drag "Sora Video Generation" to the Applications folder
   - Eject the DMG (click the eject icon)

4. **First Launch:**
   - Open Applications folder
   - Right-click "Sora Video Generation"
   - Click "Open"
   - Click "Open" again (bypasses Gatekeeper first time only)

**Note:** On first launch, macOS may ask for permission to access files. Click "OK" to allow.

### Troubleshooting macOS

**"App is damaged and can't be opened":**
```bash
xattr -cr "/Applications/Sora Video Generation.app"
```

**"App can't be opened because it is from an unidentified developer":**
- System Preferences → Security & Privacy → Click "Open Anyway"

---

## 🐧 Linux Installation

### Installation Steps

1. **Download** the AppImage:
   - Go to [Releases](https://github.com/nikzart/sora-ui/releases)
   - Download `Sora-Video-Generation-X.X.X.AppImage`

2. **Make executable:**
   ```bash
   chmod +x Sora-Video-Generation-*.AppImage
   ```

3. **Run:**
   ```bash
   ./Sora-Video-Generation-*.AppImage
   ```

### Optional: Desktop Integration

**Create desktop shortcut:**
```bash
# Move AppImage to /opt (or any location)
sudo mv Sora-Video-Generation-*.AppImage /opt/sora-ui/sora-video-generation

# Create desktop entry
cat > ~/.local/share/applications/sora-video-generation.desktop << 'EOF'
[Desktop Entry]
Name=Sora Video Generation
Exec=/opt/sora-ui/sora-video-generation
Icon=video
Type=Application
Categories=Utility;Graphics;
EOF
```

### Troubleshooting Linux

**FUSE error:**
```bash
sudo apt install fuse libfuse2  # Ubuntu/Debian
sudo dnf install fuse fuse-libs  # Fedora
```

**Permission issues:**
```bash
chmod +x Sora-Video-Generation-*.AppImage
```

---

## ⚙️ Configuration

### Setting Up API Credentials

The app requires Azure OpenAI API credentials to work.

**Option 1: Environment Variables (Recommended)**

Create a `.env` file in the app directory:

**Windows:** `%APPDATA%\Sora Video Generation\.env`
**macOS:** `~/Library/Application Support/Sora Video Generation/.env`
**Linux:** `~/.config/Sora Video Generation/.env`

```env
VITE_AZURE_ENDPOINT=https://your-resource.cognitiveservices.azure.com
VITE_AZURE_API_KEY=your_api_key_here
VITE_API_VERSION=preview

# Optional: Prompt Enhancement
VITE_O4_MINI_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
VITE_O4_MINI_DEPLOYMENT=o4-mini
VITE_O4_MINI_API_VERSION=2024-12-01-preview
```

**Option 2: Embedded at Build Time** (Developer only)

If you're building from source, create `.env` in the project root before building.

### Getting Azure OpenAI Credentials

1. Go to [Azure Portal](https://portal.azure.com/)
2. Create an Azure OpenAI resource
3. Deploy a Sora model
4. Copy your endpoint and API key
5. Add them to your `.env` file

---

## 🚀 First Launch

### What to Expect

1. **App opens** - Main window appears with nature-themed UI
2. **Queue system** - Three tabs: Create, Queue, Gallery
3. **Settings panel** - Adjust video quality, duration, resolution

### Quick Start Guide

1. **Enter a prompt:**
   - Type a video description in the prompt box
   - Example: "A serene sunset over calm ocean waves"

2. **Optional: Enable AI Enhancement:**
   - Toggle "AI Enhance" switch
   - Click "Enhance" to get a cinematic version of your prompt

3. **Adjust settings:**
   - Choose resolution (480p, 720p, 1080p)
   - Set duration (5-20 seconds)
   - Select aspect ratio

4. **Generate:**
   - Click "Generate" button
   - Video appears in Queue tab
   - Wait for generation to complete (can take 1-5 minutes)

5. **View result:**
   - Completed videos appear in Gallery tab
   - Click to play, download, or regenerate

---

## 🔄 Updating

### Automatic Updates (Coming Soon)

Future versions will support automatic updates. For now, update manually:

1. Download the latest version from [Releases](https://github.com/nikzart/sora-ui/releases)
2. Install over the existing installation
3. Your videos and settings are preserved

### Manual Update

**Windows:**
- Run the new installer (it will replace the old version)

**macOS:**
- Drag the new app to Applications (replace when prompted)

**Linux:**
- Replace the old AppImage with the new one

---

## 🗑️ Uninstalling

### Windows

**Method 1: Control Panel**
1. Settings → Apps → Installed apps
2. Find "Sora Video Generation"
3. Click "Uninstall"

**Method 2: Uninstaller**
1. Start Menu → Sora Video Generation → Uninstall

**For portable version:** Just delete the folder

### macOS

1. Open Applications folder
2. Drag "Sora Video Generation" to Trash
3. Empty Trash

**Remove settings (optional):**
```bash
rm -rf ~/Library/Application\ Support/Sora\ Video\ Generation
```

### Linux

1. Delete the AppImage file
2. Remove desktop integration (if installed):
   ```bash
   rm ~/.local/share/applications/sora-video-generation.desktop
   ```

---

## 🐛 Troubleshooting

### App Won't Start

**Windows:**
- Check if antivirus is blocking the app
- Run as administrator (right-click → "Run as administrator")
- Reinstall the app

**macOS:**
- Run `xattr -cr "/Applications/Sora Video Generation.app"`
- Check System Preferences → Security & Privacy

**Linux:**
- Ensure AppImage has execute permission: `chmod +x *.AppImage`
- Install FUSE: `sudo apt install fuse libfuse2`

### Video Generation Fails

1. **Check API credentials:**
   - Verify `.env` file exists and has correct values
   - Test credentials in Azure Portal

2. **Check internet connection:**
   - App requires active internet for API calls

3. **Check API quota:**
   - You may have reached your Azure OpenAI quota
   - Check Azure Portal for usage

### App Crashes

1. **Check logs:**
   - Windows: `%APPDATA%\Sora Video Generation\logs\`
   - macOS: `~/Library/Logs/Sora Video Generation/`
   - Linux: `~/.config/Sora Video Generation/logs/`

2. **Clear cache:**
   - Close the app
   - Delete the cache folder
   - Restart the app

3. **Reinstall:**
   - Uninstall completely
   - Download fresh installer
   - Reinstall

---

## 💾 Data Location

### Where Your Data is Stored

**Videos & Settings:**
- Windows: `%APPDATA%\Sora Video Generation\`
- macOS: `~/Library/Application Support/Sora Video Generation/`
- Linux: `~/.config/Sora Video Generation/`

**Generated Videos:**
- Stored in browser-style localStorage
- Videos are cached locally for fast access
- Can be deleted from Gallery tab

---

## 🔒 Privacy & Security

- **API keys** are stored locally on your device
- **No telemetry** or usage tracking
- **No data collection** - everything stays on your device
- **Videos** are generated using your Azure OpenAI account
- **Local storage** - videos stay on your computer

⚠️ **Security Note:** API keys are embedded in the app. For enhanced security, consider using a backend proxy in production environments.

---

## 📞 Support

### Getting Help

1. **Documentation:**
   - [README.md](README.md) - Project overview
   - [ELECTRON.md](ELECTRON.md) - Developer guide
   - [CLAUDE.md](CLAUDE.md) - Architecture details

2. **Issues:**
   - Report bugs: [GitHub Issues](https://github.com/nikzart/sora-ui/issues)
   - Feature requests welcome!

3. **Community:**
   - Star the project on [GitHub](https://github.com/nikzart/sora-ui)
   - Contribute: See [Contributing](#contributing)

---

## 🤝 Contributing

Want to improve the app?

1. Fork the repository
2. Make your changes
3. Submit a pull request

See [README.md](README.md) for development setup.

---

## 📄 License

This project is licensed under the MIT License.

---

**Enjoy creating amazing videos with Sora! 🎥✨**

For questions or support, open an issue on [GitHub](https://github.com/nikzart/sora-ui/issues).
