import { useState, useEffect, useCallback, useMemo } from 'react';
import { TenantAdmin, Tenant } from '@/types/program';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Pencil, UserX, UserPlus, Search, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchTenantAdmins,
  createTenantAdmin,
  updateTenantAdminStatus,
  type CreateTenantAdminInput,
} from '@/services/tenantAdminService';

interface Props {
  tenants: Tenant[];
  selectedTenant?: Tenant | null;
  onClose?: () => void;
}

const emptyForm = {
  email: '',
  firstName: '',
  lastName: '',
  tenantId: '',
};

export function TenantAdminsManager({ tenants, selectedTenant, onClose }: Props) {
  const [admins, setAdmins] = useState<TenantAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deactivateIndex, setDeactivateIndex] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const activeTenants = useMemo(
    () => tenants.filter((t) => t.isdeleted === 0),
    [tenants]
  );
  const tenantIdToName = useMemo(
    () => Object.fromEntries(activeTenants.map((t) => [t.tenantId, t.name])),
    [activeTenants]
  );

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchTenantAdmins(tenantIdToName);
      setAdmins(list);
    } catch {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, [tenantIdToName]);

  useEffect(() => {
    if (activeTenants.length > 0) {
      loadAdmins();
    } else {
      setAdmins([]);
      setLoading(false);
    }
  }, [loadAdmins, activeTenants.length]);

  const adminsForTenant = useMemo(
    () => (selectedTenant ? admins.filter((a) => a.tenantId === selectedTenant.tenantId) : admins),
    [admins, selectedTenant]
  );

  const filtered = adminsForTenant.filter(
    (a) =>
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.firstName.toLowerCase().includes(search.toLowerCase()) ||
      a.lastName.toLowerCase().includes(search.toLowerCase()) ||
      a.tenantName.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditIndex(null);
    setForm(selectedTenant ? { ...emptyForm, tenantId: selectedTenant.tenantId } : emptyForm);
    setPassword('');
    setDialogOpen(true);
  };

  const openEdit = (idx: number) => {
    const admin = filtered[idx];
    setEditIndex(idx);
    setForm({
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      tenantId: admin.tenantId,
    });
    setPassword('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.email.trim() || !form.firstName.trim() || !form.lastName.trim() || !form.tenantId) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    if (editIndex === null && !password.trim()) {
      toast.error('La contraseña es obligatoria para nuevos usuarios');
      return;
    }
    if (editIndex === null && password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (editIndex !== null) {
      toast.info('La edición de administradores no está disponible en esta versión');
      setDialogOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      const input: CreateTenantAdminInput = {
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        tenantId: form.tenantId,
        password,
      };
      await createTenantAdmin(input);
      await loadAdmins();
      setDialogOpen(false);
      toast.success('Administrador creado. El usuario recibirá un correo con su contraseña temporal y deberá cambiarla en el primer inicio de sesión.');
    } catch {
      // Error ya manejado por interceptor
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeactivate = async () => {
    if (deactivateIndex === null) return;
    const admin = filtered[deactivateIndex];
    setIsTogglingStatus(true);
    try {
      const newStatus = admin.isActive ? 'inactive' : 'active';
      await updateTenantAdminStatus(admin.id, newStatus);
      await loadAdmins();
      setDeactivateIndex(null);
      toast.success(
        admin.isActive
          ? 'Administrador desactivado. No podrá acceder al sistema hasta que se reactive.'
          : 'Administrador activado correctamente.'
      );
    } catch {
      // Error ya manejado por interceptor
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className={selectedTenant ? 'border-0 shadow-none' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl font-bold">Administradores</CardTitle>
          <span className="text-muted-foreground">—</span>
          <Badge variant="outline" className="font-normal text-muted-foreground">
            {selectedTenant ? selectedTenant.name : 'Aliados'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          )}
          <Button size="sm" onClick={openCreate} className="bg-primary hover:bg-primary/90" data-testid="tenant-admins-new-admin">
            <UserPlus className="h-4 w-4 mr-1" /> Nuevo Admin
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar administrador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nombre</TableHead>
                {!selectedTenant && <TableHead className="hidden md:table-cell">Aliado</TableHead>}
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={selectedTenant ? 4 : 5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={selectedTenant ? 4 : 5} className="text-center text-muted-foreground py-8">
                    No hay administradores
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((a, i) => (
                  <TableRow key={a.id} className={!a.isActive ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{a.email}</TableCell>
                    <TableCell>
                      {a.firstName} {a.lastName}
                    </TableCell>
                    {!selectedTenant && (
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="font-normal">{a.tenantName}</Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant={a.isActive ? 'default' : 'secondary'}
                        className={a.isActive ? 'bg-green-600 hover:bg-green-600/90 text-white' : ''}
                      >
                        {a.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(i)} title="Editar" data-testid={`tenant-admin-edit-${a.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeactivateIndex(i)}
                            title={a.isActive ? 'Desactivar' : 'Activar'}
                            data-testid={`tenant-admin-deactivate-${a.id}`}
                          >
                            <UserX className="h-4 w-4 text-destructive" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{a.isActive ? 'Desactivar' : 'Activar'}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={!!selectedTenant ? false : undefined}>
        <DialogContent className="sm:max-w-md" data-testid="tenant-admin-form-dialog">
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? 'Editar Administrador' : 'Nuevo Administrador'}</DialogTitle>
            <DialogDescription>
              {editIndex !== null
                ? 'Los datos del administrador se gestionan desde el sistema de identidad.'
                : 'Crea un usuario administrador del aliado. Recibirá un correo con su contraseña temporal y deberá cambiarla en el primer inicio de sesión.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                disabled={editIndex !== null}
                placeholder="admin@aliado.com"
                data-testid="tenant-admin-form-email"
              />
            </div>
            {editIndex === null && (
              <div className="space-y-1">
                <Label>Contraseña</Label>
                <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  data-testid="tenant-admin-form-password"
                />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Nombre</Label>
                <Input
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                placeholder="Nombre"
                disabled={editIndex !== null}
                data-testid="tenant-admin-form-firstName"
              />
              </div>
              <div className="space-y-1">
                <Label>Apellido</Label>
                <Input
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                placeholder="Apellido"
                disabled={editIndex !== null}
                data-testid="tenant-admin-form-lastName"
              />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Aliado</Label>
              <Select
                value={form.tenantId}
                onValueChange={(v) => update('tenantId', v)}
                disabled={editIndex !== null || !!selectedTenant}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar aliado" />
                </SelectTrigger>
                <SelectContent>
                  {activeTenants.map((t) => (
                    <SelectItem key={t.tenantId} value={t.tenantId}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving} data-testid="tenant-admin-form-cancel">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} data-testid="tenant-admin-form-save">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deactivateIndex !== null} onOpenChange={() => setDeactivateIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deactivateIndex !== null && filtered[deactivateIndex]?.isActive
                ? '¿Desactivar administrador?'
                : '¿Activar administrador?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateIndex !== null && filtered[deactivateIndex]?.isActive
                ? 'El usuario no podrá acceder al sistema hasta que se reactive.'
                : 'El usuario podrá acceder al sistema nuevamente.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isTogglingStatus}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate} disabled={isTogglingStatus}>
              {isTogglingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
