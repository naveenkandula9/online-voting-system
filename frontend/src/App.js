import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './App.css';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import RaiseComplaint from './pages/RaiseComplaint';
import Register from './pages/Register';
import Results from './pages/Results';
import Vote from './pages/Vote';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/results" element={<Results />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/vote" element={<Vote />} />
            <Route path="/complaint" element={<RaiseComplaint />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
