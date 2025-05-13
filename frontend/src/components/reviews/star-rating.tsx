"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  onChange?: (rating: number) => void
  readOnly?: boolean
}

export function StarRating({ rating, maxRating = 5, size = "md", onChange, readOnly = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [currentRating, setCurrentRating] = useState(rating)

  useEffect(() => {
    setCurrentRating(rating)
  }, [rating])

  const handleMouseEnter = (index: number) => {
    if (readOnly) return
    setHoverRating(index)
  }

  const handleMouseLeave = () => {
    if (readOnly) return
    setHoverRating(0)
  }

  const handleClick = (index: number) => {
    if (readOnly) return
    setCurrentRating(index)
    if (onChange) {
      onChange(index)
    }
  }

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4"
      case "lg":
        return "h-8 w-8"
      case "md":
      default:
        return "h-6 w-6"
    }
  }

  const starSize = getSizeClass()

  return (
    <div className="flex items-center">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1
        const isFilled = (hoverRating || currentRating) >= starValue

        return (
          <span
            key={index}
            className={`cursor-${readOnly ? "default" : "pointer"} p-1`}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starValue)}
          >
            <Star
              className={`${starSize} ${
                isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
              } transition-colors`}
            />
          </span>
        )
      })}
    </div>
  )
}
