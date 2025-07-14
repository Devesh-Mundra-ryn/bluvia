
import { NavigationProvider } from './context/NavigationContext';
import { MetalDataProvider } from './context/MetalDataContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './hooks/useAuth';
import AppLayout from './components/Layout/AppLayout';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationProvider>
          <MetalDataProvider>
            <AppLayout />
          </MetalDataProvider>
        </NavigationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
