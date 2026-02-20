import { useState, useEffect, useCallback } from 'react';
import { ProgramConfigForm } from '@/components/program/ProgramConfigForm';
import { TenantsManager } from '@/components/program/TenantsManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Building2, Loader2 } from 'lucide-react';
import { Program, Tenant } from '@/types/program';
import { fetchProgram, updateProgram } from '@/services/programService';
import { fetchTenants } from '@/services/tenantService';

export default function ProgramAdministration() {
  const [program, setProgram] = useState<Program | null>(null);
  const [programLoading, setProgramLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);

  const loadTenants = useCallback(async () => {
    setTenantsLoading(true);
    try {
      const list = await fetchTenants();
      setTenants(list);
    } catch {
      setTenants([]);
    } finally {
      setTenantsLoading(false);
    }
  }, []);

  const loadProgram = useCallback(async () => {
    setProgramLoading(true);
    try {
      const data = await fetchProgram();
      setProgram(data);
    } catch {
      setProgram(null);
    } finally {
      setProgramLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  useEffect(() => {
    loadProgram();
  }, [loadProgram]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administración del Programa</h1>
          <p className="text-muted-foreground">
            Gestiona la configuración y aliados
          </p>
        </div>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config" className="gap-2">
            <Settings className="h-4 w-4" /> Configuración
          </TabsTrigger>
          <TabsTrigger value="tenants" className="gap-2">
            <Building2 className="h-4 w-4" /> Aliados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          {programLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : program ? (
            <ProgramConfigForm
              program={program}
              onSave={async (updated) => {
                await updateProgram(updated);
                setProgram(updated);
              }}
            />
          ) : (
            <p className="text-muted-foreground py-8">No se pudo cargar la configuración del programa.</p>
          )}
        </TabsContent>

        <TabsContent value="tenants">
          {tenantsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TenantsManager tenants={tenants} onTenantsChange={setTenants} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
