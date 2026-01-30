import AppRoutes from './routes/AppRoutes';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

function App() {
  return (
    <TooltipProvider>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </TooltipProvider>
  );
}

export default App;
