// src/mocks/handlers/rulesHandlers.ts
// Engine API: GET/PUT /engines/jsonrule (rulesGet53rv1c3, rulesPut53rv1c3)
import { http, HttpResponse } from 'msw';
import rulesSuccess from '../data/rules/success.json';
import { getMockResponse } from '../mockService';

const RULES_GET_PATH = '/rulesGet53rv1c3/engines/jsonrule';
const RULES_PUT_PATH = '/rulesPut53rv1c3/engines/jsonrule';

/** Estado mutable para simular persistencia entre GET y PUT en la misma sesión */
type RulesState = { attributes: Record<string, unknown>; decisions: unknown[] };
let mockRulesState: RulesState = JSON.parse(JSON.stringify(rulesSuccess)) as RulesState;

export const rulesHandlers = [
  http.get(RULES_GET_PATH, () => {
    return HttpResponse.json(mockRulesState);
  }),

  http.put(RULES_PUT_PATH, async ({ request }) => {
    const body = (await request.json()) as { attributes?: Record<string, unknown>; decisions?: unknown[] };
    if (!body || typeof body !== 'object') {
      return HttpResponse.json(getMockResponse('common', 'badrequest'), { status: 400 });
    }
    mockRulesState = {
      attributes: body.attributes ?? mockRulesState.attributes,
      decisions: Array.isArray(body.decisions) ? body.decisions : mockRulesState.decisions,
    };
    return new HttpResponse(null, { status: 204 });
  }),
];

/** Resetea el estado de reglas para tests aislados */
export function resetRulesMock() {
  mockRulesState = JSON.parse(JSON.stringify(rulesSuccess)) as RulesState;
}
