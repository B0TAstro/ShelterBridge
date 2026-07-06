# AGENTS.md — how to work in this repo

Guidance for anyone (human or AI agent) contributing to **ShelterBridge**, an
unofficial, local-first desktop tool to back up, inspect, and prepare Fallout
Shelter saves for transfer (PC/Steam → mobile, iPhone first).

Read `README.md` for the full product vision and `DESIGN.md` for the UI/UX
direction. This file is about **how we build**.

---

## 0. The golden rule (non-negotiable)

> **Never delete or modify an original save.** A transfer is always a _copy_,
> never a move. Before writing anything, back up the destination first.

Any code path that touches a `.sav` file must:

1. verify the source exists and looks like a Fallout Shelter save;
2. hash the source (SHA-256);
3. create a backup folder and back up the destination if one exists;
4. copy (never move) the prepared file;
5. verify the copy;
6. write a transfer report.

If you can't guarantee the original is untouched, don't ship the code.

---

## 1. Tech stack & architecture

```text
Frontend  : React + TypeScript + Vite   (the UI — "dumb" on purpose)
Desktop   : Tauri v2                     (the shell that hosts the webview)
Backend   : Rust (src-tauri/)            (all sensitive logic)
```

**Front/back split — the most important convention here:**

- **Rust owns everything sensitive**: file system access, decryption, hashing,
  backups, slot preparation, transfer. This is where the golden rule lives.
- **The React front is intentionally "dumb"**: it renders UI and calls Rust. It
  must not implement file/crypto/backup logic itself.
- They talk over Tauri IPC:
  - **Commands** (`#[tauri::command]` + `invoke("name", args)`) — request/response.
  - **Events** (`emit` / `listen`) — Rust → front push (e.g. progress bars).

There is no HTTP server and no open port. It's local IPC.

---

## 2. Repo structure

```text
src/                 React + TS frontend
  components/         reusable UI (see DESIGN.md §7)
  screens/            top-level screens (see DESIGN.md §8)
  theme/              design tokens / global styles
src-tauri/           Rust backend (Tauri app)
  src/lib.rs          command registration + app setup
  src/main.rs         binary entry point
  tauri.conf.json     app config (window, bundle, identifier)
  Cargo.toml          Rust dependencies
dev-saves/           local real saves for testing — GITIGNORED, never commit
DESIGN.md            design direction
README.md            product vision & roadmap
```

---

## 3. Commands

```bash
pnpm install          # install frontend deps (run it yourself)
pnpm tauri dev        # run the FULL app (front + Rust) in a native window
pnpm dev              # front only, in a browser — invoke() does NOT work here
pnpm build            # typecheck + build the frontend bundle
pnpm tauri build      # produce the desktop app (.dmg / .app / .msi / .exe)
```

Quality gates:

```bash
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint .
pnpm lint:fix         # eslint . --fix
pnpm format           # prettier --write .
pnpm format:check     # prettier --check .   (used in CI)
pnpm rust:fmt         # cargo fmt (Rust)
pnpm rust:fmt:check   # cargo fmt --check     (used in CI)
pnpm rust:lint        # cargo clippy -D warnings
```

---

## 4. Coding conventions

**General**

- Simple, modern, maintainable. Minimal changes. No unrequested refactors, no
  unnecessary abstractions.
- Match the style of surrounding code (naming, comment density, idioms).

**TypeScript / React**

- TypeScript everywhere (`.ts` / `.tsx`). Type the data crossing the Rust
  boundary — that contract catches bugs at compile time.
- Functional components + hooks. Keep components small and focused.
- No business logic in the front; call a Rust command instead.

**Rust**

- Keep logic in small, testable modules (e.g. `save`, `backup`, `slot`).
- Return typed results to the front with `serde` (derive `Serialize`).
- Handle errors explicitly (`Result`, no `unwrap()` on fallible I/O in real paths).
- **Unit-test the safety invariants** (original untouched, backup created).

**Before committing** run: `pnpm lint:fix` → `pnpm format` → `pnpm typecheck`,
and for Rust changes `pnpm rust:fmt` → `pnpm rust:lint`. CI enforces these.

---

## 5. Commits & branching

- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `ci:`, `refactor:`,
  `test:`. One logical change per commit; split when it helps review.
- The maintainer reviews and commits himself — propose clear messages, don't
  auto-commit.
- Don't commit on top of unrelated changes; keep steps isolated.

---

## 6. Security & privacy

- **Local-first.** No accounts, no cloud upload, no remote servers, no telemetry.
- Real save files never leave the machine unless the user explicitly exports them.
- **Never commit real saves** — `dev-saves/` and backup folders are gitignored.
- pnpm blocks dependency build scripts by default; allow only trusted ones
  explicitly in `pnpm-workspace.yaml`.
- No official Fallout/Bethesda/Vault-Tec/Pip-Boy assets, ever (see `DESIGN.md`).

---

## 7. For junior devs (Rust / Tauri crash notes)

New to Rust/Tauri? Keep these mental models handy.

**The bridge**

- `invoke("read_save", { path })` in TS → calls `#[tauri::command] fn read_save`
  in Rust, returns a `Promise`. Think "async function that runs in Rust".
- For progress/streaming, Rust does `app.emit("backup_progress", pct)` and the
  front does `listen("backup_progress", cb)`. That's the pub/sub side.

**Where code goes**

- Touching files, hashing, crypto, backups? → **Rust** (`src-tauri/src/`).
- Rendering, state, screen flow? → **React** (`src/`).

**Running things**

- Always use `pnpm tauri dev` (full app). `pnpm dev` alone is front-only and the
  Rust bridge won't exist.
- First Rust compile is slow (minutes); later builds are incremental and fast.

**Rust survival kit**

- `cargo add <crate>` adds a dependency (run inside `src-tauri/`).
- `cargo clippy` = your Rust linter; fix its warnings, they're usually right.
- `Result<T, E>` + `?` is how Rust does error propagation — prefer it over panics.
- `serde` turns Rust structs into JSON for the front (`#[derive(Serialize)]`).

**Save format note**

- Fallout Shelter `.sav` files are AES-encrypted, base64-wrapped JSON — not plain
  text. Inspecting a save means _decrypt → parse JSON_ (done in Rust). Validate
  this on a real save from `dev-saves/` before building UI on top of it.

When in doubt: keep it simple, keep the original save safe, and ask.
