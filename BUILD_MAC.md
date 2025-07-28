# Building Book Thingy for macOS

## Prerequisites

1. **macOS computer** (Intel or Apple Silicon)
2. **Node.js** (v16 or later)
3. **Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ElTacoInteligente/book-thingy.git
   cd book-thingy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create macOS icon** (optional):
   ```bash
   # If you have iconutil installed
   mkdir icon.iconset
   # Add various sized PNGs (16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024)
   iconutil -c icns icon.iconset -o icon.icns
   ```

## Building

### For Intel Macs:
```bash
npm run build-mac
```

### For Apple Silicon (M1/M2/M3):
```bash
npm run build-mac
```

### Universal Build (both architectures):
The build is configured to create a universal binary by default.

## Output

The build will create:
- `dist/Book Thingy-1.0.0.dmg` - Disk image for distribution
- `dist/mac/Book Thingy.app` - The application bundle

## Code Signing (Optional)

For distribution outside the Mac App Store:

1. **Get a Developer ID certificate** from Apple Developer Program ($99/year)

2. **Update package.json**:
   ```json
   "mac": {
     "identity": "Developer ID Application: Your Name (XXXXXXXXXX)"
   }
   ```

3. **Sign the app**:
   ```bash
   npm run build-mac
   ```

## Notarization (Recommended)

For macOS 10.15+, notarization is recommended:

1. **Create an app-specific password** at https://appleid.apple.com

2. **Add to package.json**:
   ```json
   "afterSign": "scripts/notarize.js"
   ```

3. **Create notarize script** (see Apple docs)

## Testing

1. **Mount the DMG**:
   - Double-click `Book Thingy-1.0.0.dmg`

2. **Install**:
   - Drag Book Thingy to Applications

3. **First launch**:
   - Right-click and choose "Open" (for unsigned apps)
   - Or double-click (for signed apps)

## Troubleshooting

### "App is damaged" error
- The app needs to be signed or opened with right-click → Open

### "Unknown developer" warning
- Normal for unsigned apps
- Users can bypass in System Preferences → Security & Privacy

### Build fails on M1/M2/M3
- Make sure you have Rosetta 2 installed:
  ```bash
  softwareupdate --install-rosetta
  ```

## Distribution

### Without Code Signing:
- Users will need to right-click → Open on first launch
- May trigger security warnings

### With Code Signing:
- Smoother installation experience
- Required for Mac App Store
- Recommended for direct distribution

## File Size

Expected output size:
- DMG: ~85-100 MB
- Uncompressed app: ~200-250 MB