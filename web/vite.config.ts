import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths'
import fs from 'fs';

export default defineConfig({
	server: {
		port: 8080,
		host: 'localhost.direct',
		https: process.env.NODE_ENV?.startsWith('dev') ? {
			// You can find localhost.direct's SSL certificate here : https://github.com/Upinel/localhost.direct
			key: fs.readFileSync(`${__dirname}/cert/key.pem`),
			cert: fs.readFileSync(`${__dirname}/cert/cert.pem`)
		} : undefined
	},
	plugins: [
		sveltekit(),
		tsconfigPaths()
	],
	resolve: {
		preserveSymlinks: true,
	}
});
