# Sora Video Generation UI

A beautiful, fully-featured interface for Azure OpenAI's Sora video generation model. Built with React, TypeScript, and Tailwind CSS.

**Available as:**
- 🌐 **Web Application** - Run in any modern browser
- 💻 **Desktop App (Electron)** - Standalone app for Windows, macOS, and Linux

---

## 📥 Download Desktop App

**Latest Release:** [Download from GitHub Releases](https://github.com/nikzart/sora-ui/releases)

### Quick Install

- **Windows:** Download `.exe` installer or portable `.zip`
- **macOS:** Download `.dmg` file
- **Linux:** Download `.AppImage` file

📖 **[Full Installation Guide →](./INSTALL.md)**

For developers: See [ELECTRON.md](./ELECTRON.md) for building from source.

---

## Features

### 🎨 **Stunning UI/UX**
- Nature-inspired glassmorphic design
- Smooth animations with Framer Motion
- Responsive layout for all devices
- Custom forest/sage color theme

### 🎬 **Complete Video Generation**
- **Text-to-Video**: Generate videos from text prompts
- **Image-to-Video**: Animate images with text guidance
- **Video-to-Video**: Transform existing videos with prompts

### ⚙️ **Advanced Settings**
- **Camera Angles**: 4 preset angles (top-to-bottom, bottom-to-top, left-to-right, eye-level)
- **Video Quality**: 480p, 720p, 1080p options
- **Duration Control**: 5-60 second videos
- **Custom Crop Bounds**: Fine-tune input media framing

### 📹 **Video Management**
- Custom video player with full controls
- One-click video download
- Gallery view with thumbnails
- Generation history tracking

### 🚀 **Advanced Features**
- Real-time job status polling
- Progress indicators
- Toast notifications
- Drag & drop file upload
- Media preview with crop editor

## Getting Started

### For End Users

**Download the desktop app:** [Installation Guide](./INSTALL.md)

No development setup needed - just download and run!

---

### For Developers

#### Prerequisites
- Node.js 16+
- npm or yarn

#### Web App Development

1. Clone the repository:
```bash
git clone https://github.com/nikzart/sora-ui.git
cd sora-ui
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your API credentials:
```env
VITE_AZURE_ENDPOINT=https://your-endpoint.cognitiveservices.azure.com
VITE_AZURE_API_KEY=your_api_key_here
VITE_API_VERSION=preview
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

#### Electron App Development

```bash
# Run Electron app in development mode
npm run electron:dev

# Build for your current platform
npm run electron:build

# Build for specific platforms
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux
```

See [ELECTRON.md](./ELECTRON.md) for detailed Electron development guide.

#### Build for Production (Web)

```bash
npm run build
npm run preview
```

## Usage

### Text-to-Video
1. Select "Text" mode
2. Enter your prompt
3. Adjust settings (camera angle, quality, duration)
4. Click "Generate"

### Image-to-Video
1. Select "Image + Text" mode
2. Upload an image (drag & drop or click)
3. Enter your prompt
4. Adjust crop bounds if needed
5. Configure settings and generate

### Video-to-Video
1. Select "Video + Text" mode
2. Upload a video file
3. Enter transformation prompt
4. Set crop bounds and settings
5. Generate your new video

## API Configuration

The app is pre-configured with Azure OpenAI credentials:
- **Endpoint**: `https://xandar.cognitiveservices.azure.com`
- **Model**: `sora`

To update credentials, edit `src/services/soraService.ts`:
```typescript
const AZURE_ENDPOINT = 'your-endpoint';
const API_KEY = 'your-api-key';
```

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Hooks

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Slider.tsx
│   │   └── Toast.tsx
│   ├── Gallery.tsx      # Video gallery
│   ├── GenerationModes.tsx
│   ├── MediaUpload.tsx  # File upload with preview
│   ├── ProgressIndicator.tsx
│   ├── PromptInput.tsx
│   ├── SettingsPanel.tsx
│   └── VideoPlayer.tsx  # Custom video player
├── services/
│   └── soraService.ts   # API integration
├── types/
│   └── sora.ts          # TypeScript definitions
├── lib/
│   └── utils.ts         # Helper functions
├── App.tsx              # Main application
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Features in Detail

### Settings Panel
- **Camera Angles**: Control video perspective
- **Quality Presets**: Optimized resolution/framerate combos
- **Duration Slider**: 5-60 seconds with 5s increments
- **Cost Estimation**: Real-time pricing preview

### Media Upload
- Drag & drop interface
- Image formats: JPG, PNG, WebP
- Video formats: MP4, WebM, MOV
- File size display
- Preview with remove option

### Video Player
- Play/pause controls
- Volume control
- Seek bar with time display
- Fullscreen support
- Download button

### Gallery
- Grid layout with thumbnails
- Click to load generation
- Delete functionality
- Timestamp display
- Prompt preview

## Development

### Adding New Features

1. **New Component**: Create in `src/components/`
2. **New Type**: Add to `src/types/sora.ts`
3. **API Methods**: Extend `src/services/soraService.ts`
4. **Styling**: Use Tailwind classes or extend `tailwind.config.js`

### Customizing Theme

Edit `tailwind.config.js` to change colors:
```javascript
colors: {
  forest: { ... },
  sage: { ... },
}
```

## Performance Optimizations

- Lazy loading for video thumbnails
- Blob URL management for efficient memory
- Debounced input handlers
- Optimized re-renders with React.memo
- Code splitting with dynamic imports

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT

## Credits

Built with ❤️ using Azure OpenAI Sora API
