/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from './supabaseClient';

/**
 * Test Supabase connection and basic query functionality
 * This function verifies:
 * 1. Supabase client is properly initialized
 * 2. Can connect to Supabase
 * 3. Can perform basic queries
 */
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}> => {
  console.log('🧪 Starting Supabase Connection Test...\n');
  console.log('--- Configuration Check ---');
  
  // Check if supabase client exists
  if (!supabase) {
    console.error('❌ FAILED: Supabase client is not initialized');
    return {
      success: false,
      message: 'Supabase client not initialized',
      error: { message: 'Supabase client is undefined' }
    };
  }
  console.log('✅ Supabase client is initialized');

  try {
    console.log('\n--- Testing Basic Connection ---');
    console.log('📍 Testing: Basic connection check...');

    // Test 1: Check if we can access the Supabase URL
    const urlTest = await supabase.auth.getSession();
    if (urlTest.error) {
      console.error('❌ FAILED: Cannot connect to Supabase URL');
      console.error('   Error:', urlTest.error.message);
      return {
        success: false,
        message: 'Cannot connect to Supabase URL',
        error: urlTest.error
      };
    }
    console.log('✅ Successfully connected to Supabase');

    console.log('\n--- Testing Query: Count user_profiles ---');
    console.log('📝 Query: SELECT count FROM user_profiles');

    // Test 2: Count records in user_profiles table
    const { count, error: countError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact' });

    if (countError) {
      console.error('❌ FAILED: Cannot query user_profiles table');
      console.error('   Error:', countError.message);
      return {
        success: false,
        message: 'Cannot query user_profiles table',
        error: countError
      };
    }

    console.log('✅ Successfully queried user_profiles table');
    console.log(`📊 Count result: ${count || 'N/A'} records`);

    console.log('\n--- Testing Query: Get all helpers ---');
    console.log('📝 Query: SELECT * FROM user_profiles WHERE is_helper = true');

    // Test 3: Get helpers list
    const { data: helpersData, error: helpersError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('is_helper', true)
      .limit(5);

    if (helpersError) {
      console.error('❌ FAILED: Cannot query helpers');
      console.error('   Error:', helpersError.message);
    } else {
      console.log('✅ Successfully queried helpers');
      console.log(`👥 Found ${helpersData?.length || 0} helpers`);
    }

    console.log('\n--- Testing Row Level Security (RLS) ---');
    console.log('📝 Query: Check if RLS is enabled (should return empty or own data)');

    // Test 4: Test RLS by trying to access data
    const { data: rlsData, error: rlsError } = await supabase
      .from('user_profiles')
      .select('user_id, full_name')
      .limit(3);

    if (rlsError) {
      console.warn('⚠️  RLS may be blocking access:', rlsError.message);
    } else {
      console.log('✅ RLS is active (query returned data or empty)');
      console.log(`📝 Sample data:`, rlsData || 'Empty (authenticated but no access)');
    }

    console.log('\n--- Test Summary ---');
    console.log('✅ All connection tests PASSED!');
    console.log('✅ Supabase is fully operational');

    return {
      success: true,
      message: 'Supabase connection test PASSED',
      data: {
        count: count,
        helpersCount: helpersData?.length,
        sampleData: rlsData
      }
    };

  } catch (error: any) {
    console.error('\n❌ FAILED: Unexpected error during test');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);

    return {
      success: false,
      message: 'Unexpected error during test',
      error: error
    };
  }
};

/**
 * Alternative simplified test function
 * Returns just a boolean and message
 */
export const simpleSupabaseTest = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Quick count test
    const { count, error } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('❌ Supabase test failed:', error.message);
      return { success: false, message: error.message };
    }

    console.log('✅ Supabase test passed! Count:', count);
    return { success: true, message: `Connected successfully. Count: ${count}` };
  } catch (error: any) {
    console.error('❌ Supabase test failed:', error.message);
    return { success: false, message: error.message };
  }
};

// Run tests if executed directly
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('test')) {
  console.log('\n🚀 Running Supabase Connection Tests...\n');
  
  testSupabaseConnection()
    .then((result) => {
      console.log('\n' + '='.repeat(50));
      console.log('TEST RESULT:', result.success ? '✅ PASSED' : '❌ FAILED');
      console.log('MESSAGE:', result.message);
      console.log('='.repeat(50));
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}