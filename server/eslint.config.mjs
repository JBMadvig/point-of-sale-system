import { fileURLToPath } from 'node:url';
import path from 'node:path';

import eslint from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
    {
        ignores: ['dist/**', 'node_modules/**', 'eslint.config.mjs'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    importX.flatConfigs.recommended,
    importX.flatConfigs.typescript,
    {
        files: ['**/*.ts', '**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: __dirname,
            },
        },
        settings: {
            'import-x/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json',
                    extensions: ['.ts', '.js'],
                },
                node: {
                    extensions: ['.js', '.ts'],
                },
            },
        },
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            quotes: [2, 'single', { avoidEscape: true }],
            'comma-dangle': [
                'error',
                {
                    arrays: 'always-multiline',
                    objects: 'always-multiline',
                    imports: 'always-multiline',
                    exports: 'always-multiline',
                    functions: 'always-multiline',
                },
            ],
            semi: ['error', 'always'],
            indent: ['error', 4, { SwitchCase: 1 }],
            'eol-last': ['error', 'always'],
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-spacing': ['error', 'always'],
            'no-trailing-spaces': 'error',
            'comma-spacing': ['error', { before: false, after: true }],
            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        ['^@(?!(lib)\\b).*', '^[a-zA-Z].*'],
                        ['^@.*', '.*'],
                    ],
                },
            ],
        },
    },
);
