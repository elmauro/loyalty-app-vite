import { Decision, FACT_LABELS, OPERATOR_LABELS, formatValue } from '@/types/rules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Zap, Filter, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { ConditionBadge } from './ConditionBadge';

interface RuleCardProps {
  decision: Decision;
  index: number;
  onToggle: (index: number) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export function RuleCard({ decision, index, onToggle, onEdit, onDelete }: RuleCardProps) {
  const conditionsObj = decision?.conditions ?? {};
  const conditions = conditionsObj.all || conditionsObj.any || [];
  const isAny = !!conditionsObj.any;
  const event = decision?.event ?? { type: '0', params: { rule: '' } };
  const points = parseInt(String(event?.type ?? '0'), 10) || 0;
  const ruleName = event?.params?.rule ?? '';
  const enabled = decision?.enabled !== false;

  return (
    <Card className={`overflow-hidden border-border/60 transition-all ${!enabled ? 'opacity-50' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {index + 1}
            </div>
            <CardTitle className="text-base truncate">{ruleName}</CardTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
              <Zap className="h-3 w-3" />
              {points.toLocaleString('es-CO')} pts
            </Badge>
            <Switch checked={enabled} onCheckedChange={() => onToggle(index)} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Filter className="h-3 w-3" />
          Condiciones
          <Badge variant="outline" className="ml-1 text-[10px]">
            {isAny ? 'CUALQUIERA' : 'TODAS'}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {conditions.map((cond, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && (
                <span className="text-xs font-medium text-muted-foreground">{isAny ? 'ó' : 'y'}</span>
              )}
              <ConditionBadge condition={cond} />
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Otorgar</span>
            <span className="font-bold text-primary">{points.toLocaleString('es-CO')}</span>
            <span className="text-muted-foreground">puntos</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(index)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(index)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
