# FuelLens

Personal vehicle fuel tracking Progressive Web App optimized for iOS Safari.

## Features

### Phase 1
- Manual fuel entry (date, odometer, fuel amount, cost)
- Excel import capability
- Basic analytics (L/100km, cost per kilometer)
- Offline-first local storage
- PWA optimized for iOS Safari

## Development

### Prerequisites
- Node.js 20.x
- pnpm (recommended for better dependency management)
- Mac development environment
- iOS device for testing

### Quick Start
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Lint code
pnpm lint
```

### Development Environment
The project uses:
- Vite + React + TypeScript for fast development and type safety
- Tailwind CSS for styling
- Dexie.js for IndexedDB local storage
- Vite PWA plugin for service worker generation
- Vitest for unit testing
- GitHub Actions for CI/CD

### Project Structure
```
fuellens/
├── .github/
│   └── workflows/       # CI/CD workflows
├── public/
│   ├── manifest.json    # PWA manifest
│   └── icons/          # App icons
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── services/      # Data services
│   ├── types/         # TypeScript types
│   └── App.tsx        # Root component
├── tests/             # Test files
├── index.html         # Entry point
└── vite.config.ts     # Vite configuration
```

### PWA Development Notes
- Test on actual iOS devices frequently
- Use Safari Web Inspector for debugging
- Consider iOS PWA limitations:
  - No push notifications
  - Limited background sync
  - Storage quotas
  - Camera API constraints

## Testing
- Unit tests with Vitest
- Component testing with React Testing Library
- E2E testing with Playwright
- iOS Safari testing required for all features

## Contributing
1. Create a feature branch from `main`
2. Implement changes with tests
3. Submit PR with description of changes
4. Ensure CI passes
5. Request review

## License
MIT
