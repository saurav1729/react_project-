import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AgentDashboard from './pages/AgentDashboard';
import TicketDetail from './pages/TicketDetail';
import AgentAssignedTickets from './pages/AgentAssignedTickets';
import AgentUnassignedTickets from './pages/AgentUnassignedTickets';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import backgroundImage from './assets/background.png';

// Set background image dynamically
document.body.style.backgroundImage = `url(${backgroundImage})`;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />

        {/* Auth Routes */}
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agent/dashboard" element={<AgentDashboard />} />
          <Route path="/agent/tickets" element={<AgentAssignedTickets />} />
          <Route path="/agent/unassigned-tickets" element={<AgentUnassignedTickets />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
