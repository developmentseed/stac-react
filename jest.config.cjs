module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
};
