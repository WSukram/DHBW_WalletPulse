import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import MainLayout from './components/layout/MainLayout'
import PrivateRoute from './components/PrivateRoute'
import Dashboard from './pages/Dashboard'
import Wallet from './pages/Wallet'
import Assets from './pages/Assets'
import History from './pages/History'
import Analytics from './pages/Analytics'
import Security from './pages/Security'
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";


function App() {
  return (
    <AppProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/history" element={<History />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/security" element={<Security />} />
          </Route>
        </Route>
      </Routes>
    </AppProvider>
  )
}

export default App
