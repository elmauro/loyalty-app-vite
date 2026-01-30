import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm', // ✅ modo ESM compatible con import.meta
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: 'tsconfig.jest.json', // 👈 asegúrate que este archivo exista
    }],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/cypress/'],
};

export default config;
