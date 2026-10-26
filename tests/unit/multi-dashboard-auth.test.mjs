import test from "node:test";
import assert from "node:assert/strict";

import {
  authenticateUser,
  registerUser,
  getUserByEmail,
  addWorkspaceToUser,
} from "../../lib/auth/user-store.ts";
import {
  generateVerificationOtp,
  verifyOtp,
  normalizeEmail,
  normalizePhoneNumber,
} from "../../lib/security/anti-abuse.ts";

test("Multi-Dashboard Auth — Default Admin & User Authentication", () => {
  // 1. Admin login verifies with correct credentials
  const adminAuth = authenticateUser("admin@chatify.ai", "AdminSecure2026!");
  assert.equal(adminAuth.success, true);
  assert.equal(adminAuth.user?.role, "admin");
  assert.equal(adminAuth.workspace?.name, "Chatify Enterprise HQ");
  assert.equal(adminAuth.workspace?.slug, "chatify-enterprise");

  // 2. Standard User login verifies with correct credentials
  const userAuth = authenticateUser("user@chatify.ai", "UserPass2026!");
  assert.equal(userAuth.success, true);
  assert.equal(userAuth.user?.role, "user");
  assert.equal(userAuth.workspace?.name, "Nova Marketing Agency");
  assert.equal(userAuth.workspace?.slug, "nova-agency");

  // 3. Invalid passwords are strictly rejected
  const badAuth = authenticateUser("admin@chatify.ai", "WrongPassword123!");
  assert.equal(badAuth.success, false);
  assert.match(badAuth.error || "", /invalid email or password/i);

  const nonExistent = authenticateUser("nobody@random.com", "SomePass123!");
  assert.equal(nonExistent.success, false);
});

test("Multi-Dashboard — Dynamic Registered User Generates Isolated Workspace", () => {
  const uniqueEmail = `dr.smith.${Date.now()}@smithdental.com`;
  const businessName = "Smith Family Dental & Orthodontics";
  const phone = "+15559876543";

  // Register dynamic user
  const { user, workspace } = registerUser({
    email: uniqueEmail,
    phone,
    businessName,
    password: "SmithDental2026!",
  });

  assert.equal(user.email, uniqueEmail.toLowerCase());
  assert.equal(user.name, businessName);
  assert.equal(workspace.name, businessName);
  assert.equal(workspace.slug, "smith-family-dental-orthodontics");
  assert.ok(workspace.id.startsWith("ws-"));

  // Verify that the new user can authenticate immediately
  const loginRes = authenticateUser(uniqueEmail, "SmithDental2026!");
  assert.equal(loginRes.success, true);
  assert.equal(loginRes.workspace?.name, businessName);

  // Multi-Dashboard: Create additional branch workspace for this user
  const branchWs = addWorkspaceToUser(uniqueEmail, "Smith North Clinic");
  assert.ok(branchWs);
  assert.equal(branchWs?.name, "Smith North Clinic");
  assert.equal(branchWs?.slug, "smith-north-clinic");

  const updatedUser = getUserByEmail(uniqueEmail);
  assert.equal(updatedUser?.workspaces.length, 2);
});

test("Individual Dual Verification — Separate Email and Phone OTPs", () => {
  const testEmail = `verify.${Date.now()}@testpractice.com`;
  const testPhone = `+1555${Math.floor(1000000 + Math.random() * 9000000)}`;

  // Generate individual OTPs
  const emailOtp = generateVerificationOtp(testEmail);
  const phoneOtp = generateVerificationOtp(testPhone);

  assert.equal(typeof emailOtp, "string");
  assert.equal(emailOtp.length, 6);
  assert.equal(typeof phoneOtp, "string");
  assert.equal(phoneOtp.length, 6);

  // Individual Email Verification: Wrong code fails
  const wrongEmailCheck = verifyOtp(testEmail, "000000");
  assert.equal(wrongEmailCheck.valid, false);

  // Individual Email Verification: Correct code succeeds
  const rightEmailCheck = verifyOtp(testEmail, emailOtp);
  assert.equal(rightEmailCheck.valid, true);

  // Individual Phone Verification: Correct code succeeds
  const rightPhoneCheck = verifyOtp(testPhone, phoneOtp);
  assert.equal(rightPhoneCheck.valid, true);
});
