import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
    plugins: [sveltekit()],
    test: {
        globals: true,
        environment: 'jsdom',
        coverage: {
            provider: 'v8', // Use the built-in V8 coverage provider
            reporter: ['text', 'html'], // Generate text summary and HTML reports
            all: true, // Include all files, even untested ones
            include: ['src/**/*.{ts,svelte}'], // Include Svelte and TypeScript files
            exclude: ['node_modules', 'tests'], // Exclude unnecessary directories
        },
    },
});
