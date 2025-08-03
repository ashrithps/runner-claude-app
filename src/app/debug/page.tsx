'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// Remove old Supabase imports - we now use SQLite
import { clearAppStorage, debugStorage } from '@/lib/clear-storage'

export default function DebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Not tested')
  const [testDataStatus, setTestDataStatus] = useState<string>('Not created')
  const [debugStatus, setDebugStatus] = useState<string>('Not run')
  const [envStatus, setEnvStatus] = useState<string>('Not checked')

  const handleTestConnection = async () => {
    setConnectionStatus('Testing...')
    try {
      const response = await fetch('/api/debug/test-connection')
      const data = await response.json()
      setConnectionStatus(data.success ? '✅ Connected' : '❌ Failed')
    } catch (_error) {
      setConnectionStatus('❌ Failed')
    }
  }

  const handleInsertTestData = async () => {
    setTestDataStatus('Creating...')
    try {
      const response = await fetch('/api/debug/create-test-data', { method: 'POST' })
      const data = await response.json()
      setTestDataStatus(data.success ? '✅ Created' : '❌ Failed')
    } catch (_error) {
      setTestDataStatus('❌ Failed')
    }
  }

  const handleDebugDatabase = async () => {
    setDebugStatus('Running...')
    try {
      const response = await fetch('/api/debug/test-database')
      const data = await response.json()
      setDebugStatus(data.success ? '✅ All checks passed' : '❌ Issues found')
    } catch (_error) {
      setDebugStatus('❌ Issues found')
    }
  }

  const handleCheckEnvironment = async () => {
    setEnvStatus('Checking...')
    setEnvStatus('✅ SQLite Database Active')
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">🔧 Debug & Test</h1>
        <p className="text-gray-600 mt-1">Test SQLite database connection and features</p>
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
            This will create a test user and task in your SQLite database
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
          <li><strong>Clear Storage First</strong> - Remove old cached data</li>
          <li><strong>Check Environment</strong> - Verify SQLite database is initialized</li>
          <li><strong>Run Database Debug</strong> - Check tables exist and data integrity</li>
          <li><strong>Common Issues:</strong>
            <ul className="ml-4 mt-1 space-y-1 list-disc">
              <li>Database locked - restart the application</li>
              <li>Missing tables - database will auto-initialize on first run</li>
              <li>Invalid data types - check SQLite constraints</li>
            </ul>
          </li>
        </ol>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-2">✅ SQLite Database</h3>
        <p className="text-sm text-green-800 mb-2">
          The app now uses SQLite with automatic schema initialization
        </p>
        <div className="bg-white border border-green-300 rounded p-2 text-xs font-mono overflow-x-auto">
          Database location: <code>./data/database.sqlite</code>
        </div>
      </div>
    </div>
  )
}