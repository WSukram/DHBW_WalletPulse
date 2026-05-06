import { Routes, Route } from 'react-router-dom'
function App() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <Routes>
        <Route path="/" element={<div className="flex items-center justify-center h-screen"><h1 className="text-3xl text-primary font-bold">Homepage (Landing)</h1></div>} />
        <Route path="/login" element={<div className="flex items-center justify-center h-screen"><h1 className="text-3xl text-primary font-bold">Login Screen</h1></div>} />
        <Route path="/dashboard" element={<div className="flex items-center justify-center h-screen"><h1 className="text-3xl text-primary font-bold">Dashboard Overview</h1></div>} />
      </Routes>
    </div>
  )
}
export default App
