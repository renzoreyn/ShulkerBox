<p align="center">
  <img src="https://static.wikia.nocookie.net/minecraft-mob/images/d/d1/150px-Shulker_Open.png" width="72" alt="Shulker Box" />
</p>

<h1 align="center">Shulker Box</h1>

<p align="center">
  <strong>Portable backup & restore for Windows when C:\ is wiped every reboot.</strong>
</p>

<p align="center">
  Pack Chrome, Telegram, Cursor, VS Code, SSH, Git, wallpapers, themes, and locale settings onto a persistent drive — then unpack after the wipe.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows-0078D6?style=flat-square" alt="Windows" />
  <img src="https://img.shields.io/badge/python-3.10+-3776AB?style=flat-square" alt="Python" />
  <img src="https://img.shields.io/badge/license-Proprietary-red?style=flat-square" alt="Proprietary" />
</p>

---

## What it does

Shulker Box copies selected user data from **C:\** into a local backup folder (default: `backup/latest` under the install path). After each session reset, **Unpack** restores it.

The interface is a Minecraft-style **shulker chest**: each slot is an app or setting you can include or exclude from the next pack (`enabled.json`).

---

## Stack

| Layer | Technology |
|-------|------------|
| Runtime | Python 3.10+ |
| Backup engine | `robocopy`, `reg`, PowerShell |
| Desktop shell | Microsoft Edge / Google Chrome (app window) |
| UI | HTML · CSS · JavaScript |
| Motion | GSAP |
| Icons | Lucide + pixel app sprites |
| Chest title | Press Start 2P (OFL, downloaded on install) |
| Images | Pillow |

---

## Install

1. Clone this repository (private access only).
2. Place the folder on a drive that survives reboots (e.g. `D:\ShulkerBox`).
3. Run:

```bat
install.bat
```

4. Launch:

```bat
run-gui.bat
```

`install.bat` installs Python dependencies, downloads UI libraries (GSAP, Lucide), fonts, icons, and the shulker favicon.

Copy `enabled.json.example` to `enabled.json` on first run if needed.

---

## Usage

| When | Action |
|------|--------|
| PC is configured how you want it | **Pack Items** |
| After C:\ was wiped | **Unpack** |

CLI: `python launch.py backup` · `python launch.py restore` · `python launch.py gui`

---

## License

**Proprietary / closed source.** All rights reserved. No redistribution, modification, or commercial use without permission from the author.

See [LICENSE](LICENSE).

---

<p align="center">
  <sub>© renzoreyn · Private repository</sub>
</p>
