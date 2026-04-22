# Hiro Run (希罗快跑) - Gemini CLI Project Context

This document provides a comprehensive overview of the **Hiro Run** project, an endless runner fan game developed with React and Phaser 3.

## Project Overview

- **Core Concept:** A 2D endless runner fan game based on the [Demon Runner](https://github.com/misterpaul4/Demon-Runner) project, featuring customized visuals, music, and gameplay mechanics.
- **Frontend Stack:** React 18 (UI Shell), Vite (Build Tool), TypeScript (Logic).
- **Game Engine:** Phaser 3 (Arcade Physics).
- **Persistence:** Local storage for high scores, collected stars, and upgrades.

## Architecture

The project follows a hybrid architecture combining React and Phaser:

- **React (`src/App.tsx`):** Manages the application shell, viewport/orientation logic for mobile, and high-level UI overlays.
- **Phaser Bridge (`src/game/PhaserGame.tsx`):** A custom React component that initializes the Phaser engine and handles event communication via an `EventBus`.
- **Game Logic (`src/game/scenes/`):** Phaser Scenes handle the game loop, physics, and rendering:
  - `Boot.ts`: Initial engine setup.
  - `Preloader.ts`: Asset loading (images, audio, spritesheets).
  - `MainMenu.ts`: Game entry point.
  - `Game.ts`: Main gameplay loop (level generation, difficulty scaling, collision).
  - `GameOver.ts`: Score reporting and restart logic.
  - `Shop.ts`: Upgrade system (e.g., Triple Jump).
- **Utilities (`src/utils/`):** Shared logic for configuration, runtime detection, and font loading.

## Building and Running

### Development
- **Web:** `npm run dev` (Starts Vite with log utilities).
- **Web (No logs):** `npm run dev-nolog`.

### Production Build
- **Web:** `npm run build`.

### Assets & Icons
- **Asset Location:** `public/assets/` contains game sprites, backgrounds, and sounds.

## Development Conventions

- **Type Safety:** Use TypeScript for all logic; avoid `any` where possible.
- **State Management:**
  - **Game State:** Use `src/utils/config.ts` for global settings and persistent storage wrappers.
  - **Scene Communication:** Use `src/game/EventBus.ts` for React <-> Phaser events.
- **Styling:** Vanilla CSS managed via `public/style.css` and React component class names.
- **Mobile Support:** Handled in `App.tsx` via `isMobileRuntime` and orientation locks/hints.

## Key Files
- `package.json`: NPM scripts and dependencies.
- `src/game/scenes/Game.ts`: Core gameplay logic and difficulty scaling.
- `src/utils/config.ts`: Storage keys and base game parameters.
- `scripts/`: PowerShell utilities for automation.
