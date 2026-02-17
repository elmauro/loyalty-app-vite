import { useState } from 'react';
import { RuleAttribute, DEFAULT_ATTRIBUTES, FACT_LABELS, Decision } from '@/types/rules';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_FACT_KEYS = Object.keys(DEFAULT_ATTRIBUTES);

interface FactsManagerProps {
  attributes: Record<string, RuleAttribute>;
  decisions: Decision[];
  onAttributesChange: (attrs: Record<string, RuleAttribute>) => void;
}

export function FactsManager({ attributes, decisions, onAttributesChange }: FactsManagerProps) {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'string' | 'number'>('string');

  const usedFacts = new Set<string>();
  decisions.forEach((d) => {
    const conds = d.conditions.all || d.conditions.any || [];
    conds.forEach((c) => usedFacts.add(c.fact));
  });

  function handleAdd() {
    const name = newName.trim();
    if (!name) {
      toast.error('El nombre del fact es obligatorio');
      return;
    }
    if (attributes[name]) {
      toast.error('Ya existe un fact con ese nombre');
      return;
    }
    onAttributesChange({ ...attributes, [name]: { type: newType, name } });
    setNewName('');
    toast.success(`Fact "${name}" añadido`);
  }

  function handleDelete(key: string) {
    if (usedFacts.has(key)) {
      toast.error(`No se puede eliminar "${key}" porque está en uso en una regla`);
      return;
    }
    const { [key]: _, ...rest } = attributes;
    onAttributesChange(rest);
    toast.success(`Fact "${key}" eliminado`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Facts disponibles</CardTitle>
        <CardDescription>
          Atributos configurados para el motor de reglas. Eliminar solo es posible si el fact no está en uso.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(attributes).map(([key, attr]) => (
            <Badge key={key} variant="outline" className="gap-1.5 pr-1">
              <span className="font-mono text-xs">{FACT_LABELS[key] || key}</span>
              <span className="text-muted-foreground">({attr.type})</span>
              <Button
                data-testid={`facts-delete-${key}`}
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1 text-destructive hover:text-destructive"
                onClick={() => handleDelete(key)}
                disabled={usedFacts.has(key) || DEFAULT_FACT_KEYS.includes(key)}
                title={DEFAULT_FACT_KEYS.includes(key) ? 'Fact por defecto del body Income, no se puede eliminar' : undefined}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>

        <div className="flex items-end gap-3 rounded-lg border border-dashed border-border p-3" data-testid="facts-add-form">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Nombre (camelCase)</Label>
            <Input
              data-testid="facts-add-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="ej. promoCode"
            />
          </div>
          <div className="w-32 space-y-1">
            <Label className="text-xs">Tipo</Label>
            <Select value={newType} onValueChange={(v: 'string' | 'number') => setNewType(v)}>
              <SelectTrigger data-testid="facts-add-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">string</SelectItem>
                <SelectItem value="number">number</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button data-testid="facts-add-btn" onClick={handleAdd} size="sm">
            <Plus className="h-3.5 w-3.5 mr-1" /> Añadir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
