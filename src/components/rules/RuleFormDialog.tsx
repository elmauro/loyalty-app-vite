import { useState, useEffect } from 'react';
import {
  Decision,
  RuleCondition,
  ConditionGroupType,
  OPERATORS,
  OPERATOR_LABELS,
  FACT_LABELS,
  RuleAttribute,
} from '@/types/rules';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (decision: Decision, transactionType: string) => void | Promise<void>;
  decision?: Decision | null;
  attributes: Record<string, RuleAttribute>;
  transactionTypes: string[];
  selectedType: string;
  saving?: boolean;
}

function emptyCondition(): RuleCondition {
  return { fact: '', operator: 'equal', value: '' };
}

function emptyDecision(): Decision {
  return {
    conditions: { all: [emptyCondition()] },
    event: { type: '', params: { rule: '' } },
    enabled: true,
  };
}

export function RuleFormDialog({
  open,
  onOpenChange,
  onSave,
  decision,
  attributes,
  transactionTypes,
  selectedType,
  saving,
}: RuleFormDialogProps) {
  const [form, setForm] = useState<Decision>(emptyDecision());
  const [groupType, setGroupType] = useState<ConditionGroupType>('all');
  const [formTransactionType, setFormTransactionType] = useState<string>(selectedType);

  const factKeys = Object.keys(attributes);

  useEffect(() => {
    if (decision) {
      setForm({ ...decision, enabled: decision.enabled !== false });
      setGroupType(decision.conditions.any ? 'any' : 'all');
      setFormTransactionType(selectedType);
    } else {
      setForm(emptyDecision());
      setGroupType('all');
      setFormTransactionType(selectedType);
    }
  }, [decision, open, selectedType]);

  const conditions = (groupType === 'any' ? form.conditions.any : form.conditions.all) || [];

  function setConditions(conds: RuleCondition[]) {
    setForm((prev) => ({
      ...prev,
      conditions: groupType === 'any' ? { any: conds } : { all: conds },
    }));
  }

  function updateCondition(idx: number, patch: Partial<RuleCondition>) {
    const updated = conditions.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    setConditions(updated);
  }

  function addCondition() {
    setConditions([...conditions, emptyCondition()]);
  }

  function removeCondition(idx: number) {
    if (conditions.length <= 1) return;
    setConditions(conditions.filter((_, i) => i !== idx));
  }

  function parseConditionValue(raw: string, fact: string): string | number | (string | number)[] {
    const attr = attributes[fact];
    if (raw.startsWith('[') && raw.endsWith(']')) {
      const inner = raw.slice(1, -1);
      return inner.split(',').map((v) => {
        const trimmed = v.trim().replace(/"/g, '');
        return attr?.type === 'number' ? Number(trimmed) : trimmed;
      });
    }
    if (attr?.type === 'number') {
      const num = Number(raw);
      return isNaN(num) ? raw : num;
    }
    return raw;
  }

  function handleSave() {
    if (!form.event.params.rule.trim()) {
      toast.error('El nombre de la regla es obligatorio');
      return;
    }
    if (!form.event.type || isNaN(Number(form.event.type))) {
      toast.error('Los puntos deben ser un valor numérico');
      return;
    }
    for (const c of conditions) {
      if (!c.fact || !c.operator) {
        toast.error('Cada condición debe tener un fact y operador');
        return;
      }
    }

    const parsed: Decision = {
      ...form,
      conditions:
        groupType === 'any'
          ? { any: conditions.map((c) => ({ ...c, value: parseConditionValue(String(c.value), c.fact) })) }
          : { all: conditions.map((c) => ({ ...c, value: parseConditionValue(String(c.value), c.fact) })) },
    };
    onSave(parsed, formTransactionType);
    // El padre cierra el diálogo cuando el guardado en backend tiene éxito
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" aria-describedby={undefined} data-testid="rule-form-dialog">
        <DialogHeader>
          <DialogTitle>{decision ? 'Editar regla' : 'Nueva regla'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label>Tipo de transacción</Label>
            <Select value={formTransactionType} onValueChange={setFormTransactionType}>
              <SelectTrigger data-testid="rule-form-transaction-type">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre de la regla</Label>
              <Input
                data-testid="rule-form-name"
                value={form.event.params.rule}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, event: { ...prev.event, params: { rule: e.target.value } } }))
                }
                placeholder="ej. BonoNavidad"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Puntos a otorgar</Label>
              <Input
                data-testid="rule-form-points"
                type="number"
                value={form.event.type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, event: { ...prev.event, type: e.target.value } }))
                }
                placeholder="ej. 2000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de agrupación</Label>
            <Select
              value={groupType}
              onValueChange={(v: ConditionGroupType) => {
                setGroupType(v);
                setForm((prev) => ({
                  ...prev,
                  conditions: v === 'any' ? { any: conditions } : { all: conditions },
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">TODAS deben cumplirse (AND)</SelectItem>
                <SelectItem value="any">CUALQUIERA puede cumplirse (OR)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Condiciones</Label>
              <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Añadir
              </Button>
            </div>

            {conditions.map((cond, idx) => (
              <div key={idx} className="flex items-end gap-2 rounded-lg border border-border p-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">Fact</Label>
                  <Select value={cond.fact} onValueChange={(v) => updateCondition(idx, { fact: v })}>
                    <SelectTrigger data-testid={idx === 0 ? 'rule-form-condition-fact' : undefined}>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {factKeys.map((k) => (
                        <SelectItem key={k} value={k}>
                          {FACT_LABELS[k] || k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">Operador</Label>
                  <Select value={cond.operator} onValueChange={(v) => updateCondition(idx, { operator: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map((op) => (
                        <SelectItem key={op} value={op}>
                          {OPERATOR_LABELS[op]} ({op})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">Valor</Label>
                  <Input
                    data-testid={idx === 0 ? 'rule-form-condition-value' : undefined}
                    value={String(cond.value)}
                    onChange={(e) => updateCondition(idx, { value: e.target.value })}
                    placeholder="ej. 10000 o [1,2,3]"
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => removeCondition(idx)}
                  disabled={conditions.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="rule-form-cancel">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} data-testid="rule-form-save">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {decision ? 'Guardar cambios' : 'Crear regla'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
