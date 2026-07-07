import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

type VaultInfo = {
  vault_name: string;
  app_version: string | null;
  dweller_count: number;
  caps: number;
  food: number;
  water: number;
  power: number;
  stimpaks: number;
  radaway: number;
  nuka_quantum: number;
  mr_handy: number;
  lunchboxes: number;
};

type SaveInspection = {
  sha256: string;
  vault: VaultInfo;
};

function App() {
  const [inspection, setInspection] = useState<SaveInspection | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function chooseSave() {
    setError(null);
    const path = await open({
      multiple: false,
      filters: [{ name: "Fallout Shelter save", extensions: ["sav"] }],
    });
    if (typeof path !== "string") return; // user cancelled

    try {
      setInspection(await invoke<SaveInspection>("read_save", { path }));
    } catch (e) {
      setInspection(null);
      setError(String(e));
    }
  }

  return (
    <main className="container">
      <h1>ShelterBridge</h1>
      <p className="tagline">
        Import a Vault*.sav file to inspect it. Your original file is never modified.
      </p>
      <button onClick={chooseSave}>Choose a save file…</button>

      {error && <p className="error">Error: {error}</p>}

      {inspection && (
        <section className="vault">
          <h2>Vault {inspection.vault.vault_name}</h2>
          <ul>
            <li>Dwellers: {inspection.vault.dweller_count}</li>
            <li>Caps: {inspection.vault.caps.toLocaleString()}</li>
            <li>Food: {inspection.vault.food.toLocaleString()}</li>
            <li>Water: {inspection.vault.water.toLocaleString()}</li>
            <li>Power: {inspection.vault.power.toLocaleString()}</li>
            <li>Stimpaks: {inspection.vault.stimpaks}</li>
            <li>RadAway: {inspection.vault.radaway}</li>
            <li>Nuka-Cola Quantum: {inspection.vault.nuka_quantum}</li>
            <li>Mr. Handy: {inspection.vault.mr_handy}</li>
            <li>Lunchboxes: {inspection.vault.lunchboxes}</li>
            {inspection.vault.app_version && <li>Game version: {inspection.vault.app_version}</li>}
          </ul>
          <p className="hash">SHA-256: {inspection.sha256}</p>
        </section>
      )}
    </main>
  );
}

export default App;
