"use client"

import Link from "next/link"
import Image from "next/image"
import { Github, Twitter, Linkedin, Heart, Facebook , Instagram, Youtube} from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link href="/" className="flex items-center gap-2 md:mr-2">
            <div className="relative w-8 h-8">
              <Image 
                src="/logo.png" 
                alt="QuizSpark Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              QuizSpark
            </span>
          </Link>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with{" "}
            <Heart className="inline-block h-4 w-4 text-red-500 animate-pulse" />{" "}
            by{" "}
            <Link
              href="https://github.com/FarhanAlam-Official"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              Farhan Alam
            </Link>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/FarhanAlam-Official"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground transition-colors hover:text-[#333333] dark:hover:text-[#ffffff]"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link
            href="https://twitter.com/FarhanAlam_01"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground transition-colors hover:text-[#1DA1F2]"
          >
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link
            href="https://www.linkedin.com/in/farhan-alam-aa56b2309"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground transition-colors hover:text-[#0A66C2]"
          >
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link
            href="https://www.facebook.com/farhan.alam.01"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground transition-colors hover:text-[#1877F2]"
          >
            <Facebook className="h-5 w-5" />
            <span className="sr-only">Facebook</span>
          </Link>
          <Link
            href="https://www.instagram.com/farhan.alam.01"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground transition-colors hover:text-[#E4405F]"
          >
            <Instagram className="h-5 w-5" />
            <span className="sr-only">Instagram</span>
          </Link>
          <Link
            href="https://www.youtube.com/@farhanalam"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground transition-colors hover:text-[#FF0000]"
          >
            <Youtube className="h-5 w-5" />
            <span className="sr-only">YouTube</span>
          </Link>
        </div>
      </div>
    </footer>
  )
} 