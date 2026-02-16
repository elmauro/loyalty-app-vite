import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Layers, Plus, Info, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { toast } from 'sonner';
import { Decision, RulesPayload, RuleAttribute, DEFAULT_ATTRIBUTES } from '@/types/rules';
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

export default function Rules() {
  const [rules, setRules] = useState<RulesPayload>(EMPTY_RULES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
        getRules()
      .then((data) => {
        if (!cancelled) {
          const attrs = data.attributes ?? {};
          const merged = Object.keys(attrs).length ? { ...DEFAULT_ATTRIBUTES, ...attrs } : DEFAULT_ATTRIBUTES;
          setRules({ attributes: merged, decisions: data.decisions ?? [] });
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('No se pudieron cargar las reglas');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const [formOpen, setFormOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  async function persistRules(nextRules: RulesPayload) {
    setSaving(true);
    try {
      await updateRules(nextRules);
      setRules(nextRules);
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
    setRules(next);
    const ok = await persistRules(next);
    if (ok) toast.success('Estado de la regla actualizado');
    else setRules(prev);
  }

  function handleEdit(idx: number) {
    setEditIndex(idx);
    setFormOpen(true);
  }

  function handleCreate() {
    setEditIndex(null);
    setFormOpen(true);
  }

  async function handleSave(decision: Decision) {
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
    setRules(next);
    const ok = await persistRules(next);
    if (ok) {
      toast.success(editIndex !== null ? 'Regla actualizada' : 'Regla creada');
      setFormOpen(false);
    } else {
      setRules(prev);
    }
  }

  async function confirmDelete() {
    if (deleteIndex === null) return;
    const prev = rules;
    const next: RulesPayload = {
      ...prev,
      decisions: (Array.isArray(prev.decisions) ? prev.decisions : []).filter((_, i) => i !== deleteIndex),
    };
    setRules(next);
    setDeleteIndex(null);
    const ok = await persistRules(next);
    if (ok) toast.success('Regla eliminada');
    else setRules(prev);
  }

  async function handleAttributesChange(attrs: Record<string, RuleAttribute>) {
    const prev = rules;
    const next: RulesPayload = { ...prev, attributes: attrs };
    setRules(next);
    const ok = await persistRules(next);
    if (!ok) setRules(prev);
  }

  const decisions = Array.isArray(rules.decisions) ? rules.decisions : [];
  const enabledCount = decisions.filter((d) => d.enabled !== false).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to={paths.administration}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block mb-2"
        >
          ← Administración
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Reglas de Bonificación</h1>
              <p className="text-muted-foreground">Gestión de reglas del programa de puntos</p>
            </div>
          </div>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />}
            Nueva regla
          </Button>
        </div>
      </div>

      {/* Execution info */}
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
        <span>
          Todas las reglas habilitadas se evalúan en cada transacción. Los puntos de cada regla que se cumpla se{' '}
          <strong className="text-foreground">acumulan</strong>.
        </span>
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Reglas</TabsTrigger>
          <TabsTrigger value="facts">Facts</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4 mt-4">
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
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="facts" className="mt-4">
          <FactsManager
            attributes={rules.attributes}
            decisions={rules.decisions}
            onAttributesChange={handleAttributesChange}
          />
        </TabsContent>
      </Tabs>

      <RuleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
        decision={editIndex !== null ? decisions[editIndex] : null}
        attributes={rules.attributes}
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
    </div>
  );
}
