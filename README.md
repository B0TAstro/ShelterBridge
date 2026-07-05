# ShelterBridge

**ShelterBridge** is an unofficial Fallout Shelter save transfer tool between PC/Steam and mobile, starting with iPhone.

> This project is not affiliated with, endorsed by, sponsored by, or approved by Bethesda, ZeniMax, Microsoft, Apple, Google, Steam, or any platform holder.

---

## Project status

ShelterBridge is currently in the planning / early development stage.

The first goal is to build a small, safe, focused desktop app that can import a Fallout Shelter save file, inspect it, back it up, and prepare it for transfer to an iPhone.

---

## Why ShelterBridge exists

Fallout Shelter is available on many platforms, but save synchronization is split by ecosystem.

Some cases are already handled well by official cloud systems:

- Steam PC to Steam PC / Steam Deck works through Steam Cloud.
- iPhone to iPad / iOS devices works through the mobile cloud system.
- Android to Android works through the mobile cloud system.
- Xbox, PlayStation, Nintendo Switch, and other platforms have their own separate save systems.

The gap ShelterBridge focuses on is:

```text
PC / Steam / local save file
-> mobile device
```

and later:

```text
mobile device
-> PC / Steam / local backup
```

ShelterBridge is not trying to replace Steam Cloud, iCloud, Google Play cloud saves, Xbox cloud saves, or any official sync system. It is meant to help with the specific transfer paths that are not officially bridged.

---

## Core idea

ShelterBridge is a local desktop app that helps users:

- import Fallout Shelter `.sav` files;
- detect local Steam saves on Windows;
- inspect basic Vault information;
- create automatic backups;
- choose a target Vault slot;
- prepare the correct `Vault1.sav`, `Vault2.sav`, or `Vault3.sav` file;
- guide the user through mobile transfer steps;
- later, automate parts of the USB transfer when possible.

The app should always behave like a safe copy tool, not like a sync engine.

---

## What ShelterBridge is

ShelterBridge is:

- an unofficial save backup tool;
- a save inspection tool;
- a transfer preparation tool;
- a desktop app for macOS and Windows;
- a local-first utility;
- focused on PC/Steam to mobile transfers.

---

## What ShelterBridge is not

ShelterBridge is not:

- an official Fallout Shelter cross-save system;
- a Steam Cloud replacement;
- a Bethesda service;
- a save editor;
- a cheat tool;
- an achievement unlocker;
- a console save manager;
- a permanent background sync service;
- a cloud storage platform.

The goal is not to modify saves. The goal is to safely back them up, inspect them, rename them when needed, and prepare them for transfer.

---

## Save files and slots

Fallout Shelter save slots are usually stored as:

```text
Vault1.sav
Vault2.sav
Vault3.sav
```

Backup files may also exist as:

```text
Vault1.sav.bkp
Vault2.sav.bkp
Vault3.sav.bkp
```

Each `VaultX.sav` generally represents one in-game Vault slot.

ShelterBridge should allow users to choose the target slot. For example:

```text
Source file: Vault1.sav
Target slot: Slot 2
Prepared file: Vault2.sav
```

This allows a user to move a Vault into another slot without manually renaming files.

---

## Windows Steam save location

On Windows, the Steam version usually stores saves in:

```text
%LOCALAPPDATA%\FalloutShelter
```

which usually resolves to:

```text
C:\Users\<USERNAME>\AppData\Local\FalloutShelter
```

ShelterBridge should scan this folder and look for:

```text
Vault1.sav
Vault1.sav.bkp
Vault2.sav
Vault2.sav.bkp
Vault3.sav
Vault3.sav.bkp
```

When importing saves back into Steam, ShelterBridge should warn users about possible Steam Cloud conflicts.

---

## Main safety rule

```text
Never delete the original save.
```

A transfer must always be a copy operation, never a move operation.

Before replacing or exporting anything, ShelterBridge should:

1. Verify that the source file exists.
2. Check that the file looks like a Fallout Shelter save.
3. Calculate a hash of the source file.
4. Create a local backup folder.
5. Backup the destination save if one already exists.
6. Copy the new save.
7. Verify the copied file.
8. Write a transfer report.
9. Let the user open the backup folder.

This is important because users may have 100, 200, or 500+ hours in a Vault.

---

## Example backup structure

```text
ShelterBridge Backups/
  2026-07-02_18-42-10/
    source_Vault1.sav
    previous_destination_Vault1.sav
    previous_destination_Vault1.sav.bkp
    incoming_Vault1.sav
    transfer_report.json
```

Example transfer report:

```json
{
  "date": "2026-07-02T18:42:10+02:00",
  "sourceFile": "Vault1.sav",
  "targetSlot": "Vault2.sav",
  "sourceHash": "example-source-sha256",
  "targetHash": "example-target-sha256",
  "status": "success"
}
```

---

## Planned platforms

ShelterBridge should be a real downloadable desktop app, not a website.

A website alone cannot reliably:

- scan local Steam save folders;
- create safe backups;
- verify hashes;
- prepare files in the correct format;
- interact with connected devices;
- guide or automate USB-based transfers.

Planned desktop targets:

```text
macOS
Windows
```

Potential later target:

```text
Linux
```

Steam Deck is not a priority because Steam Cloud already handles Steam-to-Steam sync.

---

## Planned tech stack

The preferred stack is:

```text
Frontend: React + TypeScript
Desktop shell: Tauri
System layer: Rust
```

This gives the project one shared codebase with separate builds for macOS and Windows.

Planned builds:

```text
macOS: .dmg / .app
Windows: .exe / .msi
```

---

## App structure

Possible architecture:

```text
ShelterBridge
|
|-- Frontend
|   |-- React
|   |-- TypeScript
|   |-- Vault cards
|   |-- transfer modals
|   |-- backup history
|   |-- iPhone assistant
|   `-- app settings
|
|-- Tauri backend
|   |-- file scanner
|   |-- save parser
|   |-- hash checker
|   |-- backup manager
|   |-- slot manager
|   |-- transfer manager
|   `-- device bridge, later
|
`-- Local app data
    |-- backups
    |-- transfer history
    |-- logs
    `-- preferences
```

Possible modules:

```text
save-scanner
save-parser
backup-manager
slot-manager
transfer-manager
iphone-assistant
android-assistant
history-store
```

---

## First MVP: macOS to iPhone assisted transfer

The first useful version should be:

```text
macOS app
-> imported Vault*.sav file
-> prepared iPhone transfer
```

This does not require Fallout Shelter to be installed on the Mac.

Expected flow:

```text
User gets a Vault*.sav file from a PC, Steam Deck, backup, USB drive, AirDrop, or cloud storage.
-> User imports that file into ShelterBridge on Mac.
-> ShelterBridge validates and inspects it.
-> User chooses the target iPhone slot.
-> ShelterBridge prepares Vault1.sav, Vault2.sav, or Vault3.sav.
-> ShelterBridge creates a backup.
-> ShelterBridge guides the user through the iPhone transfer process.
```

The first iPhone transfer mode should be assisted, not fully automatic.

---

## iPhone assisted mode

The first iPhone flow should guide the user instead of trying to automate everything.

Example macOS flow:

```text
1. Connect the iPhone to the Mac.
2. Unlock the iPhone.
3. Tap "Trust This Computer" if prompted.
4. Fully close Fallout Shelter on the iPhone.
5. Open Finder.
6. Select the connected iPhone.
7. Open the file sharing section.
8. Select Fallout Shelter.
9. Copy the prepared Vault*.sav file into the app documents.
10. Launch Fallout Shelter on the iPhone and check the Vault slot.
```

On Windows, the equivalent flow should use Apple Devices or iTunes, depending on the user's setup.

---

## Future iPhone USB mode

Later, ShelterBridge may try to automate part of the iPhone transfer through USB.

Possible direction:

```text
libimobiledevice
AFC access
iOS File Sharing app documents
```

This must be treated as experimental because it may depend on:

```text
iOS version
device trust state
whether the phone is unlocked
Apple drivers on Windows
File Sharing availability
Fallout Shelter app behavior
iOS sandbox restrictions
```

If USB automation fails, the app should always fall back to assisted mode.

---

## Windows Steam to iPhone

The second major milestone should support Windows Steam saves.

Expected flow:

```text
Launch ShelterBridge on Windows.
-> Scan %LOCALAPPDATA%\FalloutShelter.
-> Detect Vault1.sav, Vault2.sav, and Vault3.sav.
-> Show Vault preview cards.
-> User selects a Vault.
-> User chooses iPhone as destination.
-> User chooses the target iPhone slot.
-> ShelterBridge creates backups.
-> ShelterBridge prepares the transfer file.
-> User completes the transfer through the guided iPhone flow.
```

This is likely the most important real-world use case.

---

## iPhone to desktop backup

A later feature should allow users to preserve mobile saves locally.

Expected flow:

```text
Export Vault*.sav from iPhone using Finder, Apple Devices, iTunes, or another file access tool.
-> Import that file into ShelterBridge.
-> ShelterBridge analyzes it.
-> ShelterBridge stores it as a local backup.
-> Optional: prepare it for Steam Windows.
```

When preparing an iPhone save for Steam, the app should warn the user about:

```text
Steam Cloud conflicts
possible version compatibility issues
no guarantee that achievements will unlock automatically
```

ShelterBridge should not market itself as an achievement tool.

---

## Android support, later

Android support should come after the iPhone and Windows Steam flows.

Possible Android flow:

```text
Connect Android device.
-> Enable USB debugging.
-> Authorize the computer.
-> ShelterBridge checks ADB access.
-> ShelterBridge searches for Fallout Shelter save files.
-> ShelterBridge backs up existing destination files.
-> ShelterBridge copies Vault*.sav if access is available.
```

Android support should probably start with an assisted mode, then add ADB automation later.

---

## Save inspection

ShelterBridge should display useful information for each imported or detected Vault.

Example Vault card:

```text
Vault 777
Slot: Vault1.sav
Dwellers: 143
Caps: 58,420
Food: 12,300
Water: 10,900
Power: 14,700
Stimpaks: 85
RadAway: 42
Lunchboxes: 3
Mr. Handy: 2
Last modified: 2026-07-02 18:42
File size: 2.8 MB
Hash: a8f1...93c2
```

The first version should only display fields that are reliably parsed.

Experimental fields:

```text
total play time
exact quest state
exact achievement progress
full inventory details
version compatibility checks
```

---

## User flow

Main flow:

```text
Open ShelterBridge
-> choose a source
-> scan or import save
-> inspect detected Vaults
-> select a Vault
-> choose destination
-> choose target slot
-> create backup
-> prepare transfer
-> guide user through mobile transfer
-> record completion
```

Source options:

```text
Scan this computer
Import .sav file
Import save folder
Open previous backup
```

Initial destination options:

```text
iPhone / iPad
Local folder
Backup archive
```

Future destination options:

```text
Android
Steam folder
USB-connected iPhone
USB-connected Android
```

---

## Roadmap

### Phase 0 - Technical prototype

Goal: prove that ShelterBridge can import and inspect a save file.

Features:

```text
- manual Vault*.sav import
- file validation
- SHA-256 hashing
- basic metadata extraction
- renamed export as Vault1.sav, Vault2.sav, or Vault3.sav
```

Success criteria:

```text
A real save can be imported and basic Vault information is displayed.
```

### Phase 1 - macOS MVP

Goal: build the first usable app.

Features:

```text
- macOS desktop app
- drag and drop .sav import
- Vault preview card
- target slot selection
- safe local backup
- prepared iPhone file export
- Finder-based transfer guide
- local transfer history
```

Success criteria:

```text
A user can prepare a Steam save for iPhone without modifying the original file.
```

### Phase 2 - Windows Steam support

Goal: support the main PC use case.

Features:

```text
- Windows desktop app
- automatic Steam save scan
- manual .sav import
- Vault preview cards
- Steam Cloud warning
- iPhone transfer preparation
- Apple Devices / iTunes guided transfer
```

Success criteria:

```text
A Windows Steam player can select a local Vault and prepare a safe copy for iPhone.
```

### Phase 3 - iPhone to desktop backup

Goal: let users preserve mobile saves locally.

Features:

```text
- import a Vault*.sav exported from iPhone
- inspect the save
- store it in local backups
- optionally prepare it for Steam Windows
- show compatibility and Steam Cloud warnings
```

Success criteria:

```text
A user can back up an iPhone Vault on desktop.
```

### Phase 4 - iPhone USB experimental mode

Goal: reduce manual transfer steps.

Features:

```text
- detect connected iPhone
- check trust and unlock state
- attempt to access File Sharing app documents
- read or write Vault*.sav when possible
- fall back to assisted mode when unavailable
```

Success criteria:

```text
ShelterBridge can automate part of the iPhone transfer on supported setups.
```

### Phase 5 - Android support

Goal: support Android transfers.

Features:

```text
- Android assisted mode
- optional ADB support
- device detection
- destination backup
- save copy when access is available
- manual fallback when access is blocked
```

Success criteria:

```text
A user can transfer or back up an Android Vault safely.
```

---

## Design direction

ShelterBridge can have a retro bunker / terminal-inspired interface, but it should not use official Fallout, Vault Boy, Pip-Boy, Vault-Tec, Bethesda, or ZeniMax assets.

Good design direction:

```text
retro terminal UI
CRT scanlines
green phosphor text
amber warning panels
industrial buttons
fictional bunker branding
custom original mascot
file transfer animations
```

Example UI messages:

```text
Scanning vault data...
Creating backup...
Preparing transfer capsule...
Verifying checksum...
Transfer complete, Overseer.
```

The app should feel familiar to fans of retro-futuristic bunker interfaces without copying protected assets.

---

## Branding notes

Recommended wording:

```text
ShelterBridge is an unofficial save backup and transfer tool compatible with Fallout Shelter save files.
```

Avoid wording that sounds official.

Avoid using:

```text
official Fallout logos
Vault Boy artwork
Pip-Boy artwork
Vault-Tec branding
Bethesda icons
game-extracted UI assets
```

---

## Privacy

ShelterBridge should be local-first.

The app should not require:

```text
user accounts
cloud uploads
remote servers
online authentication
tracking
```

Save files should stay on the user's machine unless the user explicitly exports or copies them somewhere else.

---

## MVP definition

The first MVP is:

```text
ShelterBridge macOS Alpha
```

It should include:

```text
- import a Vault*.sav file
- validate the file
- display basic Vault information
- choose target iPhone slot
- generate the correct Vault1.sav, Vault2.sav, or Vault3.sav file
- create a local backup
- show a guided Finder transfer flow
- keep a local transfer history
- never modify or delete the original save
```

This MVP is intentionally small, specific, and useful.

---

## Disclaimer

ShelterBridge is an unofficial community tool intended for personal backup and transfer of user-owned save files.

Always make backups before replacing any save file.

Use at your own risk.
