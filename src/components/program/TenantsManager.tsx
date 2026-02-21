import { useState } from 'react';
import { Tenant } from '@/types/program';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Building2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchTenants,
  createTenant,
  updateTenant,
  deactivateTenant,
  type CreateTenantInput,
  type UpdateTenantInput,
} from '@/services/tenantService';

interface Props {
  tenants: Tenant[];
  onTenantsChange: (tenants: Tenant[]) => void;
}

const emptyTenant: Omit<Tenant, 'tenantId'> = {
  name: '',
  tenantCode: '',
  identification: '',
  identificationTypeId: '3',
  conversionValue: 0,
  pointsMoneyRatio: 0,
  periodId: 3,
  periodValue: 6,
  isdeleted: 0,
};

export function TenantsManager({ tenants, onTenantsChange }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [form, setForm] = useState(emptyTenant);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeTenants = tenants.filter((t) => t.isdeleted === 0);
  const filtered = activeTenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.tenantCode.toLowerCase().includes(search.toLowerCase()) ||
      t.identification.includes(search)
  );

  const openCreate = () => {
    setEditIndex(null);
    setForm(emptyTenant);
    setDialogOpen(true);
  };

  const openEdit = (idx: number) => {
    const tenant = activeTenants[idx];
    setEditIndex(idx);
    setForm(tenant);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.tenantCode.trim() || !form.identification.trim()) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    if (form.conversionValue <= 0 || form.pointsMoneyRatio <= 0) {
      toast.error('Los valores de conversión deben ser mayores a 0');
      return;
    }

    setIsSaving(true);
    try {
      if (editIndex !== null) {
        const tenant = activeTenants[editIndex];
        await updateTenant(tenant.tenantId, {
          name: form.name,
          identification: form.identification,
          isDeleted: 0,
          tenantCode: form.tenantCode,
          conversionValue: form.conversionValue,
          pointsMoneyRatio: form.pointsMoneyRatio,
          periodId: form.periodId,
          periodValue: form.periodValue,
        });
        const list = await fetchTenants();
        onTenantsChange(list);
        toast.success('Aliado actualizado');
      } else {
        const input: CreateTenantInput = {
          name: form.name,
          tenantCode: form.tenantCode,
          identification: form.identification,
          conversionValue: form.conversionValue,
          pointsMoneyRatio: form.pointsMoneyRatio,
          periodId: form.periodId,
          periodValue: form.periodValue,
        };
        const { id } = await createTenant(input);
        const list = await fetchTenants();
        onTenantsChange(list);
        toast.success('Aliado creado');
      }
      setDialogOpen(false);
    } catch {
      // Error ya manejado por interceptor
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteIndex === null) return;
    const tenant = activeTenants[deleteIndex];
    setIsDeleting(true);
    try {
      await deactivateTenant(tenant.tenantId, {
        name: tenant.name,
        identification: tenant.identification,
      });
      const list = await fetchTenants();
      onTenantsChange(list);
      setDeleteIndex(null);
      toast.success('Aliado desactivado');
    } catch {
      // Error ya manejado por interceptor
    } finally {
      setIsDeleting(false);
    }
  };

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle>Aliados (Tenants)</CardTitle>
          <Badge variant="secondary">{activeTenants.length}</Badge>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Aliado
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar aliado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Código</TableHead>
                <TableHead className="hidden md:table-cell">Identificación</TableHead>
                <TableHead className="hidden lg:table-cell">Conversión</TableHead>
                <TableHead className="hidden lg:table-cell">Ratio</TableHead>
                <TableHead className="hidden xl:table-cell">Expiración</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No hay aliados
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t, i) => (
                  <TableRow key={t.tenantId}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{t.tenantCode}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      NIT {t.identification}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{t.conversionValue}</TableCell>
                    <TableCell className="hidden lg:table-cell">{t.pointsMoneyRatio}</TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {t.periodValue} {t.periodId === 1 ? 'min' : t.periodId === 2 ? 'h' : t.periodId === 3 ? 'días' : 'meses'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(i)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteIndex(i)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? 'Editar Aliado' : 'Nuevo Aliado'}</DialogTitle>
            <DialogDescription>
              {editIndex !== null ? 'Modifica los datos del aliado.' : 'Completa los datos para registrar un nuevo aliado.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Código</Label>
              <Input
                value={form.tenantCode}
                onChange={(e) => update('tenantCode', e.target.value)}
                disabled={editIndex !== null}
              />
            </div>
            <div className="space-y-1">
              <Label>NIT</Label>
              <Input value={form.identification} onChange={(e) => update('identification', e.target.value)} placeholder="Identificación tributaria" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Valor de Conversión</Label>
                <Input
                  type="number"
                  value={form.conversionValue}
                  onChange={(e) => update('conversionValue', Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label>Ratio Puntos/Dinero</Label>
                <Input
                  type="number"
                  value={form.pointsMoneyRatio}
                  onChange={(e) => update('pointsMoneyRatio', Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label>Tipo Período Expiración</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={form.periodId}
                  onChange={(e) => update('periodId', Number(e.target.value))}
                >
                  <option value={1}>Minutos</option>
                  <option value={2}>Horas</option>
                  <option value={3}>Días</option>
                  <option value={4}>Meses</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Valor Período Expiración</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.periodValue}
                  onChange={(e) => update('periodValue', Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteIndex !== null} onOpenChange={() => !isDeleting && setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar aliado?</AlertDialogTitle>
            <AlertDialogDescription>
              El aliado será marcado como eliminado. Esta acción se puede revertir desde la base de
              datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
