import { createTheme } from "@mui/material/styles";


export const createAppTheme = (primaryColor: string = "#1976d2") => {
  return createTheme({
    palette: {
      primary: {
        main: primaryColor,
      },
      secondary: {
        main: "#dc004e",
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 8,
    },
  });
};

const theme = createAppTheme();

export default theme;