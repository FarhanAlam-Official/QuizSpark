"use client"

import type React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"

type SoundType = "correct" | "incorrect" | "select" | "complete" | "click" | "tick" | "fail" | "error" | "success"

interface SoundContextType {
  playSound: (sound: SoundType) => void
  isSoundLoaded: boolean
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

const SOUND_PATHS = {
  correct: "/sounds/correct.mp3",
  incorrect: "/sounds/incorrect.mp3",
  select: "/sounds/select.mp3",
  complete: "/sounds/complete.mp3",
  click: "/sounds/click.mp3",
  tick: "/sounds/tick.mp3",
  fail: "/sounds/fail.mp3",
  error: "/sounds/error.mp3",
  success: "/sounds/success.mp3"
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    correct: null,
    incorrect: null,
    select: null,
    complete: null,
    click: null,
    tick: null,
    fail: null,
    error: null,
    success: null
  })
  const [isSoundLoaded, setIsSoundLoaded] = useState(false)
  const [loadedSounds, setLoadedSounds] = useState<Set<SoundType>>(new Set())

  useEffect(() => {
    let mounted = true
    const soundsToLoad = new Set<SoundType>()

    // Create and load audio elements
    Object.entries(SOUND_PATHS).forEach(([key, path]) => {
      const soundType = key as SoundType
      const audio = new Audio()
      
      // Add error handling and logging
      audio.addEventListener('error', (e) => {
        console.error(`Error loading sound ${key} from path ${path}:`, e.target)
        // Still mark as loaded to avoid blocking
        if (mounted) {
          soundsToLoad.add(soundType)
          if (soundsToLoad.size === Object.keys(SOUND_PATHS).length) {
            setIsSoundLoaded(true)
          }
          setLoadedSounds(new Set(soundsToLoad))
        }
      })

      audio.addEventListener('canplaythrough', () => {
        console.log(`Sound ${key} loaded successfully`)
        if (mounted) {
          soundsToLoad.add(soundType)
          if (soundsToLoad.size === Object.keys(SOUND_PATHS).length) {
            setIsSoundLoaded(true)
          }
          setLoadedSounds(new Set(soundsToLoad))
        }
      })

      // Set audio properties
      audio.preload = 'auto'
      audio.volume = 0.5
      audio.src = path
      
      // Start loading
      try {
        audio.load()
        audioRefs.current[soundType] = audio
      } catch (error) {
        console.error(`Failed to load sound ${key}:`, error)
      }
    })

    return () => {
      mounted = false
      // Cleanup audio elements
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause()
          audio.src = ''
        }
      })
    }
  }, [])

  const playSound = (sound: SoundType) => {
    const audio = audioRefs.current[sound]
    if (audio && loadedSounds.has(sound)) {
      // Reset and play
      audio.currentTime = 0
      audio.play().catch(error => {
        console.error(`Error playing sound ${sound}:`, error)
      })
    } else {
      console.warn(`Sound ${sound} not loaded yet`)
    }
  }

  return (
    <SoundContext.Provider value={{ playSound, isSoundLoaded }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  const context = useContext(SoundContext)
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider")
  }
  return context
}
