import { useState, useEffect, useCallback, useMemo } from 'react';
import { Office, Tenant } from '@/types/program';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, Pencil, Trash2, MapPin, Loader2, RotateCcw, Star, Search } from 'lucide-react';
import { PROGRAM_GRID_DEFAULT_PAGE_SIZE } from '@/constants/pagination';
import { TablePaginationBar } from '@/components/ui/table-pagination-bar';
import { toast } from 'sonner';
import {
  fetchOfficesByTenant,
  createOffice,
  updateOffice,
  deactivateOffice,
  reactivateOffice,
  type CreateOfficeInput,
  type UpdateOfficeInput,
} from '@/services/officeService';
import { Badge } from '@/components/ui/badge';
import { colombiaDepartments, getCityById } from '@/data/colombia-cities';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
}

const DEFAULT_CITY_ID = 11001; // Bogotá, D.C.

const emptyForm: CreateOfficeInput & { officeId?: string } = {
  name: '',
  cityId: DEFAULT_CITY_ID,
  address: '',
  description: '',
  phoneNumber: '',
  isDefault: 0,
};

export function TenantOfficesDialog({ open, onOpenChange, tenant }: Props) {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOffice, setEditOffice] = useState<Office | null>(null);
  const [deleteOffice, setDeleteOffice] = useState<Office | null>(null);
  const [form, setForm] = useState<CreateOfficeInput & { officeId?: string }>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
  const [officeSearch, setOfficeSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PROGRAM_GRID_DEFAULT_PAGE_SIZE);

  const loadOffices = useCallback(async (opts?: { silent?: boolean }) => {
    if (!tenant) return;
    const silent = opts?.silent === true;
    if (!silent) setLoading(true);
    try {
      const list = await fetchOfficesByTenant(tenant.tenantId, true);
      setOffices(list);
    } catch {
      setOffices([]);
      toast.error('No se pudieron cargar las oficinas');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [tenant]);

  const activeOffices = useMemo(
    () => offices.filter((o) => (o.isDeleted ?? 0) === 0),
    [offices]
  );
  const inactiveOffices = useMemo(
    () => offices.filter((o) => (o.isDeleted ?? 0) === 1),
    [offices]
  );

  const filteredActiveOffices = useMemo(() => {
    const q = officeSearch.trim().toLowerCase();
    if (!q) return activeOffices;
    return activeOffices.filter((o) => {
      const cityName = getCityById(o.cityId)?.name ?? String(o.cityId);
      return (
        o.name.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q) ||
        cityName.toLowerCase().includes(q) ||
        (o.description ?? '').toLowerCase().includes(q) ||
        (o.phoneNumber ?? '').toLowerCase().includes(q)
      );
    });
  }, [activeOffices, officeSearch]);

  const totalFilteredActive = filteredActiveOffices.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredActive / pageSize));
  const pagedActiveOffices = useMemo(
    () => filteredActiveOffices.slice((page - 1) * pageSize, page * pageSize),
    [filteredActiveOffices, page, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [officeSearch]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    if (open && tenant) {
      loadOffices();
    }
  }, [open, tenant, loadOffices]);

  useEffect(() => {
    if (!open) {
      setDialogOpen(false);
      setEditOffice(null);
      setForm(emptyForm);
      setOfficeSearch('');
      setPage(1);
    }
  }, [open]);

  const openCreate = () => {
    setEditOffice(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (office: Office) => {
    setEditOffice(office);
    setForm({
      name: office.name,
      cityId: office.cityId,
      address: office.address,
      description: office.description ?? '',
      phoneNumber: office.phoneNumber ?? '',
      officeId: office.officeId,
      isDefault: Number(office.isDefault ?? 0),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!tenant) return;
    if (!form.name.trim() || !form.address.trim()) {
      toast.error('Nombre y dirección son obligatorios');
      return;
    }
    if (form.cityId <= 0) {
      toast.error('El ID de ciudad debe ser mayor a 0');
      return;
    }

    setIsSaving(true);
    try {
      if (editOffice) {
        const input: UpdateOfficeInput = {
          name: form.name.trim(),
          cityId: form.cityId,
          address: form.address.trim(),
          ...(form.description?.trim() && { description: form.description.trim() }),
          ...(form.phoneNumber?.trim() && { phoneNumber: form.phoneNumber.trim() }),
          isDefault: form.isDefault === 1 ? 1 : 0,
        };
        await updateOffice(tenant.tenantId, editOffice.officeId, input);
        await loadOffices({ silent: true });
        toast.success('Oficina actualizada');
      } else {
        const input: CreateOfficeInput = {
          name: form.name.trim(),
          cityId: form.cityId,
          address: form.address.trim(),
          ...(form.description?.trim() && { description: form.description.trim() }),
          ...(form.phoneNumber?.trim() && { phoneNumber: form.phoneNumber.trim() }),
          isDefault: form.isDefault === 1 ? 1 : 0,
        };
        await createOffice(tenant.tenantId, input);
        await loadOffices({ silent: true });
        toast.success('Oficina creada');
      }
      setDialogOpen(false);
    } catch {
      // Error ya manejado por interceptor
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!tenant || !deleteOffice) return;
    setIsDeleting(true);
    try {
      await deactivateOffice(tenant.tenantId, deleteOffice.officeId);
      await loadOffices({ silent: true });
      setDeleteOffice(null);
      toast.success('Oficina desactivada');
    } catch {
      // Error ya manejado por interceptor
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReactivate = async (office: Office) => {
    if (!tenant) return;
    setIsReactivating(true);
    try {
      await reactivateOffice(tenant.tenantId, office.officeId);
      await loadOffices({ silent: true });
      toast.success('Oficina activada');
    } catch {
      // Error ya manejado por interceptor
    } finally {
      setIsReactivating(false);
    }
  };

  const handleSetDefault = async (office: Office) => {
    if (!tenant) return;
    if ((office.isDefault ?? 0) === 1) return;
    setIsSettingDefault(office.officeId);
    try {
      await updateOffice(tenant.tenantId, office.officeId, { isDefault: 1 });
      await loadOffices({ silent: true });
      toast.success(`${office.name} es ahora la oficina por defecto`);
    } catch {
      // Error ya manejado por interceptor
    } finally {
      setIsSettingDefault(null);
    }
  };

  const update = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            'max-h-[90vh] overflow-y-auto',
            dialogOpen ? 'sm:max-w-md' : 'sm:max-w-2xl'
          )}
          data-testid="tenant-offices-dialog"
        >
          {!dialogOpen ? (
            <>
          <DialogHeader className="sr-only">
            <DialogTitle>
              {tenant ? `Oficinas de ${tenant.name}` : 'Oficinas'}
            </DialogTitle>
            <DialogDescription>
              Gestiona las oficinas de este aliado.
            </DialogDescription>
          </DialogHeader>

          {tenant && (
            <Card className="border-0 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl font-bold">Oficinas</CardTitle>
                  <span className="text-muted-foreground">—</span>
                  <Badge variant="secondary" className="rounded-full font-normal text-muted-foreground">
                    {tenant.name}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                    Cerrar
                  </Button>
                  <Button size="sm" onClick={openCreate} data-testid="tenant-offices-new-office">
                    <Plus className="h-4 w-4 mr-1" /> Nueva Oficina
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar oficina..."
                    value={officeSearch}
                    onChange={(e) => setOfficeSearch(e.target.value)}
                    className="pl-9"
                    data-testid="tenant-offices-search"
                  />
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="hidden md:table-cell">Dirección</TableHead>
                        <TableHead className="hidden lg:table-cell">Ciudad</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ) : activeOffices.length === 0 && inactiveOffices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No hay oficinas registradas
                          </TableCell>
                        </TableRow>
                      ) : activeOffices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No hay oficinas activas
                          </TableCell>
                        </TableRow>
                      ) : filteredActiveOffices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            Ninguna oficina coincide con la búsqueda
                          </TableCell>
                        </TableRow>
                      ) : (
                        pagedActiveOffices.map((o) => {
                          const isDefault = (o.isDefault ?? 0) === 1;
                          const isSetting = isSettingDefault === o.officeId;
                          return (
                          <TableRow key={o.officeId}>
                            <TableCell className="font-medium">
                              <span className="flex items-center gap-2">
                                {o.name}
                                {isDefault && (
                                  <Badge className="inline-flex items-center gap-1 rounded-full border-0 bg-[#e8f7ed] px-2 py-0.5 text-xs font-normal text-green-600 dark:bg-green-900/30 dark:text-green-500">
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    Por defecto
                                  </Badge>
                                )}
                              </span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{o.address}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {getCityById(o.cityId)?.name ?? o.cityId}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="inline-flex flex-nowrap items-center justify-end gap-0">
                                {!isDefault && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleSetDefault(o)}
                                    disabled={!!isSettingDefault}
                                    title="Marcar como oficina por defecto"
                                    data-testid={`tenant-office-set-default-${o.officeId}`}
                                  >
                                    {isSetting ? (
                                      <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                                    ) : (
                                      <Star className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                    )}
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEdit(o)}
                                  title="Editar"
                                  data-testid={`tenant-office-edit-${o.officeId}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteOffice(o)}
                                  disabled={isDeleting}
                                  title="Desactivar"
                                  data-testid={`tenant-office-delete-${o.officeId}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </span>
                            </TableCell>
                          </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {!loading && totalFilteredActive > 0 && (
                  <TablePaginationBar
                    total={totalFilteredActive}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={(n) => {
                      setPageSize(n);
                      setPage(1);
                    }}
                    isLoading={false}
                    idPrefix="tenant-offices"
                  />
                )}

                {inactiveOffices.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Oficinas desactivadas ({inactiveOffices.length})
                    </h4>
                    <div className="rounded-md border border-dashed">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="hidden md:table-cell">Dirección</TableHead>
                            <TableHead className="hidden lg:table-cell">Ciudad</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inactiveOffices.map((o) => (
                            <TableRow key={o.officeId} className="opacity-75">
                              <TableCell className="font-medium">{o.name}</TableCell>
                              <TableCell className="hidden md:table-cell">{o.address}</TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {getCityById(o.cityId)?.name ?? o.cityId}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleReactivate(o)}
                                  disabled={isReactivating}
                                  title="Activar"
                                  data-testid={`tenant-office-reactivate-${o.officeId}`}
                                >
                                  <RotateCcw className="h-4 w-4 text-green-600" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
            </>
          ) : (
            <div data-testid="tenant-office-form-dialog" className="space-y-4">
          <DialogHeader>
            <DialogTitle>{editOffice ? 'Editar Oficina' : 'Nueva Oficina'}</DialogTitle>
            <DialogDescription>
              {editOffice
                ? 'Modifica los datos de la oficina.'
                : 'Completa los datos para registrar una nueva oficina.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Nombre de la oficina"
                data-testid="tenant-office-form-name"
              />
            </div>
            <div className="space-y-1">
              <Label>Ciudad</Label>
              <Select
                value={String(form.cityId)}
                onValueChange={(v) => update('cityId', Number(v))}
                data-testid="tenant-office-form-cityId"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {colombiaDepartments.map((dept) => (
                    <SelectGroup key={dept.id}>
                      <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {dept.name}
                      </SelectLabel>
                      {dept.cities.map((city) => (
                        <SelectItem key={city.id} value={String(city.id)}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Dirección</Label>
              <Input
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="Dirección"
                data-testid="tenant-office-form-address"
              />
            </div>
            <div className="space-y-1">
              <Label>Descripción (opcional)</Label>
              <Input
                value={form.description ?? ''}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Ej. Sucursal principal"
              />
            </div>
            <div className="space-y-1">
              <Label>Teléfono (opcional)</Label>
              <Input
                value={form.phoneNumber ?? ''}
                onChange={(e) => update('phoneNumber', e.target.value)}
                placeholder="+57 300 123 4567"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="office-default"
                checked={form.isDefault === 1}
                onCheckedChange={(checked) => update('isDefault', checked ? 1 : 0)}
                data-testid="tenant-office-form-isDefault"
              />
              <Label htmlFor="office-default" className="font-normal cursor-pointer">
                Oficina por defecto (solo una por aliado)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving} data-testid="tenant-office-form-cancel">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} data-testid="tenant-office-form-save">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Guardar
            </Button>
          </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOffice !== null} onOpenChange={() => !isDeleting && setDeleteOffice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar oficina?</AlertDialogTitle>
            <AlertDialogDescription>
              La oficina será marcada como desactivada. Podrás activarla de nuevo desde la sección de oficinas desactivadas.
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
    </>
  );
}
