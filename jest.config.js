export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: './tsconfig.json',
      },
    ],
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/', // ✅ ignore compiled JS files
  ],
};
