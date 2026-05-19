# Star Wars SWAPI Explorer

A high-performance, beautifully designed, and minimalistic Star Wars Explorer web application. This project was developed as a Front End Developer assessment, adhering strictly to modern production-grade standards, clean component structuring, responsive user layouts, and efficient state/cache management.

## Key Features

1. **Persistent Favorites Sidebar**:
   - Save and remove your favorite characters.
   - Instantly synced with `localStorage`, so your selections remain intact across page reloads.
   - Each item is a link to the character details, accompanied by an elegant "Unfavorite" button.

2. **Debounced Auto-Search with Autocomplete**:
   - Real-time search that dynamically displays matching characters as you type.
   - Built-in **Custom Debounce Hook** (300ms delay) to prevent API overload and optimize network usage.
   - Saves recent search queries in local history and presents them as an **Autocomplete dropdown** (bonus feature!) which can be cleared with a single click.

3. **Optimized Parallel Relationship Resolving**:
   - Character Details page fetches specs and aggregates details in parallel.
   - Homeworld name and Film titles are loaded asynchronously in parallel (`Promise.all`), avoiding consecutive wait-blocks.

4. **In-Memory Cache Provider**:
   - Implemented a caching mechanism for fetched character details, planet names, and movie titles.
   - Back-and-forth navigations between pages load instantly with zero redundant network requests.

5. **Premium Futuristic Aesthetic**:
   - Dark galaxy design with custom glassmorphism and subtle cyan lightsaber highlights.
   - Shimmer loaders (skeleton loading cards) for smooth content transitions.
   - Clean, lightweight SVG iconography powered by `lucide-react`.
   - Responsive design designed to scale perfectly on mobile, tablet, and widescreen viewports.

---

## Architecture & Project Structure

The project follows a clean, modular folder hierarchy:

```
src/
├── components/          # Reusable UI components
│   ├── CharacterCard.tsx  # Character summary card with heart toggle
│   ├── ErrorState.tsx     # Graceful error screens and retry utilities
│   ├── Header.tsx         # Search input with autocomplete dropdown
│   ├── LoadingSkeleton.tsx# Shimmer loading skeleton overlays
│   └── Sidebar.tsx        # Persistent favorites vertical list
├── context/             # Global Application State
│   └── StarWarsContext.tsx# State provider for favorites, history, and network cache
├── hooks/               # Custom hooks
│   └── useDebounce.ts     # Input change debouncer hook
├── pages/               # Routed pages
│   ├── Home.tsx           # Character grid landing page with pagination
│   ├── Details.tsx        # Character specs details sheet
│   └── SearchResults.tsx  # Fuzzy search result display list
├── services/            # API Layer
│   └── swapi.ts           # Type declarations and fetch service wrappers
├── index.css            # Unified CSS layout design tokens and visual elements
├── main.tsx             # Application mount point
└── App.tsx              # Router shell and layout structure
```

---

## Getting Started

### Prerequisites

You need [Node.js](https://nodejs.org/) (v18+) installed on your machine.

### Installation

1. Navigate to the project root directory:
   ```bash
   cd sage-grey-fe-assessment
   ```

2. Install the package dependencies:
   ```bash
   npm install
   ```

### Running Locally

To launch the Vite development server:
```bash
npm run dev
```
Once started, open your browser and navigate to `http://localhost:5173/`.

### Production Build

To compile TypeScript and bundle the application for production deployment:
```bash
npm run build
```
The compiled, production-ready static assets will be output to the `dist/` directory. You can preview the production bundle locally:
```bash
npm run preview
```

---

## Technologies Used

- **Framework**: [React 19](https://react.dev/) (Functional Components with Hooks)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strictly-typed service parameters and response schemas)
- **Bundler & Server**: [Vite 8](https://vite.dev/) (Ultra-fast HMR and building)
- **Routing**: [React Router DOM v6](https://reactrouter.com/) (Dynamic path mapping)
- **Icons**: [Lucide React](https://lucide.dev/) (Minimalist SVG icons)
- **Styling**: Modern CSS Custom Properties (CSS variables, flexbox, grid, glassmorphism, keyframe animations)
- **API**: [SWAPI.tech REST API](https://www.swapi.tech/)
