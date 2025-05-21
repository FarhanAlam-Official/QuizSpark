"use client"

import type React from "react"

import { createContext, useContext, useEffect, useRef } from "react"

type SoundType = "correct" | "incorrect" | "select" | "complete" | "click"

interface SoundContextType {
  playSound: (sound: SoundType) => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const correctSoundRef = useRef<HTMLAudioElement | null>(null)
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null)
  const selectSoundRef = useRef<HTMLAudioElement | null>(null)
  const completeSoundRef = useRef<HTMLAudioElement | null>(null)
  const clickSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio elements
    correctSoundRef.current = new Audio()
    incorrectSoundRef.current = new Audio()
    selectSoundRef.current = new Audio()
    completeSoundRef.current = new Audio()
    clickSoundRef.current = new Audio()

    // Set sources
    if (correctSoundRef.current) correctSoundRef.current.src = "/sounds/correct.mp3"
    if (incorrectSoundRef.current) incorrectSoundRef.current.src = "/sounds/incorrect.mp3"
    if (selectSoundRef.current) selectSoundRef.current.src = "/sounds/select.mp3"
    if (completeSoundRef.current) completeSoundRef.current.src = "/sounds/complete.mp3"
    if (clickSoundRef.current) clickSoundRef.current.src = "/sounds/click.mp3"

    // Preload audio files
    const preloadAudio = (audio: HTMLAudioElement | null) => {
      if (audio) {
        audio.load()
      }
    }

    preloadAudio(correctSoundRef.current)
    preloadAudio(incorrectSoundRef.current)
    preloadAudio(selectSoundRef.current)
    preloadAudio(completeSoundRef.current)
    preloadAudio(clickSoundRef.current)

    return () => {
      // Clean up audio elements
      correctSoundRef.current = null
      incorrectSoundRef.current = null
      selectSoundRef.current = null
      completeSoundRef.current = null
      clickSoundRef.current = null
    }
  }, [])

  const playSound = (sound: SoundType) => {
    let audioRef: React.RefObject<HTMLAudioElement | null>

    switch (sound) {
      case "correct":
        audioRef = correctSoundRef
        break
      case "incorrect":
        audioRef = incorrectSoundRef
        break
      case "select":
        audioRef = selectSoundRef
        break
      case "complete":
        audioRef = completeSoundRef
        break
      case "click":
        audioRef = clickSoundRef
        break
      default:
        return
    }

    if (audioRef.current) {
      // Check if the audio file is loaded and ready
      if (audioRef.current.readyState >= 2) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch((e) => {
          console.error(`Error playing ${sound} sound:`, e)
        })
      } else {
        // If not ready, set up event listener to play when loaded
        const handleCanPlay = () => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play().catch((e) => {
              console.error(`Error playing ${sound} sound:`, e)
            })
            audioRef.current.removeEventListener("canplaythrough", handleCanPlay)
          }
        }

        audioRef.current.addEventListener("canplaythrough", handleCanPlay)
        // Trigger load in case it hasn't started loading yet
        audioRef.current.load()
      }
    }
  }

  return <SoundContext.Provider value={{ playSound }}>{children}</SoundContext.Provider>
}

export function useSound() {
  const context = useContext(SoundContext)
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider")
  }
  return context
}
