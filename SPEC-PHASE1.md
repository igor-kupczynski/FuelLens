# FuelLens Phase 1 Specification

## Project Status
Initial project scaffolding is complete with:
- Vite + React + TypeScript setup
- PWA configuration with service worker and manifest
- CI/CD pipeline with GitHub Actions
- ESLint + Prettier configuration
- Test setup with Vitest and React Testing Library
- Basic app structure with a root component

## Phase 1 Goals
Create a minimal viable PWA for personal vehicle fuel tracking, focusing on:
1. Manual data entry
2. Excel import functionality
3. Basic analytics
4. Offline-first functionality

Time constraint: 4-8 hours of development time

## Technical Specifications

### Data Model
```typescript
interface FuelEntry {
  id?: number;
  date: Date;
  odometer: number;
  liters: number;
  cost: number;
  currency: string;
  notes?: string;
}
```

### Components to Implement

#### 1. FuelEntryForm
- Input fields for:
  - Date (default to current date)
  - Odometer reading (number)
  - Fuel amount in liters (number)
  - Total cost (number)
  - Currency (hardcoded to single currency in Phase 1)
  - Optional notes (text)
- Basic validation:
  - All fields except notes are required
  - Odometer must be higher than the previous entry
  - Fuel amount and cost must be positive
- Form submission handling
- Loading state handling

#### 2. RecentEntriesList
- Display last 5 entries
- Each entry should show:
  - Date
  - Odometer reading
  - Fuel amount
  - Cost
  - Basic fuel efficiency calculation (L/100km)
- Sort by date descending
- Swipe-to-delete functionality (optional in Phase 1)

#### 3. BasicStats Component
- Display:
  - Average consumption (L/100km)
  - Cost per kilometer
  - Total fuel cost
  - Total distance traveled
  - Basic trend indicator (improving/worsening consumption)

#### 4. ImportDialog
- Import from "Levorg Koszty.xlsx"
- File selection interface
- Progress indication
- Success/failure feedback
- Data validation before import
- Duplicate detection

### Storage Implementation
- Use Dexie.js for IndexedDB storage
- Schema:
```typescript
export class FuelLensDatabase extends Dexie {
  fuelEntries: Dexie.Table<FuelEntry, number>;

  constructor() {
    super('FuelLens');
    this.version(1).stores({
      fuelEntries: '++id, date, odometer'
    });
  }
}
```

### PWA Requirements
- Full offline functionality
- "Add to Home Screen" support
- iOS Safari optimizations
- Service worker for caching
- Local-first data storage

### Excel Import Implementation
- Use SheetJS library
- Map columns:
  - Date → date
  - Odometer → odometer
  - Fuel amount → liters
  - Cost → cost
- Validate data during import
- Sort by date before importing
- Handle missing or invalid data

## Not In Scope for Phase 1
- Photo capture/recognition
- Cloud sync
- Multiple currencies
- Maintenance tracking
- Location tracking
- Advanced analytics
- Multiple vehicles

## Testing Requirements
Each component should have tests for:
- Basic rendering
- User interactions
- Form validation
- Error states
- Data calculations

## Next Steps
1. Implement Dexie.js database setup
2. Create FuelEntryForm component
3. Implement basic data storage operations
4. Create RecentEntriesList component
5. Add BasicStats component
6. Implement Excel import functionality
7. Add comprehensive tests
8. Test PWA functionality on iOS Safari

## Definition of Done
- All components implemented and tested
- Excel import working with provided file
- PWA installable on iOS Safari
- Offline functionality verified
- CI pipeline passing
- Type checking passing
- Lint checks passing
- Manual testing completed on iOS Safari

## Current Project Structure
```
fuellens/
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   ├── icon-192-maskable.png
│   │   ├── icon-512-maskable.png
│   │   └── apple-touch-icon.png
│   └── manifest.json
├── src/
│   ├── App.tsx
│   ├── App.test.tsx
│   ├── main.tsx
│   └── test/
│       └── setup.ts
├── .eslintrc.cjs
├── index.html
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.test.json
└── vite.config.ts
```

## Development Environment
- Node.js 20.x
- pnpm package manager
- VS Code with recommended extensions
- iOS device for testing

## How to Run Development Environment
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Run linter
pnpm lint

# Build production version
pnpm build
```