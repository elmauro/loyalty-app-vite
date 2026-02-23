// src/services/rulesService.ts
// Engine API: GET/PUT /engines/jsonrule
//
// DocumentClient devuelve plain JSON. Formato: { attributes, decisions } según json-rules-engine.
import axiosApp from './axiosInstance';
import { PROGRAM_ID, RULES_GET_API_PATH, RULES_UPDATE_API_PATH, TRANSACTION_TYPE_INCOME } from './apiConfig';
import { getAuthToken } from '../utils/token';
import { getTenantForRequest } from '../utils/token';
import type { RulesPayload, RuleAttribute } from '../types/rules';

const ENGINE = 'jsonrule';

function getRulesHeaders(transactionType?: string) {
  const token = getAuthToken();
  const tenant = getTenantForRequest();
  return {
    'x-access-token': token ?? '',
    'x-program-id': PROGRAM_ID,
    'x-transaction-type': transactionType ?? TRANSACTION_TYPE_INCOME,
    'x-tenant-id': tenant?.tenantId ?? '',
  };
}

/** Parsea attributes (plain JSON): objeto { [name]: { type, name } } */
function parseAttributes(attrs: unknown): Record<string, RuleAttribute> {
  if (!attrs || typeof attrs !== 'object') return {};
  const result: Record<string, RuleAttribute> = {};
  const obj = attrs as Record<string, unknown>;
  for (const [k, v] of Object.entries(obj)) {
    const item = v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
    const name = String(item?.name ?? k);
    const typeRaw = String(item?.type ?? 'string');
    const type: RuleAttribute['type'] = typeRaw === 'number' ? 'number' : 'string';
    if (name) result[name] = { type, name };
  }
  return result;
}

/** Parsea una condición (plain JSON) */
function parseCondition(c: unknown): { fact: string; operator: string; value: string | number | (string | number)[] } {
  const obj = (c && typeof c === 'object' ? c : {}) as Record<string, unknown>;
  const fact = String(obj?.fact ?? '');
  const operator = String(obj?.operator ?? 'equal');
  const val = obj?.value;
  let value: string | number | (string | number)[] = '';
  if (typeof val === 'number') value = val;
  else if (typeof val === 'string') value = val;
  else if (Array.isArray(val)) value = val;
  return { fact, operator, value };
}

/** Parsea una decisión (plain JSON) */
function parseDecision(d: unknown): RulesPayload['decisions'][0] {
  const dec = (d && typeof d === 'object' ? d : {}) as Record<string, unknown>;
  const conditions = (dec.conditions && typeof dec.conditions === 'object' ? dec.conditions : {}) as Record<string, unknown>;
  const all = (Array.isArray(conditions.all) ? conditions.all : []).map(parseCondition);
  const anyArr = (Array.isArray(conditions.any) ? conditions.any : []).map(parseCondition);
  const event = (dec.event && typeof dec.event === 'object' ? dec.event : {}) as Record<string, unknown>;
  const params = (event.params && typeof event.params === 'object' ? event.params : {}) as Record<string, unknown>;
  const points = String(event?.type ?? '0');
  const ruleName = String(params?.rule ?? '');
  const enabled = dec.enabled !== false;
  return {
    conditions: anyArr.length > 0 ? { any: anyArr } : { all: all.length > 0 ? all : [{ fact: '', operator: 'equal', value: '' }] },
    event: { type: points, params: { rule: ruleName } },
    enabled,
  };
}

export async function getRules(transactionType?: string): Promise<RulesPayload> {
  const response = await axiosApp.get<Record<string, unknown>>(
    `/${RULES_GET_API_PATH}/engines/${ENGINE}`,
    { headers: getRulesHeaders(transactionType) }
  );
  const data = (response.data && typeof response.data === 'object' ? response.data : {}) as Record<string, unknown>;
  const decisions = Array.isArray(data.decisions) ? data.decisions : [];
  return {
    attributes: parseAttributes(data.attributes),
    decisions: decisions.map(parseDecision),
  };
}

export async function updateRules(payload: RulesPayload, transactionType?: string): Promise<void> {
  await axiosApp.put(`/${RULES_UPDATE_API_PATH}/engines/${ENGINE}`, payload, {
    headers: getRulesHeaders(transactionType),
  });
}
