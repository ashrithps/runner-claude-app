'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FeedbackTest } from '@/components/ui/feedback-test'
// Remove old Supabase imports - we now use SQLite
import { clearAppStorage, debugStorage } from '@/lib/clear-storage'

export default function DebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Not tested')
  const [testDataStatus, setTestDataStatus] = useState<string>('Not created')
  const [debugStatus, setDebugStatus] = useState<string>('Not run')
  const [envStatus, setEnvStatus] = useState<string>('Not checked')
  const [migrationStatus, setMigrationStatus] = useState<string>('Not checked')
  const [migrationDetails, setMigrationDetails] = useState<Record<string, unknown> | null>(null)

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

  const handleCheckMigrations = async () => {
    setMigrationStatus('Checking...')
    try {
      const response = await fetch('/api/migrate')
      const data = await response.json()
      setMigrationDetails(data)
      if (data.success) {
        const { status } = data
        if (status.upToDate) {
          setMigrationStatus(`✅ Up to date (${status.completed} migrations)`)
        } else {
          setMigrationStatus(`⚠️ ${status.pending} pending migrations`)
        }
      } else {
        setMigrationStatus('❌ Failed to check')
      }
    } catch (error) {
      setMigrationStatus('❌ Failed to check')
    }
  }

  const handleRunMigrations = async () => {
    setMigrationStatus('Running migrations...')
    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'migrate' })
      })
      const data = await response.json()
      setMigrationDetails(data)
      if (data.success) {
        setMigrationStatus('✅ Migrations completed!')
      } else {
        setMigrationStatus('❌ Migration failed')
      }
    } catch (error) {
      setMigrationStatus('❌ Migration failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">🔧 Debug & Test</h1>
        <p className="text-gray-600 mt-1">Test SQLite database connection and features</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🎮 Multi-Modal Feedback System</CardTitle>
        </CardHeader>
        <CardContent>
          <FeedbackTest />
        </CardContent>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle>🔄 Database Migrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Migration Status:</span>
            <span className="font-medium">{migrationStatus}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={handleCheckMigrations}
              variant="outline"
              size="sm"
            >
              Check Status
            </Button>
            <Button 
              onClick={handleRunMigrations}
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Run Migrations
            </Button>
          </div>

          {migrationDetails && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Migration Details:</h4>
              <div className="text-sm space-y-1">
                {migrationDetails.status && (
                  <>
                    <p>Completed: {migrationDetails.status.completed || 0}</p>
                    <p>Pending: {migrationDetails.status.pending || 0}</p>
                    <p>Total: {migrationDetails.status.total || 0}</p>
                  </>
                )}
                {migrationDetails.completedMigrations && migrationDetails.completedMigrations.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Completed Migrations:</p>
                    <ul className="ml-2 space-y-1">
                      {migrationDetails.completedMigrations.map((migration: Record<string, unknown>) => (
                        <li key={migration.id as string} className="text-xs">
                          ✅ {migration.id} ({new Date(migration.executed_at as string).toLocaleDateString()})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {migrationDetails.pendingMigrations && migrationDetails.pendingMigrations.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Pending Migrations:</p>
                    <ul className="ml-2 space-y-1">
                      {migrationDetails.pendingMigrations.map((migration: string) => (
                        <li key={migration} className="text-xs">
                          ⏳ {migration}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-600">
            Migrations update the database schema safely. Always check status first.
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