# Changelog

All notable changes to **Shulker Box** are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (`MAJOR.MINOR.PATCH`).

**How to use this file**

- Add new bullets under **`[Unreleased]`** as you commit.
- When you ship a GitHub Release, move those bullets into a new `## [x.y.z] - YYYY-MM-DD` section and clear `[Unreleased]`.
- Match the release tag (`v1.0.2`) and attach `ShulkerBox-*-windows-portable.zip` + `ShulkerBox-*-update.json`.

Downloads: [GitHub Releases](https://github.com/renzoreyn/ShulkerBox/releases)

---

## [Unreleased]

### Added

### Changed

### Fixed

### Removed

---

## [1.0.2] - 2026-05-22

[Release](https://github.com/renzoreyn/ShulkerBox/releases/tag/v1.0.2)

### Added

- In-app updater: check GitHub Releases, download, restart to install.
- `tools/apply-update.ps1` — applies updates after exit; keeps `backup/` and `enabled.json`.
- Release `update.json` with SHA256 for verified downloads.
- Browser-based update check (fast) with fallback to built-in API.
- Update cache (5 min) so repeat checks are instant when already up to date.
- Console log levels: errors in red, warnings in yellow, success in green.

### Changed

- **Updates** button: one flow — check → “latest version” message or download + restart prompt.
- App grid fits all 7 slots without horizontal scroll.
- `make-release.bat` / `package_release.py` emit portable zip + `update.json`.

### Fixed

- App card labels readable on dark background (no black-on-black text).
- Update check no longer blocks UI on slow GitHub / old portable builds (`POST` 404 → `GET` fallback).
- Long “Checking…” hang and client timeout on `/api/update/check`.
- Double-click on Updates causing duplicate errors.

---

## [1.0.1] (Deprecated) - 2026-05-22

QoL UI update (pre-updater polish).

### Changed

- Modern dark UI: stats bar, detail panel, full-width Pack button.
- Readable app names under icons; version badge in header.
- Click to select app, click again to toggle ON/OFF.
- Raw app icons from API with pixel fallback.
- Responsive layout; credits footer and custom context menu.

### Fixed

- Missing footer / credits.
- Horizontal scroll on app row.
- Multi-click quirks on app tiles.

---

## [1.0.0] - 2026-05-22

[Release](https://github.com/renzoreyn/ShulkerBox/releases/tag/v1.0.0)

First public portable release.

### Added

- Portable Windows build (`ShulkerBox.exe`, no Python required on target PC).
- Web UI in native window (Edge app mode): pack / unpack / scan chest.
- Backup targets: Chrome, Telegram, Cursor, VS Code, SSH keys, Git config, wallpapers (configurable via `manifest.json`).
- Per-app ON/OFF toggles (`enabled.json`).
- Chest at `backup/latest` on a drive that survives reboot.
- CLI helpers in `tools/`: `Pack.bat`, `Unpack.bat`.
- GitHub Releases workflow (portable zip only on public repo; proprietary license).

---

[Unreleased]: https://github.com/renzoreyn/ShulkerBox/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/renzoreyn/ShulkerBox/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/renzoreyn/ShulkerBox/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/renzoreyn/ShulkerBox/releases/tag/v1.0.0
