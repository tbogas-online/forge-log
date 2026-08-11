# Changelog

All notable changes to Forge Log are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses date-based sections for releases.

## [Unreleased]

### Added
- Full session log editing: complete/open toggle, editable avg pace, and all run metrics reflect saved log values

### Changed
- Clear log resets all log fields (including completion status)
- Open menu on sessions can mark complete or mark open again

## [2026-08-10]

### Added
- Initial Forge Log workout tracker: sessions list, session details, workload graph, and personal records
- Training calendar with monthly donut charts per day
- AI Coach panel with training recommendations
- Collapsible panels for all major sections
- Footer **Add workout** button and last-access timestamp (stored in `localStorage`)
- Mobile layout: safe-area padding, horizontal scroll for filters/stats, larger touch targets, 16px inputs
- Add-workout modal sheet (bottom overlay) for reliable use on phone and web
- GitHub Actions workflow to deploy static site to GitHub Pages (`.github/workflows/deploy-pages.yml`)
- `.nojekyll` for correct GitHub Pages static hosting

### Changed
- Default panel state on load: only Workload expanded; others collapsed
- Workload chart balloon uses fixed positioning so it appears above panels
- Session details close button visibility fixed in flex layout

### Fixed
- Sessions panel empty gap between header and list
- Chart balloon appearing under AI Coach panel (`overflow: hidden`)
- Add workout appearing to do nothing online (form opened off-screen in session details panel)

### Security
- `.gitignore` updated to exclude local SSH key files from accidental commits
