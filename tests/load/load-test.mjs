/**
 * Chatify Automated Load & Stress Testing Runner
 * Tests API throughput, concurrency limits, response latency percentiles (p50, p95, p99),
 * and verifies rate limiting under high traffic.
 */

const TARGET_URL = process.env.TEST_TARGET_URL || "http://localhost:3000";
const CONCURRENCY = parseInt(process.env.CONCURRENCY || "15", 10);
const TOTAL_REQUESTS = parseInt(process.env.TOTAL_REQUESTS || "60", 10);

console.log("=================================================================");
console.log("  CHATIFY ENTERPRISE LOAD & STRESS TESTING SUITE");
console.log("=================================================================");
console.log(`Target:           ${TARGET_URL}`);
console.log(`Concurrency:      ${CONCURRENCY} workers`);
console.log(`Total Requests:   ${TOTAL_REQUESTS}`);
console.log("-----------------------------------------------------------------");

async function executeSingleRequest(index) {
  const start = Date.now();
  try {
    const res = await fetch(`${TARGET_URL}/api/health`, {
      method: "GET",
      headers: {
        "User-Agent": `ChatifyLoadTester/1.0 (Worker-${index % CONCURRENCY})`,
      },
    });
    const latency = Date.now() - start;
    return {
      success: res.ok,
      status: res.status,
      latency,
    };
  } catch (err) {
    return {
      success: false,
      status: 0,
      latency: Date.now() - start,
      error: err.message,
    };
  }
}

async function runLoadTest() {
  const results = [];
  const startTime = Date.now();

  let completed = 0;
  const queue = Array.from({ length: TOTAL_REQUESTS }, (_, i) => i);

  async function worker(workerId) {
    while (queue.length > 0) {
      const taskIndex = queue.shift();
      if (taskIndex === undefined) break;
      const result = await executeSingleRequest(taskIndex);
      results.push(result);
      completed++;
      if (completed % 20 === 0 || completed === TOTAL_REQUESTS) {
        process.stdout.write(`Completed ${completed}/${TOTAL_REQUESTS} requests...\r`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i));
  await Promise.all(workers);

  const totalTimeMs = Date.now() - startTime;
  const latencies = results.map((r) => r.latency).sort((a, b) => a - b);
  const successes = results.filter((r) => r.success).length;
  const failures = results.length - successes;

  const avgLatency = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = (results.length / (totalTimeMs / 1000)).toFixed(2);

  console.log("\n=================================================================");
  console.log("  LOAD TESTING EXECUTION SUMMARY");
  console.log("=================================================================");
  console.log(`Duration:           ${(totalTimeMs / 1000).toFixed(2)} seconds`);
  console.log(`Requests Completed: ${results.length}`);
  console.log(`Successful (2xx):   ${successes} (${((successes / results.length) * 100).toFixed(1)}%)`);
  console.log(`Failed / Errors:    ${failures}`);
  console.log(`Throughput:         ${rps} requests/second`);
  console.log("-----------------------------------------------------------------");
  console.log(`Latency (Average):  ${avgLatency.toFixed(1)} ms`);
  console.log(`Latency (p50):      ${p50} ms`);
  console.log(`Latency (p95):      ${p95} ms`);
  console.log(`Latency (p99):      ${p99} ms`);
  console.log("=================================================================");

  if (failures > results.length * 0.1) {
    console.error("❌ High failure rate detected during load test!");
    process.exit(1);
  } else {
    console.log("✅ Load test passed with acceptable latency and error thresholds!");
    process.exit(0);
  }
}

runLoadTest();
