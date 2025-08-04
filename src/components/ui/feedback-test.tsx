'use client'

import { useState } from 'react'
import { AnimatedButton } from './animated-button'
import { enhancedFeedback, useHaptics } from '@/lib/haptics'
import { usePlatformDetection } from '@/lib/platform-detection'

export function FeedbackTest() {
  const [lastTriggered, setLastTriggered] = useState<string>('')
  const { platformInfo, capabilities } = usePlatformDetection()
  const { 
    config, 
    updateConfig, 
    applyRecommendedSettings,
    unlock,
    test
  } = useHaptics()

  const testFeedback = async (pattern: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection') => {
    await enhancedFeedback.trigger(pattern)
    setLastTriggered(`${pattern} (${new Date().toLocaleTimeString()})`)
  }

  const handleUnlock = async () => {
    await unlock()
    setLastTriggered('Audio context unlocked')
  }

  const handleTest = async () => {
    const result = await test()
    setLastTriggered(`Test result: ${result ? 'Success' : 'Failed'}`)
  }

  if (!platformInfo) {
    return <div>Loading platform detection...</div>
  }

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-3">Platform Information</h3>
        <div className="text-sm space-y-1">
          <p><strong>Device:</strong> {platformInfo.isIOS ? 'iOS' : platformInfo.isAndroid ? 'Android' : 'Desktop'}</p>
          <p><strong>Browser:</strong> {platformInfo.isSafari ? 'Safari' : platformInfo.isChrome ? 'Chrome' : 'Other'}</p>
          <p><strong>Haptic Support:</strong> {platformInfo.supportsHaptics ? '✅' : '❌'}</p>
          <p><strong>Audio Support:</strong> {platformInfo.supportsAudio ? '✅' : '❌'}</p>
          <p><strong>Priority:</strong> {capabilities.priority.join(' → ')}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-3">Feedback Configuration</h3>
        <div className="text-sm space-y-2">
          <div className="flex items-center justify-between">
            <span>Haptic Enabled:</span>
            <button 
              onClick={() => updateConfig({ hapticEnabled: !config.hapticEnabled })}
              className={`px-2 py-1 rounded text-xs ${config.hapticEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
            >
              {config.hapticEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Audio Enabled:</span>
            <button 
              onClick={() => updateConfig({ audioEnabled: !config.audioEnabled })}
              className={`px-2 py-1 rounded text-xs ${config.audioEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
            >
              {config.audioEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Visual Enabled:</span>
            <button 
              onClick={() => updateConfig({ visualEnabled: !config.visualEnabled })}
              className={`px-2 py-1 rounded text-xs ${config.visualEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
            >
              {config.visualEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span>Audio Volume:</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1"
              value={config.audioVolume}
              onChange={(e) => updateConfig({ audioVolume: parseFloat(e.target.value) })}
              className="w-20"
            />
            <span className="text-xs">{Math.round(config.audioVolume * 100)}%</span>
          </div>
        </div>

        <div className="mt-3 space-x-2">
          <button 
            onClick={applyRecommendedSettings}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm"
          >
            Apply Recommended
          </button>
          
          <button 
            onClick={handleUnlock}
            className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm"
          >
            Unlock Audio
          </button>
          
          <button 
            onClick={handleTest}
            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm"
          >
            Test System
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-3">Test Feedback Patterns</h3>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <AnimatedButton 
            haptic 
            animation="scale"
            onClick={() => testFeedback('light')}
            className="text-sm py-2"
          >
            Light
          </AnimatedButton>
          
          <AnimatedButton 
            haptic 
            animation="scale"
            onClick={() => testFeedback('medium')}
            className="text-sm py-2"
          >
            Medium
          </AnimatedButton>
          
          <AnimatedButton 
            haptic 
            animation="scale"
            onClick={() => testFeedback('heavy')}
            className="text-sm py-2"
          >
            Heavy
          </AnimatedButton>
          
          <AnimatedButton 
            haptic 
            animation="scale"
            onClick={() => testFeedback('selection')}
            className="text-sm py-2"
          >
            Selection
          </AnimatedButton>
          
          <AnimatedButton 
            haptic 
            success
            animation="pulse"
            onClick={() => testFeedback('success')}
            className="text-sm py-2"
          >
            Success
          </AnimatedButton>
          
          <AnimatedButton 
            haptic 
            variant="destructive"
            animation="shake"
            onClick={() => testFeedback('error')}
            className="text-sm py-2"
          >
            Error
          </AnimatedButton>
        </div>

        {lastTriggered && (
          <div className="text-xs text-gray-600 mt-2">
            Last triggered: {lastTriggered}
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
        <h3 className="font-semibold text-amber-800 mb-2">iPhone Safari Users</h3>
        <p className="text-sm text-amber-700">
          If you're on iPhone Safari, you should hear audio feedback and see enhanced visual effects 
          instead of haptic vibration. Make sure your device isn't on silent mode!
        </p>
      </div>
    </div>
  )
}