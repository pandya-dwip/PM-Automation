/**
 * @file login.spec.ts
 * @description End-to-end test suite for user authentication flows.
 *
 * Scenario Covered:
 *  🔐 Developer logs in → verifies navigation to Home page →
 *  ❌ Attempts login with invalid credentials → verifies error banner alert.
 *
 * Modules & Utilities:
 *  - helpers/index.ts -> loginAs, USER_ROLES, ENDPOINTS
 *  - pages/auth/login.locators.ts -> LoginLocators
 */

import { test, expect } from '@playwright/test';
import { loginAs, USER_ROLES, ENDPOINTS } from '../../helpers';
import { LoginLocators } from '../../pages/auth/login.locators';

// Helper functions for structured logging
const logHeader = (phase: string, title: string) => {
  console.log(`\n================================================================================`);
  console.log(`📌 ${phase}: ${title.toUpperCase()}`);
  console.log(`================================================================================`);
};

const logStep = (step: string) => {
  console.log(`   ├─ 🔹 ${step}`);
};

const logSuccess = (message: string) => {
  console.log(`   └── ✅ ${message}`);
};

test.describe('🔐 Authentication Tests', () => {
  test('✅ Successful login with dynamic Developer role credentials', async ({ page }) => {
    // ── Phase 1: Login ──────────────────────────────────────────────
    await test.step('Phase 1 : 🔐 Login as Developer', async () => {
      logHeader('PHASE 1', 'Developer Authentication');
      logStep('Initiating Developer login...');
      await loginAs(page, USER_ROLES.DEVELOPER);
      logSuccess('Developer authenticated successfully.');
    });

    // ── Phase 2: Verify Home Page Navigation ────────────────────────
    await test.step('Phase 2 : 📄 Verify navigation to Home page', async () => {
      logHeader('PHASE 2', 'Home Page Endpoint Validation');
      logStep('Checking current page URL against Home endpoint pattern...');
      await expect(page).toHaveURL(new RegExp(ENDPOINTS.HOME));
      logSuccess(`Navigated to Home URL: ${page.url()}`);
    });
  });

  test('❌ Verify error banner on invalid login attempt', async ({ page }) => {
    const loginLocators = new LoginLocators(page);

    // ── Phase 1: Navigate to Login Page ──────────────────────────────
    await test.step('Phase 1 : 📂 Navigate to Login page', async () => {
      logHeader('PHASE 1', 'Navigate to Login Endpoint');
      logStep(`Clearing active session & navigating to Login page (${ENDPOINTS.AUTH.LOGIN})...`);
      await page.context().clearCookies();
      await page.goto(ENDPOINTS.AUTH.LOGIN);
      logSuccess('Login page loaded successfully.');
    });

    // ── Phase 2: Fill Invalid Credentials ────────────────────────────
    await test.step('Phase 2 : ✏️ Fill invalid credentials & submit', async () => {
      logHeader('PHASE 2', 'Submit Invalid Credentials');
      logStep('Entering invalid username and password...');
      await loginLocators.usernameInput.fill('invalid_user');
      await loginLocators.passwordInput.fill('wrong_password');
      logStep('Clicking submit button...');
      await loginLocators.submitBtn.click();
      logSuccess('Submitted invalid login form.');
    });

    // ── Phase 3: Verify Error Banner ────────────────────────────────
    await test.step('Phase 3 : 🔍 Verify error banner alert', async () => {
      logHeader('PHASE 3', 'Error Alert Validation');
      logStep('Verifying visibility of error alert message...');
      await expect(loginLocators.errorMessageAlert).toBeVisible();
      await expect(loginLocators.errorMessageText).toHaveText(/No user found|Invalid credentials|Invalid password/i);
      logSuccess('Error banner verified matching authentication failure message.');
    });
  });
});
