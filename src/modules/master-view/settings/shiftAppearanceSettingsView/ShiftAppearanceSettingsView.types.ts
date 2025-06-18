export type ShiftAppSettings = {
  darkMode: boolean;
};

export interface ShiftAppearanceSettingsViewProps {
  settings: ShiftAppSettings;
  loading: boolean;
  onChange: (settings: ShiftAppSettings) => void;
  onSave: () => void;
}
