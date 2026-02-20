import { useState } from 'react';
import type { Program } from '@/types/program';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Save, X, Settings2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  program: Program;
  onSave: (program: Program) => void | Promise<void>;
}

export function ProgramConfigForm({ program, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Program>(program);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (form.conversionValue <= 0 || form.pointsMoneyRatio <= 0) {
      toast.error('Los valores de conversión deben ser mayores a 0');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      setEditing(false);
      toast.success('Programa actualizado correctamente');
    } catch {
      // Error handled by axios interceptor
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(program);
    setEditing(false);
  };

  const update = (field: keyof Program, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          <CardTitle>Configuración del Programa</CardTitle>
        </div>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 mr-1" /> Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Guardar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <Label>ID del Programa</Label>
            <Input value={form.programId} disabled className="bg-muted" />
          </div>
          <div className="space-y-1">
            <Label>Nombre</Label>
            <Input
              value={form.name}
              disabled={!editing}
              onChange={(e) => update('name', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Descripción</Label>
            <Input
              value={form.description}
              disabled={!editing}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Valor de Conversión</Label>
            <Input
              type="number"
              value={form.conversionValue}
              disabled={!editing}
              onChange={(e) => update('conversionValue', Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>Ratio Puntos/Dinero</Label>
            <Input
              type="number"
              value={form.pointsMoneyRatio}
              disabled={!editing}
              onChange={(e) => update('pointsMoneyRatio', Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>ID Período</Label>
            <Input
              type="number"
              value={form.periodId}
              disabled={!editing}
              onChange={(e) => update('periodId', Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>Valor del Período</Label>
            <Input
              type="number"
              value={form.periodValue}
              disabled={!editing}
              onChange={(e) => update('periodValue', Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>Motor de Reglas</Label>
            <Input
              value={form.ruleEngine}
              disabled={!editing}
              onChange={(e) => update('ruleEngine', e.target.value)}
            />
          </div>
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <Label>Tipos de Transacción</Label>
            <div className="flex flex-wrap gap-1 pt-1">
              <span className="text-xs text-muted-foreground mr-1">Income:</span>
              {form.transactionsType.income.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">
                  {t}
                </Badge>
              ))}
              <span className="text-xs text-muted-foreground ml-2 mr-1">Expense:</span>
              {form.transactionsType.expense.map((t) => (
                <Badge key={t} variant="outline" className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
