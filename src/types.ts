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

export type FoundSave = {
  path: string;
  file: string;
  inspection: SaveInspection;
};

export type TransferReport = {
  stamp: string;
  source_file: string;
  target_slot: string;
  source_sha256: string;
  prepared_sha256: string;
  backup_dir: string;
  prepared_path: string;
  status: string;
};
