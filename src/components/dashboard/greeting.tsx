'use client'

import { useEffect, useState } from 'react'

// Time-of-day greeting computed from the user's *local* clock (the server runs
// UTC, so this must be client-side to be correct).
export function Greeting({ name }: { name: string }) {
  const [word, setWord] = useState('Welcome back')

  useEffect(() => {
    const h = new Date().getHours()
    setWord(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening')
  }, [])

  return (
    <>
      {word}{name ? `, ${name}` : ''} <span className="inline-block">👋</span>
    </>
  )
}
