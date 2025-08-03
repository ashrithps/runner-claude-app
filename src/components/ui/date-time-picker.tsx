"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"

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

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setSelectedDate(undefined)
      onDateTimeChange?.(undefined)
      return
    }

    const [hours, minutes] = timeValue.split(":").map(Number)
    if (!isNaN(hours) && !isNaN(minutes)) {
      newDate.setHours(hours, minutes)
    }

    setSelectedDate(newDate)
    onDateTimeChange?.(newDate)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTimeValue(newTime)

    if (!selectedDate) return

    const [hours, minutes] = newTime.split(":").map(Number)
    if (!isNaN(hours) && !isNaN(minutes)) {
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(hours, minutes)
      setSelectedDate(newDateTime)
      onDateTimeChange?.(newDateTime)
    }
  }

  const handleClear = () => {
    setSelectedDate(undefined)
    setTimeValue("")
    onDateTimeChange?.(undefined)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, "PPP")
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            initialFocus
          />
          <div className="p-3 border-t">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="time" className="text-sm font-medium">
                Time
              </Label>
            </div>
            <Input
              id="time"
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="mt-2"
              placeholder="Select time"
            />
            {selectedDate && (
              <div className="flex justify-between items-center mt-3 pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  {selectedDate && timeValue
                    ? format(selectedDate, "PPP 'at' HH:mm")
                    : "Select date and time"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}