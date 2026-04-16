muhiqbalhakim@Muhammads-MacBook-Pro ganrouter % clear











































































muhiqbalhakim@Muhammads-MacBook-Pro ganrouter % npm run dev

> ganrouter-app@0.3.91 dev
> next dev --webpack --port 20128

▲ Next.js 16.2.4 (webpack)
- Local:         http://localhost:20128
- Network:       http://192.168.100.149:20128
- Environments: .env
✓ Ready in 297ms

 GET /login 200 in 2.1s (next.js: 1789ms, application-code: 286ms)
 GET /login 200 in 38ms (next.js: 3ms, application-code: 35ms)
 GET /login 200 in 21ms (next.js: 1137µs, application-code: 20ms)
[ServerInit] Error initializing outbound proxy: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getSettings (src/lib/localDb.js:589:3)
    at async ensureOutboundProxyInitialized (src/lib/network/initOutboundProxy.js:10:22)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 317,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 64 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 65.\n' +
    'Process 65 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 64.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
[PG] Schema initialized
 GET /manifest.webmanifest 200 in 2.4s (next.js: 2.3s, application-code: 79ms)
 GET /login 200 in 2.7s (next.js: 2.3s, application-code: 374ms)
 GET /manifest.webmanifest 200 in 3ms (next.js: 1061µs, application-code: 1772µs)
[ServerInit] Error initializing outbound proxy: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getSettings (src/lib/localDb.js:589:3)
    at async ensureOutboundProxyInitialized (src/lib/network/initOutboundProxy.js:10:22)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 317,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 66 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 68.\n' +
    'Process 68 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 66.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
[InitApp] Error: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getSettings (src/lib/localDb.js:589:3)
    at async initializeApp (src/shared/services/initializeApp.js:76:22)
    at async ensureAppInitialized (src/lib/initCloudSync.js:8:7)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 317,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 67 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 66.\n' +
    'Process 66 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 67.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
[PG] Schema initialized
[PG] Schema initialized
 GET /api/settings 200 in 1825ms (next.js: 287ms, proxy.ts: 1507ms, application-code: 30ms)
[PG] Schema initialized
 POST /api/auth/login 200 in 477ms (next.js: 446ms, application-code: 31ms)
[PG] Schema initialized
 GET /dashboard 200 in 1162ms (next.js: 956ms, proxy.ts: 72ms, application-code: 134ms)
[InitApp] Error: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getSettings (src/lib/localDb.js:589:3)
    at async initializeApp (src/shared/services/initializeApp.js:76:22)
    at async ensureAppInitialized (src/lib/initCloudSync.js:8:7)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 317,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 76 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 75.\n' +
    'Process 75 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 76.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
[PG] Schema initialized
[PG] Schema initialized
 GET /dashboard 200 in 1083ms (next.js: 3ms, proxy.ts: 1043ms, application-code: 38ms)
 GET /api/version 200 in 1588ms (next.js: 1279ms, application-code: 310ms)
 GET /api/version 200 in 294ms (next.js: 3ms, application-code: 291ms)
 GET /api/version 200 in 225ms (next.js: 6ms, application-code: 219ms)
Tunnel status error: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getSettings (src/lib/localDb.js:589:3)
    at async getTailscaleStatus (src/lib/tunnel/tunnelManager.js:203:20)
    at async GET (src/app/api/tunnel/status/route.js:6:33)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 317,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 79 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 78.\n' +
    'Process 78 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 79.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
 GET /api/tunnel/status 500 in 2.4s (next.js: 1277ms, application-code: 1145ms)
 GET /api/version 200 in 312ms (next.js: 4ms, application-code: 308ms)
Tunnel status error: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getSettings (src/lib/localDb.js:589:3)
    at async getTunnelStatus (src/lib/tunnel/tunnelManager.js:143:20)
    at async GET (src/app/api/tunnel/status/route.js:6:33)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 317,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 84 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 81.\n' +
    'Process 81 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 84.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
 GET /api/tunnel/status 500 in 1978ms (next.js: 82ms, application-code: 1896ms)
Error getting settings: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getSettings (src/lib/localDb.js:589:3)
    at async GET (src/app/api/settings/route.js:8:22)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 317,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 81 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 82.\n' +
    'Process 82 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 81.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
 GET /api/settings 500 in 4.5s (next.js: 10ms, proxy.ts: 1297ms, application-code: 3.2s)
[PG] Schema initialized
 GET /api/keys 200 in 4.5s (next.js: 265ms, proxy.ts: 1316ms, application-code: 3.0s)
 GET /api/settings 200 in 25ms (next.js: 8ms, proxy.ts: 6ms, application-code: 10ms)
 GET /manifest.webmanifest 200 in 7ms (next.js: 5ms, application-code: 2ms)
 GET /api/settings 200 in 17ms (next.js: 1364µs, proxy.ts: 12ms, application-code: 4ms)
 GET /api/keys 200 in 48ms (next.js: 3ms, proxy.ts: 15ms, application-code: 29ms)
 GET /api/settings 200 in 13ms (next.js: 1869µs, proxy.ts: 7ms, application-code: 3ms)
 GET /api/settings 200 in 6ms (next.js: 886µs, proxy.ts: 3ms, application-code: 2ms)
 GET /api/settings 200 in 6ms (next.js: 727µs, proxy.ts: 3ms, application-code: 1955µs)
Tunnel enable error: TypeError: fetch failed
    at async registerTunnelUrl (src/lib/tunnel/tunnelManager.js:41:3)
    at async enableTunnel (src/lib/tunnel/tunnelManager.js:75:3)
    at async POST (src/app/api/tunnel/enable/route.js:8:20)
  39 |
  40 | async function registerTunnelUrl(shortId, tunnelUrl) {
> 41 |   await fetch(`${WORKER_URL}/api/tunnel/register`, {
     |   ^
  42 |     method: "POST",
  43 |     headers: { "Content-Type": "application/json" },
  44 |     body: JSON.stringify({ shortId, tunnelUrl }) {
  [cause]: Error: getaddrinfo ENOTFOUND ganrouter.com
      at ignore-listed frames {
    errno: -3008,
    code: 'ENOTFOUND',
    syscall: 'getaddrinfo',
    hostname: 'ganrouter.com'
  }
}
 POST /api/tunnel/enable 500 in 4.6s (next.js: 449ms, application-code: 4.1s)
 GET /dashboard/providers 200 in 907ms (next.js: 781ms, proxy.ts: 33ms, application-code: 94ms)
 GET /manifest.webmanifest 200 in 621ms (next.js: 612ms, application-code: 9ms)
[ServerInit] Error initializing outbound proxy: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getSettings (src/lib/localDb.js:589:3)
    at async ensureOutboundProxyInitialized (src/lib/network/initOutboundProxy.js:10:22)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 317,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 90 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 89.\n' +
    'Process 89 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 90.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
[PG] Schema initialized
Error fetching provider nodes: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getProviderNodes (src/lib/localDb.js:274:3)
    at async GET (src/app/api/provider-nodes/route.js:19:19)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 317,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 92 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 91.\n' +
    'Process 91 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 92.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
 GET /api/provider-nodes 500 in 1960ms (next.js: 622ms, application-code: 1338ms)
[PG] Schema initialized
 GET /api/providers 200 in 1971ms (next.js: 624ms, application-code: 1346ms)
 GET /api/provider-nodes 200 in 9ms (next.js: 859µs, application-code: 8ms)
 GET /api/providers 200 in 5ms (next.js: 794µs, application-code: 4ms)
[PG] Schema initialized
 GET /api/models/availability 200 in 301ms (next.js: 273ms, application-code: 28ms)
 GET /api/models/availability 200 in 3ms (next.js: 788µs, application-code: 2ms)
 GET /dashboard/providers/claude 200 in 1631ms (next.js: 1542ms, proxy.ts: 8ms, application-code: 81ms)
[InitApp] Error: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getSettings (src/lib/localDb.js:589:3)
    at async initializeApp (src/shared/services/initializeApp.js:76:22)
    at async ensureAppInitialized (src/lib/initCloudSync.js:8:7)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 317,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 98 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 96.\n' +
    'Process 96 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 98.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
[PG] Schema initialized
Error fetching providers: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getProviderConnections (src/lib/localDb.js:77:3)
    at async GET (src/app/api/providers/route.js:51:25)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 420,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 101 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 97.\n' +
    'Process 97 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 99.\n' +
    'Process 99 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 101.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
 GET /api/providers 500 in 1803ms (next.js: 707µs, application-code: 1803ms)
Error fetching aliases: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getModelAliases (src/lib/localDb.js:420:3)
    at async GET (src/app/api/models/alias/route.js:9:21)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 422,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 103 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 97.\n' +
    'Process 97 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 100.\n' +
    'Process 100 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 103.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
 GET /api/models/alias 500 in 1851ms (next.js: 633ms, application-code: 1218ms)
Error fetching provider nodes: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getProviderNodes (src/lib/localDb.js:274:3)
    at async GET (src/app/api/provider-nodes/route.js:19:19)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 317,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 99 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 97.\n' +
    'Process 97 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 99.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
 GET /api/provider-nodes 500 in 1900ms (next.js: 5ms, application-code: 1895ms)
Error fetching providers: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getProviderConnections (src/lib/localDb.js:77:3)
    at async GET (src/app/api/providers/route.js:51:25)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 319,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 100 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 97.\n' +
    'Process 97 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 100.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
 GET /api/providers 500 in 1952ms (next.js: 11ms, application-code: 1941ms)
Error fetching proxy pools: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getProxyPools (src/lib/localDb.js:337:3)
    at async GET (src/app/api/proxy-pools/route.js:56:24)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 319,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 102 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 97.\n' +
    'Process 97 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 102.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
 GET /api/proxy-pools?isActive=true 500 in 1977ms (next.js: 635ms, application-code: 1343ms)
Error getting settings: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getSettings (src/lib/localDb.js:589:3)
    at async GET (src/app/api/settings/route.js:8:22)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 319,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 104 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 97.\n' +
    'Process 97 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 104.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
 GET /api/settings 500 in 2.0s (next.js: 9ms, proxy.ts: 671ms, application-code: 1360ms)
 GET /manifest.webmanifest 200 in 6ms (next.js: 3ms, application-code: 2ms)
Error fetching proxy pools: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getProxyPools (src/lib/localDb.js:337:3)
    at async GET (src/app/api/proxy-pools/route.js:56:24)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 321,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 106 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 105.\n' +
    'Process 105 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 106.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
 GET /api/proxy-pools?isActive=true 500 in 1095ms (next.js: 719µs, application-code: 1095ms)
Error getting settings: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getSettings (src/lib/localDb.js:589:3)
    at async GET (src/app/api/settings/route.js:8:22)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 321,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 108 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 105.\n' +
    'Process 105 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 108.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
 GET /api/settings 500 in 2.1s (next.js: 1590µs, proxy.ts: 24ms, application-code: 2.1s)
Error fetching provider nodes: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getProviderNodes (src/lib/localDb.js:274:3)
    at async GET (src/app/api/provider-nodes/route.js:19:19)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 321,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 105 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 107.\n' +
    'Process 107 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 105.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
 GET /api/provider-nodes 500 in 2.1s (next.js: 4ms, application-code: 2.1s)
[PG] Schema initialized
 GET /api/models/alias 200 in 2.1s (next.js: 732µs, application-code: 2.1s)
 GET /api/oauth/claude/authorize?redirect_uri=http%3A%2F%2Flocalhost%3A20128%2Fcallback 200 in 1472ms (next.js: 1466ms, application-code: 6ms)
 GET /dashboard/providers/claude 200 in 578ms (next.js: 87ms, proxy.ts: 36ms, application-code: 455ms)
[PG] Schema initialized
[PG] Schema initialized
 GET /manifest.webmanifest 200 in 7ms (next.js: 4ms, application-code: 3ms)
 GET /dashboard/providers/claude 200 in 65ms (next.js: 8ms, proxy.ts: 8ms, application-code: 49ms)
 GET /manifest.webmanifest 200 in 5ms (next.js: 1378µs, application-code: 4ms)
 GET /api/provider-nodes 200 in 54ms (next.js: 21ms, application-code: 33ms)
 GET /api/providers 200 in 74ms (next.js: 7ms, application-code: 67ms)
 GET /api/settings 200 in 129ms (next.js: 23ms, proxy.ts: 91ms, application-code: 15ms)
 GET /api/models/alias 200 in 18ms (next.js: 7ms, application-code: 12ms)
 GET /api/settings 200 in 143ms (next.js: 5ms, proxy.ts: 123ms, application-code: 14ms)
 GET /api/settings 200 in 34ms (next.js: 1268µs, proxy.ts: 26ms, application-code: 6ms)
 GET /api/proxy-pools?isActive=true 200 in 127ms (next.js: 11ms, application-code: 116ms)
 GET /api/version 200 in 360ms (next.js: 6ms, application-code: 355ms)
 GET /api/version 200 in 221ms (next.js: 781µs, application-code: 220ms)
 GET /api/provider-nodes 200 in 7ms (next.js: 629µs, application-code: 6ms)
 GET /api/providers 200 in 13ms (next.js: 1094µs, application-code: 11ms)
 GET /api/proxy-pools?isActive=true 200 in 7ms (next.js: 643µs, application-code: 7ms)
 GET /api/settings 200 in 37ms (next.js: 5ms, proxy.ts: 26ms, application-code: 6ms)
 GET /api/models/alias 200 in 7ms (next.js: 982µs, application-code: 6ms)
 GET /api/settings 200 in 21ms (next.js: 5ms, proxy.ts: 11ms, application-code: 4ms)
 GET /api/settings 200 in 11ms (next.js: 1855µs, proxy.ts: 6ms, application-code: 3ms)
 GET /api/version 200 in 211ms (next.js: 6ms, application-code: 205ms)
 GET /api/version 200 in 236ms (next.js: 8ms, application-code: 228ms)
 GET /api/oauth/claude/authorize?redirect_uri=http%3A%2F%2Flocalhost%3A20128%2Fcallback 200 in 15ms (next.js: 7ms, application-code: 8ms)
 GET /callback?code=j8qosiZEG7f114aKfj5YbgfASi9xLUEGr05AOtFFPng8RiZX&state=aP0hRHexZEzS2gyf_OHJ2mk9C8Y9zCpX5oXZqr6v0h4 200 in 754ms (next.js: 597ms, application-code: 157ms)
 GET /manifest.webmanifest 200 in 18ms (next.js: 15ms, application-code: 3ms)
[InitApp] Error: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getSettings (src/lib/localDb.js:589:3)
    at async initializeApp (src/shared/services/initializeApp.js:76:22)
    at async ensureAppInitialized (src/lib/initCloudSync.js:8:7)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 321,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 120 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 119.\n' +
    'Process 119 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 120.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
[PG] Schema initialized
 POST /api/oauth/claude/exchange 200 in 145ms (next.js: 117ms, application-code: 28ms)
 GET /dashboard/providers/claude 200 in 517ms (next.js: 36ms, proxy.ts: 16ms, application-code: 465ms)
 GET /manifest.webmanifest 200 in 7ms (next.js: 3ms, application-code: 3ms)
 GET /dashboard/providers/claude 200 in 625ms (next.js: 16ms, proxy.ts: 514ms, application-code: 94ms)
 GET /manifest.webmanifest 200 in 7ms (next.js: 5ms, application-code: 2ms)
 GET /api/provider-nodes 200 in 67ms (next.js: 4ms, application-code: 63ms)
 GET /api/proxy-pools?isActive=true 200 in 64ms (next.js: 3ms, application-code: 61ms)
 GET /api/provider-nodes 200 in 43ms (next.js: 1049µs, application-code: 42ms)
 GET /api/providers 200 in 78ms (next.js: 4ms, application-code: 74ms)
 GET /api/settings 200 in 25ms (next.js: 3ms, proxy.ts: 11ms, application-code: 10ms)
 GET /api/settings 200 in 97ms (next.js: 14ms, proxy.ts: 43ms, application-code: 41ms)
 GET /api/settings 200 in 69ms (next.js: 16ms, proxy.ts: 14ms, application-code: 38ms)
 GET /api/proxy-pools?isActive=true 200 in 38ms (next.js: 864µs, application-code: 37ms)
 GET /api/models/alias 200 in 14ms (next.js: 4ms, application-code: 11ms)
 GET /api/providers 200 in 67ms (next.js: 851µs, application-code: 66ms)
 GET /api/models/alias 200 in 7ms (next.js: 2ms, application-code: 5ms)
 GET /api/settings 200 in 78ms (next.js: 6ms, proxy.ts: 32ms, application-code: 41ms)
 GET /api/settings 200 in 15ms (next.js: 1352µs, proxy.ts: 7ms, application-code: 6ms)
 GET /api/settings 200 in 13ms (next.js: 1325µs, proxy.ts: 9ms, application-code: 3ms)
 GET /api/version 200 in 278ms (next.js: 4ms, application-code: 274ms)
 GET /api/version 200 in 273ms (next.js: 1134µs, application-code: 272ms)
 GET /api/version 200 in 221ms (next.js: 753µs, application-code: 220ms)
 GET /api/version 200 in 215ms (next.js: 1096µs, application-code: 214ms)
 GET /dashboard/providers/claude 200 in 60ms (next.js: 12ms, proxy.ts: 14ms, application-code: 34ms)
 GET /manifest.webmanifest 200 in 3ms (next.js: 1240µs, application-code: 1757µs)
 GET /api/provider-nodes 200 in 9ms (next.js: 559µs, application-code: 8ms)
 GET /api/proxy-pools?isActive=true 200 in 8ms (next.js: 913µs, application-code: 7ms)
 GET /api/providers 200 in 14ms (next.js: 962µs, application-code: 13ms)
 GET /api/settings 200 in 29ms (next.js: 3ms, proxy.ts: 19ms, application-code: 7ms)
 GET /api/settings 200 in 30ms (next.js: 3ms, proxy.ts: 21ms, application-code: 6ms)
 GET /api/models/alias 200 in 7ms (next.js: 822µs, application-code: 6ms)
 GET /api/settings 200 in 10ms (next.js: 1141µs, proxy.ts: 6ms, application-code: 3ms)
 GET /api/version 200 in 265ms (next.js: 886µs, application-code: 264ms)
 GET /api/version 200 in 324ms (next.js: 7ms, application-code: 317ms)
[browser] Uncaught Error: Internal Next.js error: Router action dispatched before initialization.
 GET /dashboard/endpoint 200 in 1213ms (next.js: 838ms, proxy.ts: 38ms, application-code: 337ms)
 GET /manifest.webmanifest 200 in 18ms (next.js: 14ms, application-code: 4ms)
[ServerInit] Error initializing outbound proxy: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getSettings (src/lib/localDb.js:589:3)
    at async ensureOutboundProxyInitialized (src/lib/network/initOutboundProxy.js:10:22)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 321,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 140 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 139.\n' +
    'Process 139 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 140.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
[PG] Schema initialized
 GET /api/version 200 in 305ms (next.js: 6ms, application-code: 299ms)
 GET /api/version 200 in 2.6s (next.js: 2.3s, application-code: 319ms)
Tunnel status error: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getSettings (src/lib/localDb.js:589:3)
    at async getTailscaleStatus (src/lib/tunnel/tunnelManager.js:203:20)
    at async GET (src/app/api/tunnel/status/route.js:6:33)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 321,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 144 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 143.\n' +
    'Process 143 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 144.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
 GET /api/tunnel/status 500 in 4.5s (next.js: 2.6s, application-code: 1916ms)
Error getting settings: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getSettings (src/lib/localDb.js:589:3)
    at async GET (src/app/api/settings/route.js:8:22)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 321,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 143 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 142.\n' +
    'Process 142 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 143.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
 GET /api/settings 500 in 5.1s (next.js: 2.6s, proxy.ts: 48ms, application-code: 2.5s)
Error fetching keys: error: deadlock detected
    at async initSchema (src/lib/pgPool.js:47:3)
    at async ensureSchema (src/lib/localDb.js:69:5)
    at async getApiKeys (src/lib/localDb.js:527:3)
    at async GET (src/app/api/keys/route.js:10:18)
  45 |   const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  46 |
> 47 |   await query(schemaSql);
     |   ^
  48 |   initialized = true;
  49 |   console.log("[PG] Schema initialized");
  50 | } {
  length: 321,
  severity: 'ERROR',
  code: '40P01',
  detail: 'Process 145 waits for AccessExclusiveLock on relation 16439 of database 16384; blocked by process 142.\n' +
    'Process 142 waits for AccessExclusiveLock on relation 16482 of database 16384; blocked by process 145.',
  hint: 'See server log for query details.',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'deadlock.c',
  line: '1147',
  routine: 'DeadLockReport'
}
 GET /api/keys 500 in 6.5s (next.js: 2.0s, proxy.ts: 2.6s, application-code: 1838ms)
[PG] Schema initialized
[PG] Schema initialized
 GET /api/settings 200 in 1358ms (next.js: 8ms, proxy.ts: 9ms, application-code: 1341ms)
 GET /api/settings 200 in 11ms (next.js: 1678µs, proxy.ts: 6ms, application-code: 4ms)

