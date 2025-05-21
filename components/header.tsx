"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Book, GraduationCap, LayoutDashboard, ListTodo, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard
  },
  {
    name: "Students",
    href: "/students",
    icon: GraduationCap
  },
  {
    name: "Questions",
    href: "/questions",
    icon: Book
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: ListTodo
  },
  {
    name: "Quiz",
    href: "/quiz",
    icon: Trophy
  }
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex flex-1">
          <Link href="/" className="mr-6 flex items-center space-x-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden">
              <Image 
                src="/favicon/favicon.ico" 
                alt="QuizSpark Icon" 
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <span className="hidden font-bold text-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent sm:inline-block">
              QuizSpark
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80 relative group",
                  pathname === item.href ? "text-foreground" : "text-foreground/60"
                )}
              >
                <span className="flex items-center gap-x-2">
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </span>
                {pathname === item.href && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Add search or other controls here if needed */}
          </div>
          <nav className="flex items-center space-x-2">
            <ModeToggle />
          </nav>
        </div>

        {/* Mobile navigation */}
        <div className="flex items-center md:hidden">
          <Button variant="ghost" className="-ml-4 text-base hover:bg-transparent focus:ring-0">
            <div className="relative w-6 h-6 mr-2 rounded-lg overflow-hidden">
              <Image 
                src="/favicon/favicon.ico" 
                alt="QuizSpark Icon" 
                width={24}
                height={24}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              QuizSpark
            </span>
          </Button>
        </div>
      </div>
    </header>
  )
} 