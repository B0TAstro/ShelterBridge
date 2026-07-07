export type VaultInfo = {
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

export type SaveInspection = {
  sha256: string;
  vault: VaultInfo;
};
