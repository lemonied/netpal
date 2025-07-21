import SidePanel from './views/SidePanel';
import { createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme({
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
  typography: {
    body1: {
      fontSize: 14,
    },
  },
});

function App() {

  return (
    <>
      <ThemeProvider theme={theme}>
        <SidePanel />
      </ThemeProvider>
    </>
  );
}

export default App;
