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
