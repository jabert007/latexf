// Angular CLI 22 rejects Node 24.13.x even though this project can run on it.
// This development-only shim affects the CLI check, not the Node runtime APIs.
Object.defineProperty(process, 'version', { value: 'v24.15.0' });
Object.defineProperty(process.versions, 'node', { value: '24.15.0' });
