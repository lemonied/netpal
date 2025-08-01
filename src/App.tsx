import SidePanel from './views/SidePanel';
import { createTheme, GlobalStyles, ThemeProvider } from '@mui/material';

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
      <GlobalStyles
        styles={{
          html: { margin: 0, padding: 0 },
          body: { margin: 0, padding: 0 },
        }}
      />
      <ThemeProvider theme={theme}>
        <SidePanel />
      </ThemeProvider>
    </>
  );
}

export default App;
