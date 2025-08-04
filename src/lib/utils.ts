import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from 'uuid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUserId(): string {
  return uuidv4()
}

export function createDefaultUser() {
  return {
    id: generateUserId(),
    email: 'user@example.com',
    name: 'Community Member',
    latitude: 12.9716,
    longitude: 77.5946,
    address_details: 'Building A, Flat 101, Ground Floor',
    mobile: '+91 98765 43210',
    available_for_tasks: true,
    email_notifications: true
  }
}