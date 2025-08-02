'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { testSupabaseConnection, insertTestData } from '@/lib/test-connection'
import { debugDatabase, checkEnvironment } from '@/lib/debug-db'
import { clearAppStorage, debugStorage } from '@/lib/clear-storage'

export default function DebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Not tested')
  const [testDataStatus, setTestDataStatus] = useState<string>('Not created')
  const [debugStatus, setDebugStatus] = useState<string>('Not run')
  const [envStatus, setEnvStatus] = useState<string>('Not checked')

  const handleTestConnection = async () => {
    setConnectionStatus('Testing...')
    const success = await testSupabaseConnection()
    setConnectionStatus(success ? '✅ Connected' : '❌ Failed')
  }

  const handleInsertTestData = async () => {
    setTestDataStatus('Creating...')
    const success = await insertTestData()
    setTestDataStatus(success ? '✅ Created' : '❌ Failed')
  }

  const handleDebugDatabase = async () => {
    setDebugStatus('Running...')
    const success = await debugDatabase()
    setDebugStatus(success ? '✅ All checks passed' : '❌ Issues found')
  }

  const handleCheckEnvironment = async () => {
    setEnvStatus('Checking...')
    const success = await checkEnvironment()
    setEnvStatus(success ? '✅ Environment OK' : '❌ Issues found')
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">🔧 Debug & Test</h1>
        <p className="text-gray-600 mt-1">Test Supabase connection and features</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Environment Status:</span>
            <span className="font-medium">{envStatus}</span>
          </div>
          
          <Button 
            onClick={handleCheckEnvironment}
            className="w-full"
            variant="outline"
          >
            Check Environment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Debug Status:</span>
            <span className="font-medium">{debugStatus}</span>
          </div>
          
          <Button 
            onClick={handleDebugDatabase}
            className="w-full"
            variant="outline"
          >
            Run Full Database Debug
          </Button>
          
          <p className="text-sm text-gray-600">
            Comprehensive test of database structure and permissions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basic Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Connection Status:</span>
            <span className="font-medium">{connectionStatus}</span>
          </div>
          
          <Button 
            onClick={handleTestConnection}
            className="w-full"
            variant="outline"
          >
            Test Basic Connection
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Data Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Test Data Status:</span>
            <span className="font-medium">{testDataStatus}</span>
          </div>
          
          <Button 
            onClick={handleInsertTestData}
            className="w-full"
            variant="outline"
          >
            Create Test Data
          </Button>
          
          <p className="text-sm text-gray-600">
            This will create a test user and task in your database
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={debugStorage}
              variant="outline"
              size="sm"
            >
              Debug Storage
            </Button>
            <Button 
              onClick={clearAppStorage}
              variant="destructive"
              size="sm"
            >
              Clear Storage
            </Button>
          </div>
          
          <p className="text-sm text-gray-600">
            Clear storage will remove old invalid user IDs and reload the page
          </p>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">🚀 Troubleshooting Steps</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li><strong>Clear Storage First</strong> - Remove old invalid user IDs</li>
          <li><strong>Check Environment</strong> - Verify Supabase URL and keys are set</li>
          <li><strong>Run Database Debug</strong> - Check tables exist and permissions</li>
          <li><strong>Common Issues:</strong>
            <ul className="ml-4 mt-1 space-y-1 list-disc">
              <li>22P02: Invalid UUID - clear storage to remove old user IDs</li>
              <li>PGRST116: Table doesn't exist - run <code>supabase-schema.sql</code></li>
              <li>23505: Unique constraint - user already exists (usually OK)</li>
              <li>42703: Column doesn't exist - schema mismatch</li>
            </ul>
          </li>
        </ol>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-medium text-red-900 mb-2">📋 Schema Setup Required</h3>
        <p className="text-sm text-red-800 mb-2">
          If tests fail, run this SQL in your Supabase SQL Editor:
        </p>
        <div className="bg-white border border-red-300 rounded p-2 text-xs font-mono overflow-x-auto">
          Copy contents of <code>supabase-schema.sql</code> and run in Supabase dashboard → SQL Editor
        </div>
      </div>
    </div>
  )
}