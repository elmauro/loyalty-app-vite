import { useState, useEffect } from 'react';
import type { Program } from '@/types/program';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Save, X, Settings2, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  program: Program;
  onSave: (program: Program) => void | Promise<void>;
}

export function ProgramConfigForm({ program, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Program>(program);
  const [newIncomeType, setNewIncomeType] = useState('');
  const [newExpenseType, setNewExpenseType] = useState('');

  useEffect(() => {
    setForm(program);
  }, [program]);

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
    setNewIncomeType('');
    setNewExpenseType('');
    setEditing(false);
  };

  const update = (field: keyof Program, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addTransactionType = (category: 'income' | 'expense', newType: string) => {
    const trimmed = newType.trim().toLowerCase();
    if (!trimmed) return;
    const current = form.transactionsType[category];
    if (current.includes(trimmed)) {
      toast.error(`"${trimmed}" ya existe en ${category === 'income' ? 'Acumulación' : 'Redención'}`);
      return;
    }
    setForm((prev) => ({
      ...prev,
      transactionsType: {
        ...prev.transactionsType,
        [category]: [...prev.transactionsType[category], trimmed],
      },
    }));
    if (category === 'income') setNewIncomeType('');
    else setNewExpenseType('');
  };

  const removeTransactionType = (category: 'income' | 'expense', typeToRemove: string) => {
    const current = form.transactionsType[category];
    if (current.length <= 1) {
      toast.error('Debe haber al menos un tipo de transacción');
      return;
    }
    setForm((prev) => ({
      ...prev,
      transactionsType: {
        ...prev.transactionsType,
        [category]: prev.transactionsType[category].filter((t) => t !== typeToRemove),
      },
    }));
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
            <Label>Tipo Período Expiración</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm disabled:opacity-50 disabled:pointer-events-none"
              value={form.periodId}
              disabled={!editing}
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
          <div className="space-y-3 sm:col-span-2 lg:col-span-3">
            <Label>Tipos de Transacción (Acumulación y Redención)</Label>
            <p className="text-xs text-muted-foreground">
              Estos tipos se usan al acumular/canjear puntos y al definir reglas. Ej: sale, rule, promo.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 rounded-lg border border-border p-3">
                <Label className="text-sm font-medium">Acumulación (Income)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {form.transactionsType.income.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="text-xs gap-0.5 pr-1"
                    >
                      {t}
                      {editing && (
                        <button
                          type="button"
                          onClick={() => removeTransactionType('income', t)}
                          className="ml-0.5 rounded p-0.5 hover:bg-muted-foreground/20"
                          aria-label={`Quitar ${t}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {editing && (
                  <div className="flex gap-2 pt-1">
                    <Input
                      placeholder="Nuevo tipo (ej. promo)"
                      className="h-8 text-sm"
                      value={newIncomeType}
                      onChange={(e) => setNewIncomeType(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTransactionType('income', newIncomeType);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => addTransactionType('income', newIncomeType)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2 rounded-lg border border-border p-3">
                <Label className="text-sm font-medium">Redención (Expense)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {form.transactionsType.expense.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="text-xs gap-0.5 pr-1"
                    >
                      {t}
                      {editing && (
                        <button
                          type="button"
                          onClick={() => removeTransactionType('expense', t)}
                          className="ml-0.5 rounded p-0.5 hover:bg-muted-foreground/20"
                          aria-label={`Quitar ${t}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {editing && (
                  <div className="flex gap-2 pt-1">
                    <Input
                      placeholder="Nuevo tipo (ej. gift)"
                      className="h-8 text-sm"
                      value={newExpenseType}
                      onChange={(e) => setNewExpenseType(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTransactionType('expense', newExpenseType);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => addTransactionType('expense', newExpenseType)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
