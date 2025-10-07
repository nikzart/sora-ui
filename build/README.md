# App Icons

This directory contains icons for the Electron application.

## Required Icon Files

For full platform support, you need:

### Windows
- **icon.ico** - Windows icon file (256x256 pixels recommended)
  - Can be created from a PNG using online tools like https://icoconvert.com/
  - Should contain multiple sizes: 16x16, 32x32, 48x48, 256x256

### macOS
- **icon.icns** - macOS icon file
  - Can be created from a 1024x1024 PNG using `iconutil` on macOS
  - Or use online converters like https://cloudconvert.com/png-to-icns

### Linux
- **icon.png** - PNG icon (512x512 or 1024x1024 pixels)
  - High resolution PNG file
  - Should be square

## How to Create Icons

1. **Design your icon** - Create a square image (1024x1024 recommended)
   - Use your brand colors
   - Keep it simple and recognizable
   - Save as PNG

2. **Convert to platform formats:**
   - Windows (.ico): https://icoconvert.com/
   - macOS (.icns): https://cloudconvert.com/png-to-icns
   - Linux: Just use the PNG file

3. **Place files in this directory:**
   ```
   build/
   ├── icon.ico    (Windows)
   ├── icon.icns   (macOS)
   └── icon.png    (Linux)
   ```

## Default Icon

If no icons are provided, Electron will use a default icon. The app will still work, but it won't have a custom appearance.

## Icon Design Tips

- Use simple, recognizable shapes
- Ensure it looks good at small sizes (16x16)
- Avoid too much detail
- Use your brand colors
- Test on dark and light backgrounds
