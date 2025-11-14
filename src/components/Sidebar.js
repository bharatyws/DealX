import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../cstm.style.css";

export default function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const [openMenu, setOpenMenu] = useState({
    loans: false,
    dealx: false,
  });

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const sidebarStyle = {
    width: "250px",
    minWidth: "250px",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    height: "100vh",
    position: "fixed", // 👈 makes it stay in place
    top: 0,
    left: 0,
    overflowY: "auto", // allows internal vertical scrolling if content overflows
    overflowX: "hidden",
    zIndex: 1000, // ensures it stays above other elements
  };

  const buttonBase = {
    border: "1px solid #fff",
    color: "#fff",
    backgroundColor: "transparent",
    width: "100%",
    textAlign: "left",
    marginBottom: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const activeButton = {
    ...buttonBase,
    backgroundColor: "#fff",
    color: "#000",
  };

  const listItemStyle = {
    backgroundColor: "#1e1e1e",
    border: "none",
    paddingLeft: "20px",
  };

  const linkStyle = {
    color: "#fff",
    textDecoration: "none",
    display: "block",
  };

  const activeLinkStyle = {
    ...linkStyle,
    color: "#000",
    backgroundColor: "#fff",
    borderRadius: "4px",
    padding: "4px 8px",
  };

  return (
    <div className="text-white p-3 sidebar" style={sidebarStyle}>
      <h4 className="mb-4">UTC Finance</h4>
      <ul className="nav flex-column">
        {/* Home */}
        <li className="nav-item mb-2">
          <Link
            to="/"
            style={isActive("/") ? activeButton : buttonBase}
            className="btn"
          >
            Home
          </Link>
        </li>

        {/* Contact */}
        <li className="nav-item mb-2">
          <Link
            to="/contact-us"
            style={isActive("/contact-us") ? activeButton : buttonBase}
            className="btn"
          >
            Contact Us
          </Link>
        </li>

        {/* Loans Menu */}
        <button
          className="btn"
          type="button"
          onClick={() => toggleMenu("loans")}
          style={buttonBase}
        >
          <span>Loans</span>
          <span>{openMenu.loans ? "▲" : "▼"}</span>
        </button>
        {openMenu.loans && (
          <ul className="list-group list-group-flush mb-2">
            <li className="list-group-item" style={listItemStyle}>
              <Link
                to="/loans/personal"
                style={isActive("/loans/personal") ? activeLinkStyle : linkStyle}
              >
                Personal Loan
              </Link>
            </li>
            <li className="list-group-item" style={listItemStyle}>
              <Link
                to="/loans/home"
                style={isActive("/loans/home") ? activeLinkStyle : linkStyle}
              >
                Home Loan
              </Link>
            </li>
            <li className="list-group-item" style={listItemStyle}>
              <Link
                to="/loans/business"
                style={isActive("/loans/business") ? activeLinkStyle : linkStyle}
              >
                Business Loan
              </Link>
            </li>
            <li className="list-group-item" style={listItemStyle}>
              <Link
                to="/loans/others"
                style={isActive("/loans/others") ? activeLinkStyle : linkStyle}
              >
                Others
              </Link>
            </li>
          </ul>
        )}

        {/* DealX Menu */}
        <button
          className="btn mt-3"
          type="button"
          onClick={() => toggleMenu("dealx")}
          style={buttonBase}
        >
          <span>DealX</span>
          <span>{openMenu.dealx ? "▲" : "▼"}</span>
        </button>
        {openMenu.dealx && (
          <ul className="list-group list-group-flush">
            <li className="list-group-item" style={listItemStyle}>
              <Link
                to="/dealx/dashboard"
                style={
                  isActive("/dealx/dashboard") ? activeLinkStyle : linkStyle
                }
              >
                Dashboard
              </Link>
            </li>
            <li className="list-group-item" style={listItemStyle}>
              <Link
                to="/dealx/retail-partners"
                style={
                  isActive("/dealx/retail-partners")
                    ? activeLinkStyle
                    : linkStyle
                }
              >
                Retail Partners
              </Link>
            </li>
            <li className="list-group-item" style={listItemStyle}>
              <Link
                to="/dealx/reports"
                style={isActive("/dealx/reports") ? activeLinkStyle : linkStyle}
              >
                Reports
              </Link>
            </li>
            <li className="list-group-item" style={listItemStyle}>
              <Link
                to="/dealx/agents"
                style={isActive("/dealx/agents") ? activeLinkStyle : linkStyle}
              >
                Agents
              </Link>
            </li>
            <li className="list-group-item" style={listItemStyle}>
              <Link
                to="/dealx/customers"
                style={
                  isActive("/dealx/customers") ? activeLinkStyle : linkStyle
                }
              >
                Customers
              </Link>
            </li>
            <li className="list-group-item" style={listItemStyle}>
              <Link
                to="/dealx/loan-book"
                style={
                  isActive("/dealx/loan-book") ? activeLinkStyle : linkStyle
                }
              >
                Loan Book
              </Link>
            </li>
          </ul>
        )}
      </ul>
    </div>
  );
}
