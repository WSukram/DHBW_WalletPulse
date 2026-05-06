import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Wallet from './pages/Wallet'
import Assets from './pages/Assets'
import History from './pages/History'
import Analytics from './pages/Analytics'
import Security from './pages/Security'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="flex items-center justify-center h-screen"><h1 className="text-3xl text-primary font-bold">Homepage (Landing)</h1></div>} />
      <Route path="/login" element={<div className="flex items-center justify-center h-screen"><h1 className="text-3xl text-primary font-bold">Login Screen</h1></div>} />

      {/* App Routes wrapped in the MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/history" element={<History />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/security" element={<Security />} />
      </Route>
    </Routes>
  )
}

export default App
