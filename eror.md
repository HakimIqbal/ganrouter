muhiqbalhakim@Muhammads-MacBook-Pro ganrouter % npm run dev

> ganrouter-app@0.3.91 dev
> next dev --webpack --port 20128

▲ Next.js 16.2.4 (webpack)
- Local:         http://localhost:20128
- Network:       http://192.168.100.149:20128
- Environments: .env
✓ Ready in 297ms

[PG] Schema initialized
 GET /dashboard/endpoint 200 in 3.1s (next.js: 2.6s, proxy.ts: 204ms, application-code: 330ms)
[PG] Schema initialized
 GET /manifest.webmanifest 200 in 1912ms (next.js: 1882ms, application-code: 30ms)
[PG] Schema initialized
 GET /api/version 200 in 1267ms (next.js: 737ms, application-code: 530ms)
 GET /api/tunnel/status 200 in 1289ms (next.js: 767ms, application-code: 522ms)
 GET /dashboard/endpoint 200 in 484ms (next.js: 107ms, proxy.ts: 24ms, application-code: 353ms)
 GET /dashboard/endpoint 200 in 703ms (next.js: 36ms, proxy.ts: 227ms, application-code: 440ms)
 GET /manifest.webmanifest 200 in 526ms (next.js: 518ms, application-code: 8ms)
[PG] Schema initialized
[PG] Schema initialized
 GET /api/tunnel/status 200 in 65ms (next.js: 48ms, application-code: 16ms)
 GET /api/settings 200 in 96ms (next.js: 1412µs, proxy.ts: 90ms, application-code: 4ms)
 GET /api/settings 200 in 8ms (next.js: 1546µs, proxy.ts: 4ms, application-code: 3ms)
 GET /api/keys 200 in 112ms (next.js: 1377µs, proxy.ts: 106ms, application-code: 4ms)
 GET /api/settings 200 in 11ms (next.js: 1416µs, proxy.ts: 5ms, application-code: 4ms)
 GET /api/version 200 in 237ms (next.js: 10ms, application-code: 227ms)
 GET /api/version 200 in 237ms (next.js: 1038µs, application-code: 236ms)
 GET /dashboard/providers 200 in 1033ms (next.js: 894ms, proxy.ts: 21ms, application-code: 118ms)
[PG] Schema initialized
 GET /manifest.webmanifest 200 in 498ms (next.js: 491ms, application-code: 7ms)
[PG] Schema initialized
 GET /api/providers 200 in 549ms (next.js: 524ms, application-code: 24ms)
 GET /api/providers 200 in 4ms (next.js: 871µs, application-code: 3ms)
 GET /api/provider-nodes 200 in 553ms (next.js: 523ms, application-code: 30ms)
 GET /api/provider-nodes 200 in 3ms (next.js: 817µs, application-code: 2ms)
[PG] Schema initialized
 GET /api/models/availability 200 in 262ms (next.js: 243ms, application-code: 19ms)
 GET /api/models/availability 200 in 3ms (next.js: 858µs, application-code: 2ms)
 GET /dashboard/endpoint 200 in 202ms (next.js: 94ms, proxy.ts: 19ms, application-code: 89ms)
 GET /api/tunnel/status 200 in 19ms (next.js: 6ms, application-code: 13ms)
 GET /manifest.webmanifest 200 in 5ms (next.js: 3ms, application-code: 2ms)
 GET /api/keys 200 in 44ms (next.js: 6ms, proxy.ts: 20ms, application-code: 18ms)
 GET /api/settings 200 in 45ms (next.js: 14ms, proxy.ts: 21ms, application-code: 10ms)
 GET /api/settings 200 in 10ms (next.js: 1351µs, proxy.ts: 5ms, application-code: 4ms)
 GET /api/keys 200 in 11ms (next.js: 3ms, proxy.ts: 5ms, application-code: 3ms)
 GET /api/tunnel/status 200 in 30ms (next.js: 584µs, application-code: 30ms)
 POST /api/keys 201 in 57ms (next.js: 1201µs, proxy.ts: 25ms, application-code: 31ms)
 GET /api/keys 200 in 11ms (next.js: 992µs, proxy.ts: 5ms, application-code: 5ms)
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
 POST /api/tunnel/enable 500 in 4.6s (next.js: 403ms, application-code: 4.2s)
 GET /api/tunnel/tailscale-check 200 in 552ms (next.js: 515ms, application-code: 37ms)
[PG] Schema initialized
Tailscale install error: Error: Password:Sorry, try again.
Password:
sudo: no password was provided
sudo: 1 incorrect password attempt

    at ChildProcess.eval (src/mitm/dns/dnsConfig.js:91:19)
  89 |     child.on("close", (code) => {
  90 |       if (code === 0) resolve(stdout);
> 91 |       else reject(new Error(stderr || `Exit code ${code}`));
     |                   ^
  92 |     });
  93 |
  94 |     if (useSudo) {
 POST /api/tunnel/tailscale-install 200 in 9.5s (next.js: 442ms, application-code: 9.1s)
 GET /dashboard/providers 200 in 133ms (next.js: 67ms, proxy.ts: 25ms, application-code: 41ms)
 GET /manifest.webmanifest 200 in 7ms (next.js: 4ms, application-code: 3ms)
 GET /api/providers 200 in 32ms (next.js: 10ms, application-code: 22ms)
 GET /api/providers 200 in 5ms (next.js: 971µs, application-code: 4ms)
 GET /api/provider-nodes 200 in 28ms (next.js: 5ms, application-code: 23ms)
 GET /api/provider-nodes 200 in 4ms (next.js: 950µs, application-code: 3ms)
 GET /api/models/availability 200 in 12ms (next.js: 5ms, application-code: 7ms)
 GET /api/models/availability 200 in 6ms (next.js: 1043µs, application-code: 5ms)
[PG] Schema initialized
 GET /dashboard/providers/kilocode 200 in 1519ms (next.js: 1428ms, proxy.ts: 9ms, application-code: 82ms)
[PG] Schema initialized
[PG] Schema initialized
 GET /api/provider-nodes 200 in 655ms (next.js: 626ms, application-code: 29ms)
 GET /api/providers 200 in 5ms (next.js: 1220µs, application-code: 4ms)
 GET /api/settings 200 in 678ms (next.js: 8ms, proxy.ts: 643ms, application-code: 27ms)
 GET /api/models/alias 200 in 668ms (next.js: 626ms, application-code: 43ms)
 GET /api/proxy-pools?isActive=true 200 in 671ms (next.js: 626ms, application-code: 44ms)
 GET /api/provider-nodes 200 in 6ms (next.js: 937µs, application-code: 5ms)
 GET /api/providers 200 in 674ms (next.js: 627ms, application-code: 47ms)
 GET /api/proxy-pools?isActive=true 200 in 4ms (next.js: 582µs, application-code: 4ms)
 GET /api/models/alias 200 in 4ms (next.js: 495µs, application-code: 3ms)
 GET /manifest.webmanifest 200 in 6ms (next.js: 3ms, application-code: 2ms)
 GET /api/settings 200 in 23ms (next.js: 11ms, proxy.ts: 8ms, application-code: 4ms)
 GET /api/providers/kilo/free-models 200 in 1339ms (next.js: 627ms, application-code: 712ms)
 GET /api/providers/kilo/free-models 200 in 7ms (next.js: 2ms, application-code: 4ms)
 GET /dashboard/combos 200 in 722ms (next.js: 628ms, proxy.ts: 12ms, application-code: 82ms)
[PG] Schema initialized
 GET /api/providers 200 in 23ms (next.js: 8ms, application-code: 15ms)
 GET /manifest.webmanifest 200 in 602ms (next.js: 596ms, application-code: 6ms)
[PG] Schema initialized
 GET /api/providers 200 in 626ms (next.js: 602ms, application-code: 24ms)
 GET /api/settings 200 in 664ms (next.js: 6ms, proxy.ts: 639ms, application-code: 20ms)
 GET /api/combos 200 in 664ms (next.js: 635ms, application-code: 30ms)
 GET /api/combos 200 in 6ms (next.js: 1261µs, application-code: 5ms)
 GET /api/settings 200 in 9ms (next.js: 1172µs, proxy.ts: 5ms, application-code: 3ms)
 GET /dashboard/usage 200 in 648ms (next.js: 561ms, proxy.ts: 13ms, application-code: 75ms)
[PG] Schema initialized
 GET /manifest.webmanifest 200 in 5ms (next.js: 3ms, application-code: 2ms)
 GET /api/providers 200 in 28ms (next.js: 8ms, application-code: 20ms)
[PG] Schema initialized
 GET /api/providers 200 in 837ms (next.js: 809ms, application-code: 28ms)
 GET /api/usage/stats?period=7d 200 in 870ms (next.js: 828ms, application-code: 42ms)
 GET /api/usage/stats?period=7d 200 in 7ms (next.js: 994µs, application-code: 6ms)
 GET /api/usage/chart?period=7d 200 in 374ms (next.js: 337ms, application-code: 37ms)
 GET /api/usage/chart?period=7d 200 in 3ms (next.js: 693µs, application-code: 3ms)
 GET /api/usage/stream 200 in 113s (next.js: 827ms, application-code: 112s)
 GET /dashboard/usage?tab=details 200 in 225ms (next.js: 81ms, proxy.ts: 22ms, application-code: 122ms)
 GET /manifest.webmanifest 200 in 11ms (next.js: 7ms, application-code: 4ms)
[PG] Schema initialized
 GET /dashboard/usage?tab=details 200 in 157ms (next.js: 53ms, proxy.ts: 15ms, application-code: 89ms)
 GET /api/usage/request-details?page=1&pageSize=20 200 in 1326ms (next.js: 1152ms, application-code: 174ms)
[PG] Schema initialized
 GET /api/usage/request-details?page=1&pageSize=20 200 in 4ms (next.js: 788µs, application-code: 3ms)
 GET /api/usage/providers 200 in 1422ms (next.js: 1220ms, application-code: 202ms)
 GET /manifest.webmanifest 200 in 9ms (next.js: 5ms, application-code: 4ms)
 GET /api/usage/providers 200 in 11ms (next.js: 709µs, application-code: 10ms)
[PG] Schema initialized
 GET /api/provider-nodes 200 in 327ms (next.js: 306ms, application-code: 21ms)
 GET /api/provider-nodes 200 in 3ms (next.js: 797µs, application-code: 2ms)
 GET /dashboard/quota 200 in 1122ms (next.js: 1033ms, proxy.ts: 9ms, application-code: 80ms)
[PG] Schema initialized
 GET /manifest.webmanifest 200 in 771ms (next.js: 764ms, application-code: 6ms)
[PG] Schema initialized
 GET /api/proxy-pools?isActive=true 200 in 827ms (next.js: 783ms, application-code: 45ms)
 GET /api/proxy-pools?isActive=true 200 in 855ms (next.js: 776ms, application-code: 79ms)
[PG] Schema initialized
 GET /api/providers/client 200 in 1163ms (next.js: 343ms, proxy.ts: 796ms, application-code: 24ms)
 GET /api/providers/client 200 in 17ms (next.js: 1889µs, proxy.ts: 7ms, application-code: 8ms)
[PG] Schema initialized
 GET /api/usage/e458470b-96ca-44c1-9be9-1867a79749ab 200 in 1822ms (next.js: 1307ms, application-code: 516ms)
 GET /api/usage/e458470b-96ca-44c1-9be9-1867a79749ab 200 in 405ms (next.js: 4ms, application-code: 401ms)
 GET /dashboard/mitm 200 in 990ms (next.js: 854ms, proxy.ts: 31ms, application-code: 104ms)
[PG] Schema initialized
[PG] Schema initialized
 GET /api/providers 200 in 860ms (next.js: 784ms, application-code: 76ms)
 GET /api/models/alias 200 in 953ms (next.js: 774ms, application-code: 179ms)
 GET /api/cli-tools/antigravity-mitm 200 in 975ms (next.js: 795ms, application-code: 180ms)
[PG] Schema initialized
 GET /api/providers 200 in 905ms (next.js: 868ms, application-code: 38ms)
 GET /api/models/alias 200 in 801ms (next.js: 759ms, application-code: 42ms)
 GET /api/settings 200 in 1160ms (next.js: 991ms, proxy.ts: 125ms, application-code: 44ms)
 GET /api/cli-tools/antigravity-mitm 200 in 803ms (next.js: 759ms, application-code: 45ms)
 GET /api/keys 200 in 1877ms (next.js: 1017ms, proxy.ts: 814ms, application-code: 46ms)
 GET /manifest.webmanifest 200 in 6ms (next.js: 4ms, application-code: 1973µs)
 GET /api/settings 200 in 20ms (next.js: 2ms, proxy.ts: 11ms, application-code: 7ms)
 GET /api/keys 200 in 22ms (next.js: 6ms, proxy.ts: 11ms, application-code: 5ms)
[19:21:37] [MITM] 🔐 Generating Root CA...
🔐 Generating Root CA certificate...
✅ Root CA generated successfully
[19:21:37] [MITM] 🔐 Cert: not trusted → installing...
Error starting MITM server: Failed to trust certificate: Certificate install failed
 POST /api/cli-tools/antigravity-mitm 500 in 5.4s (next.js: 6ms, application-code: 5.4s)
[19:21:45] [MITM] ⏹ Stopping server...
[19:21:45] [MITM] 🌐 DNS antigravity: already inactive
[19:21:45] [MITM] 🌐 DNS copilot: already inactive
[19:21:45] [MITM] 🌐 DNS kiro: already inactive
[19:21:45] [MITM] 🌐 DNS cursor: already inactive
 DELETE /api/cli-tools/antigravity-mitm 200 in 21ms (next.js: 5ms, application-code: 15ms)
 GET /api/cli-tools/antigravity-mitm 200 in 61ms (next.js: 1881µs, application-code: 59ms)
 GET /dashboard/cli-tools 200 in 1732ms (next.js: 1545ms, proxy.ts: 42ms, application-code: 144ms)
[PG] Schema initialized
 GET /api/cli-tools/codex-settings 200 in 1066ms (next.js: 1048ms, application-code: 19ms)
 GET /api/cli-tools/claude-settings 200 in 1068ms (next.js: 1048ms, application-code: 20ms)
[PG] Schema initialized
 GET /api/tunnel/status 200 in 3.3s (next.js: 1060ms, application-code: 2.3s)
 GET /api/providers 200 in 3.4s (next.js: 1074ms, application-code: 2.3s)
○ Compiling /api/cli-tools/openclaw-settings ...
 GET /api/cli-tools/openclaw-settings 200 in 817ms (next.js: 800ms, application-code: 17ms)
 GET /api/cli-tools/opencode-settings 200 in 3.1s (next.js: 3.1s, application-code: 18ms)
 GET /api/cli-tools/claude-settings 200 in 807ms (next.js: 788ms, application-code: 19ms)
Error checking droid settings: SyntaxError: Unexpected token '/', "// Factory"... is not valid JSON
    at JSON.parse (<anonymous>)
    at readSettings (src/app/api/cli-tools/droid-settings/route.js:40:17)
    at async GET (src/app/api/cli-tools/droid-settings/route.js:66:22)
  38 |     const settingsPath = getDroidSettingsPath();
  39 |     const content = await fs.readFile(settingsPath, "utf-8");
> 40 |     return JSON.parse(content);
     |                 ^
  41 |   } catch (error) {
  42 |     if (error.code === "ENOENT") return null;
  43 |     throw error;
 GET /api/cli-tools/droid-settings 500 in 3.1s (next.js: 3.1s, application-code: 70ms)
 GET /api/cli-tools/codex-settings 200 in 66ms (next.js: 4ms, application-code: 62ms)
 GET /api/cli-tools/opencode-settings 200 in 10ms (next.js: 702µs, application-code: 9ms)
 GET /api/cli-tools/openclaw-settings 200 in 12ms (next.js: 467µs, application-code: 12ms)
[PG] Schema initialized
 GET /api/settings 200 in 4.3s (next.js: 3.1s, proxy.ts: 1100ms, application-code: 158ms)
Error checking droid settings: SyntaxError: Unexpected token '/', "// Factory"... is not valid JSON
    at JSON.parse (<anonymous>)
    at readSettings (src/app/api/cli-tools/droid-settings/route.js:40:17)
    at async GET (src/app/api/cli-tools/droid-settings/route.js:66:22)
  38 |     const settingsPath = getDroidSettingsPath();
  39 |     const content = await fs.readFile(settingsPath, "utf-8");
> 40 |     return JSON.parse(content);
     |                 ^
  41 |   } catch (error) {
  42 |     if (error.code === "ENOENT") return null;
  43 |     throw error;
 GET /api/cli-tools/droid-settings 500 in 50ms (next.js: 1088µs, application-code: 49ms)
 GET /api/settings 200 in 10ms (next.js: 1736µs, proxy.ts: 5ms, application-code: 3ms)
 GET /api/keys 200 in 3.5s (next.js: 3.0s, proxy.ts: 201ms, application-code: 218ms)
 GET /api/tunnel/status 200 in 2.2s (next.js: 43ms, application-code: 2.2s)
 GET /api/settings 200 in 2.1s (next.js: 1285µs, proxy.ts: 4ms, application-code: 2.1s)
 GET /api/providers 200 in 2.2s (next.js: 11ms, application-code: 2.2s)
 GET /manifest.webmanifest 200 in 2.8s (next.js: 2.8s, application-code: 8ms)
[PG] Schema initialized
 GET /api/models/alias 200 in 1675ms (next.js: 1617ms, application-code: 58ms)
 GET /api/settings 200 in 2.9s (next.js: 15ms, proxy.ts: 2.9s, application-code: 47ms)
 GET /api/keys 200 in 2.9s (next.js: 7ms, proxy.ts: 2.9s, application-code: 56ms)
[PG] Schema initialized
 GET /dashboard/media-providers/tts 200 in 1812ms (next.js: 1689ms, proxy.ts: 20ms, application-code: 103ms)
[PG] Schema initialized
 GET /manifest.webmanifest 200 in 7ms (next.js: 4ms, application-code: 2ms)
 GET /api/providers 200 in 33ms (next.js: 18ms, application-code: 15ms)
 GET /api/providers 200 in 13ms (next.js: 791µs, application-code: 12ms)

