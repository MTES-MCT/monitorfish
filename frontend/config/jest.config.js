export default {
  clearMocks: true,
  collectCoverageFrom: ['**/{hooks,libs,utils}/**/*.t{s,sx}', '**/utils.ts'],
  globalSetup: '<rootDir>/config/jest.global.js',
  maxWorkers: '50%',
  moduleNameMapper: {
    '\\.svg\\?react$': '<rootDir>/config/jest.svgImportTransformer.js',
    '\\?worker$': '<rootDir>/config/jest.noopImportTransformer.js',
    '^@store$': '<rootDir>/src/store/index.ts',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@libs/(.*)$': '<rootDir>/src/libs/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^store/(.*)$': '<rootDir>/src/store/$1'
  },
  rootDir: '..',
  setupFiles: ['dotenv/config', '<rootDir>/config/jest.setup.js'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/**/*.test.t{s,sx}'],
  transform: {
    '.*\\.(j|t)sx?$': [
      '@swc/jest',
      {
        jsc: {
          baseUrl: './src',
          paths: {
            '@api/*': ['api/*'],
            '@components/*': ['components/*'],
            '@constants/*': ['constants/*'],
            '@features/*': ['features/*'],
            '@hooks/*': ['hooks/*'],
            '@libs/*': ['libs/*'],
            '@pages/*': ['pages/*'],
            '@store': ['store/index.ts'],
            '@store/*': ['store/*'],
            '@utils/*': ['utils/*']
          },
          transform: {
            optimizer: {
              globals: {
                vars: {
                  'import.meta.env': 'process.env'
                }
              }
            },
            react: {
              runtime: 'automatic'
            }
          }
        }
      }
    ],
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/jest.fileTransformer.js'
  },
  transformIgnorePatterns: ['node_modules/(?!ol)/']
}
