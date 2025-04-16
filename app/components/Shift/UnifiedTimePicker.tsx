// src/components/Shift/UnifiedTimePicker.tsx
import React from "react";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Box } from "@mui/material";

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

export default function UnifiedTimePicker({ value, onChange }: Props) {
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
