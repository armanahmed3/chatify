import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp-up to 20 virtual users
    { duration: '1m', target: 50 },  // Sustained load at 50 virtual users
    { duration: '30s', target: 0 },  // Scale-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.02'],   // Failure rate less than 2%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export default function () {
  // Test 1: Public chat widget latency check
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health returns healthy': (r) => r.json().status === 'healthy',
  });

  // Test 2: Inbound customer chat query simulation
  const chatPayload = JSON.stringify({
    message: 'What are your clinic opening hours and do you accept insurance?',
    session_id: `k6-user-${__VU}-${__ITER}`,
  });

  const chatParams = {
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://apex-dental.com',
    },
  };

  const chatRes = http.post(`${BASE_URL}/api/chat/demo-apex`, chatPayload, chatParams);
  check(chatRes, {
    'chat returns 200 or 429': (r) => r.status === 200 || r.status === 429,
  });

  sleep(1);
}
