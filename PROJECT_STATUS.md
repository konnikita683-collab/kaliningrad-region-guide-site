# Kaliningrad Region Guide — Project Status

## Current state
- Repository: `konnikita683-collab/kaliningrad-region-guide-site`
- Current build reviewed: `beta092pb5/index.html`
- Note: GitHub API does not currently show a branch named `PB5`; PB5-related commits and files are present in the repository history/default branch.
- Build marker in loader: `0.9.2-pb5`.

## Structure

### Entry point
`beta092pb5/index.html`
- Lightweight PB5 shell.
- Loads compressed application payload from `beta/data/*.txt`.
- Injects additional fixes/scripts before rendering.
- Current cache stamp: `20260825-pb5-wx5-dt1`.

### PB5 scripts

`beta092pb5/day-tools.js`
- Adds excursion recommendations by day.
- Adds booking mark for excursions using localStorage.
- Adds personal notes per day.
- Adds event ticket links.
- Removes legacy event recommendation blocks.

`beta092pb5/weather-single.js`
- Adds live weather blocks by destination.
- Determines city from day program.
- Adds sea temperature/wave data for coastal locations.
- Removes old placeholder weather blocks.

## Implemented features identified
- 5-day itinerary generation and day cards.
- Accommodation/date handling logic.
- Weather integration.
- Excursion recommendations.
- Event links and ticket navigation.
- Personal notes and excursion booking markers.
- PB5/PB5.1/PB5.2 regression and smoke-test related commits exist.

## Important commits found
- `c9c00ee` — keep PB5 storage schema in PB5.1 shell.
- `d0fe1ff` — PB5.1 regression smoke.
- `31faf09` — PB5.2 entry point.
- `542d057` — PB5.2 coherent replacement day logic.
- `2b13801` — PB5 Android smoke record.

## Known issues

### Accommodation dates bug (priority)
Observed issue:
- When manually decreasing accommodation dates after replacing/changing trip days, expected date changes and program regeneration do not always occur correctly.

Relevant code area:
- Date normalization patch inside `beta092pb5/index.html` (`ensureLodgingDates`).
- State synchronization between trip dates, lodging setup, and rendered days.

Next task:
- Fix manual reduction of accommodation dates without breaking automatic route/date generation.

## Rules for next changes
1. Change one task at a time.
2. Preserve working PB5 features.
3. Verify affected flow after each change.
4. Record changed files and regression result.
