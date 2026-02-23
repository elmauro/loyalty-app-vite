import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layers, Plus, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Decision,
  RulesPayload,
  RuleAttribute,
  DEFAULT_ATTRIBUTES,
} from '@/types/rules';
import { RuleCard } from '@/components/rules/RuleCard';
import { RuleFormDialog } from '@/components/rules/RuleFormDialog';
import { FactsManager } from '@/components/rules/FactsManager';
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
import { getRules, updateRules } from '@/services/rulesService';

const EMPTY_RULES: RulesPayload = { attributes: {}, decisions: [] };

interface RulesManagerProps {
  transactionTypes: string[];
  selectedType: string;
  onSelectedTypeChange: (type: string) => void;
  renderHeader?: (props: { onCreate: () => void; saving: boolean }) => React.ReactNode;
}

export function RulesManager({
  transactionTypes,
  selectedType,
  onSelectedTypeChange,
  renderHeader,
}: RulesManagerProps) {
  const [rulesByType, setRulesByType] = useState<Record<string, RulesPayload>>({});
  const [initialLoad, setInitialLoad] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const rules = rulesByType[selectedType] ?? EMPTY_RULES;
  const decisions = Array.isArray(rules.decisions) ? rules.decisions : [];
  const enabledCount = decisions.filter((d) => d.enabled !== false).length;

  useEffect(() => {
    if (transactionTypes.length === 0) return;
    let cancelled = false;
    setInitialLoad(true);
    const loadAll = async () => {
      const results = await Promise.allSettled(
        transactionTypes.map((t) => getRules(t))
      );
      if (cancelled) return;
      const next: Record<string, RulesPayload> = {};
      transactionTypes.forEach((t, i) => {
        const r = results[i];
        if (r.status === 'fulfilled' && r.value) {
          const attrs = r.value.attributes ?? {};
          const merged = Object.keys(attrs).length ? { ...DEFAULT_ATTRIBUTES, ...attrs } : DEFAULT_ATTRIBUTES;
          next[t] = { attributes: merged, decisions: r.value.decisions ?? [] };
        } else {
          next[t] = EMPTY_RULES;
        }
      });
      setRulesByType(next);
      setInitialLoad(false);
    };
    loadAll();
    return () => { cancelled = true; };
  }, [transactionTypes]);

  const updateRulesForType = useCallback((type: string, payload: RulesPayload) => {
    setRulesByType((prev) => ({ ...prev, [type]: payload }));
  }, []);

  async function persistRules(type: string, nextRules: RulesPayload) {
    setSaving(true);
    try {
      await updateRules(nextRules, type);
      updateRulesForType(type, nextRules);
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(idx: number) {
    const prev = rules;
    const next: RulesPayload = {
      ...prev,
      decisions: (Array.isArray(prev.decisions) ? prev.decisions : []).map((d, i) =>
        i === idx ? { ...d, enabled: d.enabled === false ? true : false } : d
      ),
    };
    updateRulesForType(selectedType, next);
    const ok = await persistRules(selectedType, next);
    if (ok) toast.success('Estado de la regla actualizado');
    else updateRulesForType(selectedType, prev);
  }

  function handleEdit(idx: number) {
    setEditIndex(idx);
    setFormOpen(true);
  }

  function handleCreate() {
    setEditIndex(null);
    setFormOpen(true);
  }

  async function handleSave(decision: Decision, transactionType: string) {
    setSaving(true);
    try {
      if (transactionType === selectedType) {
        const prev = rules;
        const next: RulesPayload = (() => {
          const updated = { ...prev };
          if (editIndex !== null) {
            updated.decisions = prev.decisions.map((d, i) => (i === editIndex ? decision : d));
          } else {
            updated.decisions = [...prev.decisions, decision];
          }
          return updated;
        })();
        await updateRules(next, transactionType);
        updateRulesForType(transactionType, next);
      } else {
        if (editIndex !== null) {
          const prevWithout = { ...rules, decisions: rules.decisions.filter((_, i) => i !== editIndex) };
          await updateRules(prevWithout, selectedType);
          updateRulesForType(selectedType, prevWithout);
        }
        const data = await getRules(transactionType).catch(() => null);
        const base = data ?? { attributes: rules.attributes, decisions: [] };
        const nextTarget: RulesPayload = {
          ...base,
          decisions: [...base.decisions, decision],
        };
        await updateRules(nextTarget, transactionType);
        updateRulesForType(transactionType, nextTarget);
        onSelectedTypeChange(transactionType);
      }
      toast.success(editIndex !== null ? 'Regla actualizada' : 'Regla creada');
      setFormOpen(false);
    } catch {
      toast.error('No se pudo guardar la regla');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (deleteIndex === null) return;
    const prev = rules;
    const next: RulesPayload = {
      ...prev,
      decisions: (Array.isArray(prev.decisions) ? prev.decisions : []).filter((_, i) => i !== deleteIndex),
    };
    updateRulesForType(selectedType, next);
    setDeleteIndex(null);
    const ok = await persistRules(selectedType, next);
    if (ok) toast.success('Regla eliminada');
    else updateRulesForType(selectedType, prev);
  }

  async function handleAttributesChange(attrs: Record<string, RuleAttribute>) {
    const prev = rules;
    const next: RulesPayload = { ...prev, attributes: attrs };
    updateRulesForType(selectedType, next);
    const ok = await persistRules(selectedType, next);
    if (!ok) updateRulesForType(selectedType, prev);
  }

  const isLoading = initialLoad;

  return (
    <>
      {renderHeader?.({ onCreate: handleCreate, saving })}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2 min-w-[180px]">
          <Label htmlFor="rules-transaction-type">Tipo de transacción</Label>
          <Select value={selectedType} onValueChange={onSelectedTypeChange}>
            <SelectTrigger id="rules-transaction-type" data-testid="rules-transaction-type">
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
        <span className="text-xs text-muted-foreground pb-2">
          Las reglas se aplican según el tipo enviado en x-transaction-type al acumular puntos.
        </span>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
        <span>
          Todas las reglas habilitadas se evalúan en cada transacción. Los puntos de cada regla que se cumpla se{' '}
          <strong className="text-foreground">acumulan</strong>.
        </span>
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules" data-testid="rules-tab-rules">Reglas</TabsTrigger>
          <TabsTrigger value="facts" data-testid="rules-tab-facts">Facts</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Layers className="h-4 w-4" />
                {rules.decisions.length} regla{rules.decisions.length !== 1 ? 's' : ''} · {enabledCount} activa
                {enabledCount !== 1 ? 's' : ''}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {decisions.map((decision, i) => (
                  <RuleCard
                    key={i}
                    decision={decision}
                    index={i}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={(idx) => setDeleteIndex(idx)}
                    data-testid={`rule-card-${i}`}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="facts" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <FactsManager
              attributes={rules.attributes}
              decisions={rules.decisions}
              onAttributesChange={handleAttributesChange}
            />
          )}
        </TabsContent>
      </Tabs>

      <RuleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
        decision={editIndex !== null ? decisions[editIndex] : null}
        attributes={rules.attributes}
        transactionTypes={transactionTypes}
        selectedType={selectedType}
        saving={saving}
      />

      <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => { if (!open) setDeleteIndex(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta regla?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La regla dejará de evaluarse en las transacciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
