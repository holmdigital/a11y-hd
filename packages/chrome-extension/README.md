# HolmDigital Chrome Extension

A Chrome extension for instant accessibility scanning with regulatory compliance mapping.

## Features

- **1-Click Scan**: Scan the current page directly from the browser toolbar
- **Visual Overlays**: Violations highlighted directly on the page
- **Regulatory Mapping**: WCAG → EN 301 549 → DOS-lagen compliance info
- **Dark Theme UI**: Modern, accessible popup interface

## Development

### Prerequisites

- Node.js 18+
- Chrome browser

### Setup

```bash
cd packages/chrome-extension
npm install
```

### Build

```bash
npm run build
```

### Load in Chrome

1. Open `chrome://extensions`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `dist` folder

### Development Mode

```bash
npm run dev
```

This enables hot-reload for faster development.

## Architecture

```
src/
├── popup/          # React popup UI
├── content/        # Page overlay script
├── background/     # Service worker (scanning logic)
└── utils/          # Shared utilities
```

## Tech Stack

- **Vite** + **@crxjs/vite-plugin** - Fast builds with HMR
- **React** - Popup UI
- **axe-core** - Accessibility scanning engine
- **TypeScript** - Type safety

## License

MIT - Holm Digital AB
