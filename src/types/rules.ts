// Types for JSON Rules Engine
// Alineados con json-rules-engine (https://github.com/CacheControl/json-rules-engine)
// y contrato API (ENGINE-API-POSTMAN.md, REQUERIMIENTOS-FRONTEND-JSON-RULES.md)

/** Condición json-rules-engine: fact, operator, value */
export interface RuleCondition {
  fact: string;
  operator: string;
  value: string | number | (string | number)[];
}

/** all = AND, any = OR (json-rules-engine) */
export interface RuleConditions {
  all?: RuleCondition[];
  any?: RuleCondition[];
}

/** event de json-rules-engine; aquí type = puntos (string numérico), params.rule = nombre */
export interface RuleEvent {
  type: string;
  params: { rule: string };
}

export interface Decision {
  conditions: RuleConditions;
  event: RuleEvent;
  enabled?: boolean;
}

export interface RuleAttribute {
  type: 'string' | 'number';
  name: string;
}

export interface RulesPayload {
  attributes: Record<string, RuleAttribute>;
  decisions: Decision[];
}

export type ConditionGroupType = 'all' | 'any';

export const OPERATOR_LABELS: Record<string, string> = {
  equal: '=',
  notEqual: '≠',
  greaterThan: '>',
  greaterThanInclusive: '≥',
  lessThan: '<',
  lessThanInclusive: '≤',
  in: 'en',
  notIn: 'no en',
  contains: 'contiene',
  doesNotContain: 'no contiene',
};

export const OPERATORS = Object.keys(OPERATOR_LABELS);

export const FACT_LABELS: Record<string, string> = {
  value: 'Monto',
  identificationTypeId: 'Tipo documento',
  documentNumber: 'Número documento',
  season: 'Temporada',
  transactionDate: 'Fecha transacción',
  promoCode: 'Código promocional',
};

export function formatValue(value: string | number | (string | number)[]): string {
  if (Array.isArray(value)) return `[${value.join(', ')}]`;
  if (typeof value === 'number') return value.toLocaleString('es-CO');
  return `"${value}"`;
}
