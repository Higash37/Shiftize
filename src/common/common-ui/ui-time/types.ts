import { CSSProperties } from "react";

export type TimePickerBaseProps = {
  value: Date;
  onChange: (date: Date) => void;
};

export type TimePickerModalProps = TimePickerBaseProps & {
  visible: boolean;
  onClose: () => void;
  isWide?: boolean;
};

export type WebTimeSelectProps = TimePickerBaseProps & {
  position?: "left" | "right";
};

export type TimeOption = {
  value: string;
  label: string;
  date: Date;
};

export const timePickerStyles: Record<string, CSSProperties> = {
  select: {
    WebkitAppearance: "none",
    appearance: "none",
    backgroundColor: "#F8F9FB",
    border: "1px solid #E5E7EB",
    borderRadius: "12px",
    padding: "14px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    width: "100%",
    minWidth: "120px",
    maxWidth: "160px",
    cursor: "pointer",
    textAlign: "center",
    userSelect: "none",
    WebkitUserSelect: "none",
    outlineStyle: "none",
  },
};
