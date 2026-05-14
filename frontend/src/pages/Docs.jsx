import { useEffect } from 'react'
import { ApiReferenceReact } from '@scalar/api-reference-react'
import '@scalar/api-reference-react/style.css'

export default function Docs() {
  useEffect(() => {
    document.title = 'API Docs · WalletPulse'
  }, [])

  return (
    <ApiReferenceReact
      configuration={{
        url: 'http://localhost:8080/v3/api-docs',
        theme: 'purple',
        darkMode: true,
      }}
    />
  )
}
