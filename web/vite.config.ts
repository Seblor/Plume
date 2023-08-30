import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
	server: {
		port: 8080,
		host: 'localhost.direct'
	},
	plugins: [
		sveltekit(),
		tsconfigPaths()
	],
	resolve: {
		preserveSymlinks: true,
	}
});
