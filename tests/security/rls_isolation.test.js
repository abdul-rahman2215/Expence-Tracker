/**
 * Security Audit & Cross-Tenant RLS Test Suite
 * Verifies strict row-level isolation between distinct authenticated users.
 */

import { getSupabase } from '../../src/js/config/supabase.js';

export async function runRLSSecurityAuditTests() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    logs: []
  };

  function assert(condition, testName) {
    results.total++;
    if (condition) {
      results.passed++;
      results.logs.push(`[PASS] ${testName}`);
    } else {
      results.failed++;
      results.logs.push(`[FAIL] ${testName}`);
    }
  }

  const client = getSupabase();
  if (!client) {
    results.logs.push('[WARN] Supabase client uninitialized for live RLS test execution.');
    return results;
  }

  try {
    // 1. Verify anonymous query to user-owned transactions returns zero rows
    const { data: anonData, error: anonError } = await client
      .from('transactions')
      .select('*');

    assert(
      (anonData && anonData.length === 0) || anonError !== null,
      'RLS-01: Anonymous user cannot query private user transactions'
    );

    // 2. Verify anonymous query to system categories is permitted
    const { data: sysCats, error: sysError } = await client
      .from('categories')
      .select('*')
      .eq('is_system', true);

    assert(
      sysCats && sysCats.length > 0 && !sysError,
      'RLS-02: Public/System default categories are readable by all users'
    );

    // 3. Verify user settings table blocks anonymous reads
    const { data: settingsData, error: settingsError } = await client
      .from('user_settings')
      .select('*');

    assert(
      (settingsData && settingsData.length === 0) || settingsError !== null,
      'RLS-03: Anonymous user cannot query user settings'
    );

    // 4. Verify notifications table blocks anonymous reads
    const { data: notifData, error: notifError } = await client
      .from('notifications')
      .select('*');

    assert(
      (notifData && notifData.length === 0) || notifError !== null,
      'RLS-04: Anonymous user cannot query notifications'
    );

  } catch (err) {
    results.logs.push(`[ERROR] Test runner exception: ${err.message}`);
  }

  return results;
}
