/** Backend target for E2E: undefined/msw = MSW mocks; simulith = local Simulith stack. */
export const isSimulithBackend = (): boolean => Cypress.env('BACKEND') === 'simulith';

export const describeWhenMsw = (title: string, fn: () => void): void => {
  (isSimulithBackend() ? describe.skip : describe)(title, fn);
};

export const describeWhenSimulith = (title: string, fn: () => void): void => {
  (isSimulithBackend() ? describe : describe.skip)(title, fn);
};
