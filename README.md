# Feast and Feral

Unity game project and development files for Feast and Feral.

The project website is deployed from the repository root with GitHub Pages:
https://sereiatalia.github.io/feast-and-feral/

The landing page lives in `index.html`, its styles and interactions are in
`styles.css`, `adventure.css`, and `site.js` / `adventure.js`, and its artwork
is in `assets/`. The site links to the current game page on itch.io.

## Local website preview

The static site can be previewed with `npm start` from the repository root.

## Unity project files to commit

- `Assets/` — scenes, scripts, art, audio, and other game assets
- `Packages/` — Unity package manifest and lock file
- `ProjectSettings/` — project configuration

Keep the exported Windows/macOS builds, installers, and generated Unity folders out of this repository. The public Windows installer and game downloads are distributed through itch.io.

## Large source assets

For source assets that exceed GitHub's normal file limits, configure Git LFS for the relevant file types before adding them. Do not use LFS for generated builds or installer files.

## Current release

Check the itch.io page for the latest public Windows build and release details.
