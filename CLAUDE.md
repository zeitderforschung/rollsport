# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Rollkunstlauf (Artistic Roller Skating) Ranking Calculator** that implements the DRIV Majoritätssystem (Majority System) for competition rankings. The application is a React single-page app built with Vite that calculates rankings based on pairwise judge comparisons rather than simple score summation.

**Key Concept**: Rankings are determined by how many pairwise victories a skater has across all judges, not by highest total scores. This means a skater can have the highest score from one judge but still not place first overall if other skaters win the majority of judges in direct comparisons.

## Development Commands

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Run type checking and build
yarn build

# Run linting
yarn lint

# Run all tests in watch mode
yarn test

# Run tests once
yarn test:run

# Run tests with UI
yarn test:ui
```

## Core Architecture

### Ranking Algorithm ([src/utils/scoring.ts](src/utils/scoring.ts))

The heart of the application is the `calculateRankings()` function that implements a multi-level ranking system:

1. **Level 1: Majority Victories (M.V.)** - Pairwise comparisons between all skaters
   - For each pair, compare judge totals (A+B), with B-score as tiebreaker
   - Skater winning majority of judges gets 1 victory point
   - Equal judges = 0.5 points each

2. **Tie-Breaking Hierarchy** (applied when M.V. is equal):
   - **Tie-Break 1**: Direct comparison score (Vergleichszahl) - only among tied skaters
   - **Tie-Break 2**: Sum of all B-scores from all judges (raw scores, not trimmed mean)
   - **Tie-Break 3**: Comparison score with ALL skaters in competition (not just tied ones)
   - **Tie-Break 4**: Total score (trimmed mean A + B)
   - **Final**: Shared rank if all criteria equal

### Score Processing

- **Trimmed Mean Calculation**:
  - 3 judges: median (middle value)
  - More than 3 judges: remove highest and lowest, average the rest
  - 1-2 judges: simple average
  - All scores rounded to 1 decimal place

- **Judge Comparisons**: Individual judge totals (A+B) are used for all pairwise comparisons, NOT trimmed means

### Data Flow

1. **Input Parsing** ([src/utils/parser.ts](src/utils/parser.ts)):
   - Format: `Name: A1 A2 A3 / B1 B2 B3`
   - Supports German decimal separators (comma)
   - Auto-generates names if colon omitted
   - Pads missing scores with null

2. **Ranking Calculation** ([src/utils/scoring.ts](src/utils/scoring.ts)):
   - Converts `SkaterScores` to `SkaterResult` with computed rankings
   - Adds head-to-head breakdowns for visualization

3. **Display**:
   - **Table** ([src/components/SkaterResultTable/](src/components/SkaterResultTable/)): Shows rankings with expandable explanations
   - **Network Graph** ([src/components/HeadToHeadNetwork/](src/components/HeadToHeadNetwork/)): 3D force-directed graph showing all pairwise comparisons

### State Management

- URL-based state: Input data compressed and stored in URL hash using `lz-string`
- Enables sharing results via URL
- No backend required - fully client-side

## Key Type Definitions

- **SkaterScores** ([src/types/SkaterScores.ts](src/types/SkaterScores.ts)): Raw input data (name, aScores[], bScores[])
- **SkaterResult** ([src/types/SkaterResult.ts](src/types/SkaterResult.ts)): Computed results including rank, M.V., tie-break info, head-to-head details
- **TieBreakLevel** ([src/types/TieBreakLevel.ts](src/types/TieBreakLevel.ts)): Union type for tie-breaking methods
- **HeadToHeadResult** ([src/types/HeadToHeadResult.ts](src/types/HeadToHeadResult.ts)): Individual matchup details

## Testing

Tests are located in [src/utils/scoring.test.ts](src/utils/scoring.test.ts) and [src/utils/parser.test.ts](src/utils/parser.test.ts).

The test suite includes:
- Trimmed mean calculations (3 judges, 5+ judges)
- Pairwise comparison logic
- Full ranking scenarios with tie-breaking
- Edge cases (equal scores, missing scores)
- Parser validation

To run a single test file:
```bash
yarn test scoring.test.ts
```

## UI Framework

- **Mantine v8**: Component library for UI elements
- **react-force-graph-3d**: 3D network visualization
- **Vite**: Build tool and dev server
- **Vitest**: Testing framework

## Important Implementation Details

### Majority System vs. Simple Sum

The algorithm explicitly does NOT sum scores directly. Rankings come from pairwise victories. See [SCORING.md](SCORING.md) for the complete mathematical specification.

### Tie-Break 3 Subtlety

Tie-Break 3 compares tied skaters with ALL competitors, not just other tied skaters. This is different from Tie-Break 1 and is crucial for correct implementation.

### Score Rounding

All displayed scores are rounded to 1 decimal place, but internal calculations maintain full precision until final display.

## Reference Documentation

- [DRIV Wertungskriterien Einzellaufen Kür 10,0 (2025)](https://www.rollkunstlauf-driv.de/fileadmin/rollkunstlauf-driv/documente/regelwerk/Wertungskriterien/2025_01_DRIV_Wertungskriterien_Einzellaufen_Kuer.pdf)
- [Rollkunstlauf - Von den Noten zu den Plätzen](https://rollsport-potsdam.de/file/repository/VondenNotenzudenPltzen.pdf) by Rainer Kayser
- [SCORING.md](SCORING.md): Detailed algorithm specification with examples
