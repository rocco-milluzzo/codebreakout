import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            include: ['src/**/*.js'],
            exclude: ['src/main.js'], // Main has too many DOM dependencies for unit tests
        },
        include: ['tests/**/*.test.js'],
    },
});
