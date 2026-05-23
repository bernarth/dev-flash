export interface AppSettings {
  hardInterval: number;
  goodInterval: number;
  easyInterval: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  hardInterval: 1,
  goodInterval: 3,
  easyInterval: 5,
};
