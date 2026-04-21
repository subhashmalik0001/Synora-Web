import type { Config } from 'jest';

const config: Config = {
    projects: [
        {
            displayName: 'api',
            testMatch: ['<rootDir>/apps/web/**/*.test.ts'],
            transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/apps/web/tsconfig.json' }] },
            testEnvironment: 'node',
            moduleNameMapper: {
                '^@/(.*)$': '<rootDir>/apps/web/src/$1',
                '^@paygate/db/(.*)$': '<rootDir>/packages/db/src/$1',
                '^@paygate/db$': '<rootDir>/packages/db/src/index',
                '^@paygate/queue$': '<rootDir>/packages/queue/src/index',
                '^@paygate/queue/(.*)$': '<rootDir>/packages/queue/src/$1',
            },
        },
        {
            displayName: 'bot',
            testMatch: ['<rootDir>/apps/telegram-bot/**/*.test.ts'],
            transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/apps/telegram-bot/tsconfig.json' }] },
            testEnvironment: 'node',
            moduleNameMapper: {
                '^@/(.*)$': '<rootDir>/apps/telegram-bot/src/$1',
                '^@paygate/db/(.*)$': '<rootDir>/packages/db/src/$1',
                '^@paygate/db$': '<rootDir>/packages/db/src/index',
                '^@paygate/queue$': '<rootDir>/packages/queue/src/index',
                '^@paygate/queue/(.*)$': '<rootDir>/packages/queue/src/$1',
            },
        },
    ],
};
export default config;