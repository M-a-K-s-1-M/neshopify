
import { Router } from './providers/router'

import { registerSW } from 'virtual:pwa-register'
import { ThemeProvider } from './providers/theme.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

registerSW({ immediate: true });

const queryClient = new QueryClient();


function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
