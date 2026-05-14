import { useEffect } from 'react'
import { ApiReferenceReact } from '@scalar/api-reference-react'
import '@scalar/api-reference-react/style.css'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const SPEC_URL = `${API_BASE}/v3/api-docs`

export default function Docs() {
  useEffect(() => {
    document.title = 'API Docs · WalletPulse'
  }, [])

  return (
    <ApiReferenceReact
      configuration={{
        url: SPEC_URL,
        theme: 'purple',
        darkMode: true,
      }}
    />
  )
}
