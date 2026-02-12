import { Settings2 } from 'lucide-react';

export default function ProgramAdministration() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Settings2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administración del Programa</h1>
          <p className="text-muted-foreground">Gestiona la configuración del programa de lealtad</p>
        </div>
      </div>
      <p className="text-muted-foreground">Contenido en desarrollo.</p>
    </div>
  );
}
