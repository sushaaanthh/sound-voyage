import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/sonner';
import { GameSessionProvider } from './context/GameSessionContext';

export default function App() {
  return (
    <ThemeProvider>
      <GameSessionProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors />
      </GameSessionProvider>
    </ThemeProvider>
  );
}