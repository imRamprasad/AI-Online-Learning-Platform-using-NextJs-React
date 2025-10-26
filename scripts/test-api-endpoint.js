// Test the /api/generate-course-layout endpoint on multiple host addresses
const addresses = [
  'http://localhost:3001/api/generate-course-layout',
  'http://127.0.0.1:3001/api/generate-course-layout',
  'http://[::1]:3001/api/generate-course-layout',
  'http://20.30.1.43:3001/api/generate-course-layout',
];

async function tryPost(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const body = JSON.stringify({ name: 'Connectivity test', description: 'ping', noOfChapters: 1, includeVideo: false, level: 'Test', category: 'Test' });
    const res = await fetch(url, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, signal: controller.signal });
    clearTimeout(timeout);
    const text = await res.text();
    return { ok: true, status: res.status, body: text };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

(async () => {
  for (const addr of addresses) {
    console.log('\n→ Trying', addr);
    const r = await tryPost(addr);
    if (r.ok) {
      console.log('SUCCESS', addr, 'status=', r.status);
      console.log('body:', r.body.slice(0, 400));
      process.exit(0);
    } else {
      console.log('FAILED', addr, r.error);
    }
  }
  console.error('\nNo endpoint reachable on tested addresses.');
  process.exit(2);
})();
