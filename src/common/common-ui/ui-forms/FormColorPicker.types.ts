

export interface ColorPickerProps {

  visible: boolean;

  onClose: () => void;

  onSelectColor: (color: string) => void;

  initialColor?: string;
}
