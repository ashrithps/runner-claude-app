'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Star, User } from 'lucide-react'
import { Task } from '@/lib/store'

interface RatingItem {
  id: string
  rating: number
  feedback?: string
  rater_name: string
  rated_name: string
}

interface RatingData {
  givenByMe: RatingItem[]
  receivedByMe: RatingItem[]
  canRatePoster: boolean
  canRateRunner: boolean
}

interface TaskRatingProps {
  task: Task
  onRatingSubmitted?: () => void
}

export function TaskRating({ task, onRatingSubmitted }: TaskRatingProps) {
  const [ratings, setRatings] = useState<RatingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Rating form state
  const [selectedRating, setSelectedRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [ratingTarget, setRatingTarget] = useState<'poster' | 'runner' | null>(null)

  const loadRatings = useCallback(async () => {
    try {
      const response = await fetch(`/api/ratings/task/${task.id}`)
      if (response.ok) {
        const data = await response.json()
        setRatings(data.userRatings)
      }
    } catch (error) {
      console.error('Failed to load ratings:', error)
    } finally {
      setLoading(false)
    }
  }, [task.id])

  useEffect(() => {
    loadRatings()
  }, [loadRatings])

  const handleRatingSubmit = async () => {
    if (!selectedRating || !ratingTarget) return

    setSubmitting(true)
    try {
      const ratedId = ratingTarget === 'poster' ? task.poster_id : task.runner_id
      
      const response = await fetch('/api/ratings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          ratedId,
          rating: selectedRating,
          feedback: feedback.trim() || undefined
        })
      })

      if (response.ok) {
        // Reset form
        setSelectedRating(0)
        setFeedback('')
        setRatingTarget(null)
        
        // Reload ratings
        await loadRatings()
        onRatingSubmitted?.()
      } else {
        const error = await response.json()
        console.error('Failed to submit rating:', error)
      }
    } catch (error) {
      console.error('Failed to submit rating:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const startRating = (target: 'poster' | 'runner') => {
    setRatingTarget(target)
    setSelectedRating(0)
    setFeedback('')
  }

  const renderStars = (rating: number, interactive: boolean = false, size: string = 'h-5 w-5') => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
            onClick={interactive ? () => setSelectedRating(star) : undefined}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading ratings...</div>
        </CardContent>
      </Card>
    )
  }

  if (task.status !== 'completed') {
    return null // Only show for completed tasks
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-400" />
          <span>Task Rating & Feedback</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Show existing ratings */}
        {ratings?.receivedByMe && ratings.receivedByMe.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Ratings You Received</h4>
            {ratings.receivedByMe.map((rating) => (
              <div key={rating.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-800">{rating.rater_name}</span>
                  {renderStars(rating.rating)}
                </div>
                {rating.feedback && (
                  <p className="text-green-700 text-sm">{rating.feedback}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {ratings?.givenByMe && ratings.givenByMe.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Ratings You Gave</h4>
            {ratings.givenByMe.map((rating) => (
              <div key={rating.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-800">To: {rating.rated_name}</span>
                  {renderStars(rating.rating)}
                </div>
                {rating.feedback && (
                  <p className="text-blue-700 text-sm">{rating.feedback}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Rating form */}
        {!ratingTarget && (
          <div className="space-y-4">
            {ratings?.canRatePoster && (
              <Button 
                onClick={() => startRating('poster')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Rate Task Poster ({task.poster_name})
              </Button>
            )}
            
            {ratings?.canRateRunner && (
              <Button 
                onClick={() => startRating('runner')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Rate Task Runner ({task.runner_name})
              </Button>
            )}
          </div>
        )}

        {ratingTarget && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
            <h4 className="font-medium text-gray-900">
              Rate {ratingTarget === 'poster' ? task.poster_name : task.runner_name}
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating
              </label>
              {renderStars(selectedRating, true, 'h-8 w-8')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback (Optional)
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience working with this person..."
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {feedback.length}/500 characters
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleRatingSubmit}
                disabled={!selectedRating || submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
              <Button
                onClick={() => setRatingTarget(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!ratings?.canRatePoster && !ratings?.canRateRunner && !ratingTarget && 
         (!ratings?.givenByMe?.length && !ratings?.receivedByMe?.length) && (
          <div className="text-center text-gray-500 py-4">
            <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No ratings available for this task yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}