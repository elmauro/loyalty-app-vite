import { RuleCondition, FACT_LABELS, OPERATOR_LABELS, formatValue } from '@/types/rules';

export function ConditionBadge({ condition }: { condition: RuleCondition }) {
  const cond = condition ?? { fact: '', operator: '', value: '' };
  const factLabel = FACT_LABELS[cond.fact] || cond.fact;
  const opLabel = OPERATOR_LABELS[cond.operator] || cond.operator;

  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-1.5 text-sm">
      <span className="font-medium text-foreground">{factLabel}</span>
      <span className="font-mono text-primary">{opLabel}</span>
      <span className="font-semibold text-foreground">{formatValue(cond.value)}</span>
    </div>
  );
}
