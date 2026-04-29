'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Props {
  text: string
}

export default function CopyButton({ text }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-[#7C9070] text-[12px] font-medium border border-[#7C9070] rounded-lg px-2.5 py-1 hover:bg-[#7C9070]/5 transition-colors"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? '已複製' : '複製'}
    </button>
  )
}
