import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import ContactUs from "./pages/ContactUs";
import PersonalLoan from "./pages/Loans/PersonalLoan";
import HomeLoan from "./pages/Loans/HomeLoan";
import BusinessLoan from "./pages/Loans/BusinessLoan";
import Others from "./pages/Loans/Others";
import Dashboard from "./pages/DealX/Dashboard";
import RetailPartners from "./pages/DealX/RetailPartners";
import Reports from "./pages/DealX/Reports";
import Agents from "./pages/DealX/Agents";
import Customers from "./pages/DealX/Customers";
import LoanBook from "./pages/DealX/LoanBook"

import "./App.css";
import './cstm.style.css'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (userId === "admin" && password === "123456") {
      setIsLoggedIn(true);
    } else {
      alert("Invalid credentials");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <form className="p-4 shadow rounded bg-white" onSubmit={handleLogin}>
          <h3 className="mb-3 text-center">UTC Finance CRM</h3>
          <div className="mb-3">
            <label className="form-label">User ID</label>
            <input
              type="text"
              className="form-control"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <Router>
      <div className="d-flex">
        {/* Sidebar stays visible on all pages */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-grow-1 remove-padding p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact-us" element={<ContactUs />} />

            {/* Loans */}
            <Route path="/loans/personal" element={<PersonalLoan />} />
            <Route path="/loans/home" element={<HomeLoan />} />
            <Route path="/loans/business" element={<BusinessLoan />} />
            <Route path="/loans/others" element={<Others />} />

            {/* DealX */}
            <Route path="/dealx/dashboard" element={<Dashboard />} />
            <Route path="/dealx/retail-partners" element={<RetailPartners />} />
            <Route path="/dealx/reports" element={<Reports />} />
            <Route path="/dealx/agents" element={<Agents />} />
            <Route path="/dealx/customers" element={<Customers />} />
            <Route path="/dealx/loan-book" element={<LoanBook />} />
            

            {/* Redirect any unknown route to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
