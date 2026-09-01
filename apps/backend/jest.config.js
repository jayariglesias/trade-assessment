/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            decorators: true,
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
        },
      },
    ],
  },
  testEnvironment: 'node',
  testTimeout: 30000,
  forceExit: true,
  setupFiles: ['reflect-metadata'],
  moduleNameMapper: {
    '^@shared/api-contracts$': '<rootDir>/../../../packages/api-contracts/src/index.ts',
  },
};
