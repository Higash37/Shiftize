import React from "react";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Box } from "@mui/material";
import { UnifiedTimePickerProps } from "./types";

/**
 * UnifiedTimePicker - 統一された時間選択コンポーネント
 *
 * Web向けのMaterial UI TimePickerを使用した時間選択コンポーネントです。
 * ウェブ環境でのみ利用可能です。
 */
export default function UnifiedTimePicker({
  value,
  onChange,
}: UnifiedTimePickerProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          backgroundColor: "#F4F6FA",
          borderRadius: "12px",
          padding: "8px",
          marginBottom: "8px",
        }}
      >
        <TimePicker
          value={value}
          onChange={(newValue) => {
            if (newValue) onChange(newValue);
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              variant: "outlined",
              size: "small",
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
}
