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
    '^@/services/apiConfig$': '<rootDir>/src/services/apiConfig.jest.ts',
    '^(\\.\\./)*services/apiConfig$': '<rootDir>/src/services/apiConfig.jest.ts',
    '^\\./apiConfig$': '<rootDir>/src/services/apiConfig.jest.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/cypress/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/mocks/**',
    '!src/**/__tests__/**',
  ],
  coverageDirectory: 'coverage',
};

export default config;
