import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Wallet from './pages/Wallet'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="flex items-center justify-center h-screen"><h1 className="text-3xl text-primary font-bold">Homepage (Landing)</h1></div>} />
      <Route path="/login" element={<div className="flex items-center justify-center h-screen"><h1 className="text-3xl text-primary font-bold">Login Screen</h1></div>} />

      {/* App Routes wrapped in the MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/assets" element={<div className="p-6"><h2 className="text-2xl">Assets Page</h2></div>} />
        <Route path="/history" element={<div className="p-6"><h2 className="text-2xl">History Page</h2></div>} />
        <Route path="/analytics" element={<div className="p-6"><h2 className="text-2xl">Analytics Page</h2></div>} />
        <Route path="/security" element={<div className="p-6"><h2 className="text-2xl">Security Page</h2></div>} />
      </Route>
    </Routes>
  )
}

export default App
