"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
  date?: Date
  onDateTimeChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DateTimePicker({
  date,
  onDateTimeChange,
  placeholder = "Pick a date and time",
  className,
  disabled = false,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [timeValue, setTimeValue] = React.useState<string>(
    date ? format(date, "HH:mm") : ""
  )
  const [isOpen, setIsOpen] = React.useState(false)

  // Update internal state when external date prop changes
  React.useEffect(() => {
    if (date) {
      setSelectedDate(date)
      setTimeValue(format(date, "HH:mm"))
    } else {
      setSelectedDate(undefined)
      setTimeValue("")
    }
  }, [date])

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setSelectedDate(undefined)
      setTimeValue("")
      onDateTimeChange?.(undefined)
      return
    }

    // If we have a time value, apply it to the new date
    if (timeValue) {
      const [hours, minutes] = timeValue.split(":").map(Number)
      if (!isNaN(hours) && !isNaN(minutes)) {
        newDate.setHours(hours, minutes, 0, 0)
      }
    } else {
      // Set default time to current time
      const now = new Date()
      newDate.setHours(now.getHours(), now.getMinutes(), 0, 0)
      setTimeValue(format(newDate, "HH:mm"))
    }

    setSelectedDate(newDate)
    onDateTimeChange?.(newDate)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTimeValue(newTime)

    if (!selectedDate || !newTime) return

    const [hours, minutes] = newTime.split(":").map(Number)
    if (!isNaN(hours) && !isNaN(minutes)) {
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(hours, minutes, 0, 0)
      setSelectedDate(newDateTime)
      onDateTimeChange?.(newDateTime)
    }
  }

  const handleClear = () => {
    setSelectedDate(undefined)
    setTimeValue("")
    onDateTimeChange?.(undefined)
    setIsOpen(false)
  }

  const formatDisplayText = () => {
    if (!selectedDate) return placeholder
    
    if (timeValue) {
      // Show date and time in a mobile-friendly format
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const isToday = selectedDate.toDateString() === today.toDateString()
      const isTomorrow = selectedDate.toDateString() === tomorrow.toDateString()
      
      if (isToday) {
        return `Today at ${format(selectedDate, "h:mm a")}`
      } else if (isTomorrow) {
        return `Tomorrow at ${format(selectedDate, "h:mm a")}`
      } else {
        return format(selectedDate, "MMM d 'at' h:mm a")
      }
    }
    
    return format(selectedDate, "PPP")
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal min-h-[44px] px-3", // Increased touch target size
              !selectedDate && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{formatDisplayText()}</span>
            {selectedDate && (
              <X 
                className="ml-auto h-4 w-4 opacity-50 hover:opacity-100 flex-shrink-0" 
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            initialFocus
            className="border-0"
          />
          <div className="p-4 border-t bg-muted/10">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="time" className="text-sm font-medium">
                  Select Time
                </Label>
              </div>
              <Input
                id="time"
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className="text-base" // Larger text for mobile
                placeholder="Select time"
              />
              {selectedDate && timeValue && (
                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm font-medium text-foreground">
                    {formatDisplayText()}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-xs hover:bg-destructive/10 hover:text-destructive"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}