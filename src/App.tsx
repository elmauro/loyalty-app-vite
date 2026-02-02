import AppRoutes from './routes/AppRoutes';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

function App() {
  return (
    <TooltipProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        richColors
        visibleToasts={5}
        gap={16}
        expand
      />
    </TooltipProvider>
  );
}

export default App;
