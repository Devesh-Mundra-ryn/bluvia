import React from 'react';
import AppLayout from './components/Layout/AppLayout';
import { MetalDataProvider } from './context/MetalDataContext';
import { NavigationProvider } from './context/NavigationContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <MetalDataProvider>
          <AppLayout />
        </MetalDataProvider>
      </NavigationProvider>
    </ThemeProvider>
  );
}

export default App;