import React from "react";
import { Modal, Box, Button, Typography } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ja } from "date-fns/locale";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { StyleSheet } from "react-native";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4A90E2",
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#F8F9FB",
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          height: "56px",
          minWidth: "100px",
          "&:hover": {
            backgroundColor: "#F8F9FB",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        },
        input: {
          padding: "16px",
          fontSize: "18px",
          fontWeight: 600,
          color: "#333",
          textAlign: "center",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            backgroundColor: "#F8F9FB",
          },
        },
      },
    },
  },
});

const styles = StyleSheet.create({
  modal: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
});

type Props = {
  visible: boolean;
  onClose: () => void;
  value: Date;
  onChange: (date: Date) => void;
  isWide?: boolean;
};

export const TimePickerModal: React.FC<Props> = ({
  visible,
  onClose,
  value,
  onChange,
  isWide = false,
}) => {
  const handleChange = (date: Date | null) => {
    if (date) {
      onChange(date);
      onClose();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Modal
        open={visible}
        onClose={onClose}
        aria-labelledby="time-picker-modal"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(0, 0, 0, 0.5)",
          ...styles.modal,
        }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 4,
            width: isWide ? "auto" : 300,
            maxWidth: 400,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
              borderBottom: 1,
              borderColor: "divider",
              pb: 1,
            }}
          >
            <Button onClick={onClose} color="inherit">
              キャンセル
            </Button>
            <Button onClick={onClose} color="primary">
              完了
            </Button>
          </Box>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
            <TimePicker
              value={value}
              onChange={handleChange}
              format="HH:mm"
              ampm={false}
              localeText={{
                okButtonLabel: "完了",
                cancelButtonLabel: "キャンセル",
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                  size: "small",
                  sx: {
                    width: "100%",
                    "& .MuiInputBase-root": {
                      backgroundColor: "#F8F9FB",
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      </Modal>
    </ThemeProvider>
  );
};
