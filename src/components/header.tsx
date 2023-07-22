import * as React from 'react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  IconGitHub,
  IconVercel
} from '@/components/ui/icons'

export async function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-end space-x-2 w-full">
        <a
          target="_blank"
          href="https://github.com/weaigc/bingo/"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <IconGitHub />
          <span className="hidden ml-2 md:flex">GitHub</span>
        </a>
        <a
          href="https://github.com/weaigc/bingo/"
          target="_blank"
          className={cn(buttonVariants())}
        >
          <IconVercel className="mr" />
          <span className="hidden ml-2 md:flex">Deploy</span>
        </a>
      </div>
    </header>
  )
}
