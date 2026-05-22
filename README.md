<p align="center">
  <img src="docs/images/logo.png" width="280" alt="Shulker Box logo" />
</p>

<h1 align="center">Shulker Box</h1>

<p align="center">
  <strong>Portable backup & restore for Windows when C:\ gets wiped every reboot.</strong>
</p>

<p align="center">
  <a href="https://github.com/renzoreyn/ShulkerBox/releases"><img src="https://img.shields.io/github/v/release/renzoreyn/ShulkerBox?style=flat-square&label=download" alt="Download release" /></a>
  <img src="https://img.shields.io/badge/platform-Windows-0078D6?style=flat-square" alt="Windows" />
  <img src="https://img.shields.io/badge/license-Proprietary-red?style=flat-square" alt="Proprietary" />
</p>

<p align="center">
  Pack Chrome, Telegram, Cursor, VS Code, SSH, Git, wallpapers, themes, and locale stuff onto a drive that survives the wipe. Unpack when you're back on a fresh C:\.
</p>

<p align="center">
  <img src="docs/images/screenshot.png" alt="Shulker Box app screenshot" width="620" />
</p>

---

## What it does

Shulker Box copies the user data you pick from **C:\** into `backup/latest` next to the app. After the lab PC resets, hit **Unpack** and your stuff comes back.

Each app is a tile in the UI. **One click** toggles whether that item is included in the next pack. Green border = ON, red = OFF, gold dot = already in the chest. The banner at the top shows when you last packed and how full the chest is.

---

## Quick start (plug and play)

1. Open **[Releases](https://github.com/renzoreyn/ShulkerBox/releases)** and download the latest **windows-portable** zip.
2. Extract the whole folder to a drive that survives reboot, e.g. `D:\ShulkerBox`.
3. Run **ShulkerBox.exe**.

First launch needs internet once (fonts + app icons download). Your backups and settings stay in that folder.

Optional CLI helpers (inside `tools\`):

| File | What it does |
|------|----------------|
| `tools\Pack.bat` | Backup from command line |
| `tools\Unpack.bat` | Restore from command line |

---

## Typical workflow

| When | Do this |
|------|---------|
| PC is set up how you like it | Turn ON the apps you want, then **Pack Items** |
| After C:\ was wiped | **Unpack** |

Tip: use **Scan** before packing if something is still running and blocking a copy.

---

## What's backed up

- Browser profiles (Chrome)
- Telegram Desktop
- Cursor + VS Code user data
- SSH keys and config
- Git config
- Wallpapers
- Registry slices for theme, colors, keyboard, locale, taskbar

Exact paths and toggles live in `enabled.json` next to the exe.

---

## Under the hood (high level)

No source code in this repo. Roughly how it works:

- **Pack** uses `robocopy` for folders, `reg export` for registry hives, and PowerShell for language lists.
- **Unpack** restores into the same paths on a fresh C:\.
- The GUI is a small local web UI in an Edge app window (no Python install needed on the target PC).

<details>
<summary>Example: export one registry key before reboot</summary>

```bat
reg export "HKCU\Software\Microsoft\Windows\CurrentVersion\Themes" "%BACKUP%\registry\themes.reg" /y
```

</details>

<details>
<summary>Example: restore a folder with robocopy</summary>

```bat
robocopy "%BACKUP%\folders\chrome" "%LOCALAPPDATA%\Google\Chrome\User Data" /E /R:2 /W:3
```

</details>

---

## FAQ

**Do I need Python?**  
No. Grab the portable release and run the exe.

**Where does my backup live?**  
`backup\latest\` inside the folder you extracted.

**Can I move the folder?**  
Yes, as long as it stays on a drive that is not wiped (usually D:\ or similar).

---

## License

**Proprietary / closed source.** All rights reserved. No redistribution without permission.

See [LICENSE](LICENSE).

---

<p align="center"><sub>made by <a href="https://github.com/renzoreyn">@renzoreyn</a></sub></p>
