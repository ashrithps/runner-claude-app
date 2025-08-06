'use client'

import { useState, useEffect } from 'react'

const PLACEHOLDER_EXAMPLES = [
  "Do my bridal makeup for wedding",
  "File my name change affidavit",
  "Print or scan files for me", 
  "Deliver my food from restaurant",
  "Help assemble my IKEA furniture",
  "Water my plants while I'm away",
  "Pick up my dry cleaning",
  "Help move boxes to storage",
  "Set up my new WiFi router",
  "Teach me how to use smartphone",
  "Help organize my wardrobe",
  "Fix my leaky kitchen tap",
  "Install curtains in bedroom",
  "Help with pet grooming",
  "Accompany me to doctor visit",
  "Help write my resume",
  "Teach basic cooking skills",
  "Help with online shopping",
  "Backup my phone photos",
  "Help choose paint colors",
  "Wrap gifts for birthday party",
  "Help practice presentation",
  "Set up my smart TV",
  "Help with tax filing",
  "Organize birthday surprise",
  "Help with garage sale setup",
  "Teach me yoga basics",
  "Help write love letters",
  "Set up dating profile",
  "Help plan weekend getaway"
]

export function useDynamicPlaceholder(intervalMs: number = 3000) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % PLACEHOLDER_EXAMPLES.length)
        setIsVisible(true)
      }, 150) // Brief fade out duration
      
    }, intervalMs)

    return () => clearInterval(interval)
  }, [intervalMs])

  return {
    placeholder: PLACEHOLDER_EXAMPLES[currentIndex],
    isVisible
  }
}