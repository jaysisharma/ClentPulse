import React from 'react'

interface BrandIconProps {
  className?: string
  size?: number
}

// 1. WhatsApp Official Icon
export function WhatsAppIcon({ className = 'w-4 h-4', size }: BrandIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        d="M17.5 14.3c-.2-.1-1.4-.7-1.6-.8-.2-.1-.3-.1-.5.1-.1.2-.6.8-.7 1-.1.1-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.2.2-.4 0-.1 0-.3-.1-.4-.1-.1-.5-1.2-.7-1.6-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1 0 1.3.9 2.5 1.1 2.7.1.2 1.9 2.9 4.5 4.1.6.3 1.1.5 1.5.6.6.2 1.2.2 1.7.1.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.1-1.3-.1-.2-.3-.3-.5-.4z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

// 2. Gmail Official Multi-color Icon
export function GmailIcon({ className = 'w-4 h-4', size }: BrandIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 7v11c0 1.1.9 2 2 2h2V9.8L2 7z"
        fill="#4285F4"
      />
      <path
        d="M20 7v11c0 1.1-.9 2-2 2h-2V9.8L20 7z"
        fill="#34A853"
      />
      <path
        d="M16 4h2c1.1 0 2 .9 2 2v1L12 12.5 4 7V6c0-1.1.9-2 2-2h2l4 3 4-3z"
        fill="#EA4335"
      />
      <path
        d="M4 7l8 5.5L20 7v-.5c0-.4-.1-.8-.3-1.1L12 11 4.3 5.4C4.1 5.7 4 6.1 4 6.5V7z"
        fill="#C5221F"
      />
      <path
        d="M6 20h12v-9L12 15.5 6 11v9z"
        fill="#FBBC04"
      />
    </svg>
  )
}

// 3. Google Drive Official Multi-color Icon
export function GoogleDriveIcon({ className = 'w-4 h-4', size }: BrandIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.2 2.5L2.8 11.8l3.6 6.2 5.4-9.3L8.2 2.5z"
        fill="#0066DA"
      />
      <path
        d="M15.8 2.5H8.2l3.6 6.2h10.9L15.8 2.5z"
        fill="#00AC47"
      />
      <path
        d="M21.2 11.8H9.3l-2.9 5h14.8l2.9-5h-2.9z"
        fill="#EA4335"
      />
      <path
        d="M15.8 2.5l5.4 9.3-3.6 6.2-5.4-9.3 3.6-6.2z"
        fill="#FFBA00"
      />
    </svg>
  )
}

// 4. Figma Official 5-color Logo
export function FigmaIcon({ className = 'w-4 h-4', size }: BrandIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 38 57"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z"
        fill="#1ABCFE"
      />
      <path
        d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z"
        fill="#0ACF83"
      />
      <path
        d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z"
        fill="#FF7262"
      />
      <path
        d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z"
        fill="#F24E1E"
      />
      <path
        d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z"
        fill="#A259FF"
      />
    </svg>
  )
}

// 5. Notion Official Icon
export function NotionIcon({ className = 'w-4 h-4', size }: BrandIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l11.056-.653c.42-.047.466-.233.326-.466L16.467 1.83c-.56-.466-.98-.606-2.193-.513L3.292 2.203c-.513.047-.606.28-.42.513l1.587 1.492zm1.26 3.684v13.623c0 .84.42 1.166 1.306 1.12l12.456-.7c.886-.047 1.12-.56 1.12-1.353V6.96c0-.793-.326-1.166-1.12-1.12l-12.643.7c-.886.047-1.12.467-1.12 1.352zm11.753.84v10.87c0 .42-.233.56-.56.56-.233 0-.466-.093-.7-.373l-5.6-7.091v6.718c.373.186.7.28.7.653 0 .186-.14.373-.513.373l-2.428.14c-.373 0-.513-.187-.513-.42 0-.373.233-.513.7-.653V9.678c-.373-.186-.7-.28-.7-.653 0-.186.14-.373.513-.373l2.848-.186c.373 0 .653.186.886.513l5.413 6.904V9.678c-.373-.186-.7-.28-.7-.653 0-.186.14-.373.513-.373l2.381-.14c.373 0 .56.187.56.42 0 .373-.28.513-.7.653v.147z" />
    </svg>
  )
}

// 6. Google Sheets Official Icon
export function GoogleSheetsIcon({ className = 'w-4 h-4', size }: BrandIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.5 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7.5L14.5 2z"
        fill="#0F9D58"
      />
      <path
        d="M14 2v6h6L14 2z"
        fill="#87CEAC"
      />
      <path
        d="M8 12h8v2H8v-2zm0 3h8v2H8v-2zm0-6h4v2H8V9z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

// 7. Stripe Official Logo
export function StripeIcon({ className = 'w-4 h-4', size }: BrandIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="5" fill="#635BFF" />
      <path
        d="M13.9 10.4c-.8-.4-1.3-.6-1.3-1 0-.3.3-.5.9-.5.8 0 1.6.3 2.3.7l.7-1.8c-.8-.4-1.9-.6-3-.6-2.2 0-3.7 1.2-3.7 3.1 0 2.4 3.3 2.1 3.3 3.1 0 .4-.4.6-1.1.6-1 0-2-.5-2.8-1l-.8 1.9c.9.6 2.2.9 3.5.9 2.3 0 3.9-1.1 3.9-3.1.1-2.4-3.3-2.1-3.3-3.1"
        fill="#FFFFFF"
      />
    </svg>
  )
}

// 8. GitHub Official Icon
export function GitHubIcon({ className = 'w-4 h-4', size }: BrandIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

// 9. Google Calendar Official Icon
export function GoogleCalendarIcon({ className = 'w-4 h-4', size }: BrandIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="4" width="18" height="17" rx="3" fill="#FFFFFF" stroke="#4285F4" strokeWidth="2" />
      <path d="M3 8h18" stroke="#4285F4" strokeWidth="2" />
      <path d="M8 2v3M16 2v3" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
      <text
        x="12"
        y="17"
        fontSize="8"
        fontWeight="bold"
        fill="#1A73E8"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        31
      </text>
    </svg>
  )
}

// 10. VS Code Official Icon
export function VSCodeIcon({ className = 'w-4 h-4', size }: BrandIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.5 1.5L7 10.5 3 7.5 1 8.8l4.2 3.2L1 15.2l2 1.3 4-3 10.5 9 5-2.5V4l-5-2.5z"
        fill="#007ACC"
      />
      <path
        d="M17.5 1.5L7 10.5 9.8 12l7.7-6.5v-4z"
        fill="#1F8AD2"
      />
      <path
        d="M17.5 22.5l-7.7-6.5-2.8 1.5 10.5 9 5-2.5v-4l-5 2.5z"
        fill="#0065A9"
      />
      <path
        d="M22.5 4l-5 3.5v9l5 3.5V4z"
        fill="#007ACC"
      />
    </svg>
  )
}

// 11. Slack Official Icon
export function SlackIcon({ className = 'w-4 h-4', size }: BrandIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 15a2 2 0 0 1-2-2 2 2 0 0 1 2-2h2v2a2 2 0 0 1-2 2zm1-2a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-5z"
        fill="#E01E5A"
      />
      <path
        d="M9 6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v2H9V6zm2 1a2 2 0 0 1 2 2 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 1 2-2h5z"
        fill="#36C5F0"
      />
      <path
        d="M18 9a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2V11a2 2 0 0 1 2-2zm-1 2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5z"
        fill="#2EB67D"
      />
      <path
        d="M15 18a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2h4v2zm-2-1a2 2 0 0 1-2-2 2 2 0 0 1 2-2h5a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-5z"
        fill="#ECB22E"
      />
    </svg>
  )
}
