/**
 * @file logger.ts
 * @description Standardized, structured console execution logger for test suites.
 */

export const logHeader = (phase: string, title: string): void => {
  console.log(`\n================================================================================`);
  console.log(`📌 ${phase}: ${title.toUpperCase()}`);
  console.log(`================================================================================`);
};

export const logStep = (step: string): void => {
  console.log(`   ├─ 🔹 ${step}`);
};

export const logData = (key: string, value: string | number | boolean): void => {
  console.log(`   │    • ${key.padEnd(24)}: "${value}"`);
};

export const logSuccess = (message: string): void => {
  console.log(`   └── ✅ ${message}`);
};

export const logFinish = (message: string): void => {
  console.log(`\n================================================================================`);
  console.log(`🏆 ${message}`);
  console.log(`================================================================================\n`);
};
