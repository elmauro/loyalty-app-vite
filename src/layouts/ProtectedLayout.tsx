import { Outlet } from 'react-router-dom';
import TopBar from '../components/TopBar/TopBar';

export default function ProtectedLayout() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container py-6 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
