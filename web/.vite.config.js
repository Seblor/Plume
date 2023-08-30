import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
export default defineConfig({
    server: {
        port: 8080,
        host: 'localhost.direct'
    },
    plugins: [sveltekit()],
    resolve: {
        preserveSymlinks: true,
    }
});
//# sourceMappingURL=vite.config.js.map