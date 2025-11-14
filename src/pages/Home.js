// src/pages/LandingPage.js
import React from "react";

export default function LandingPage() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Welcome to UTC Finance CRM</h1>
        <p style={styles.subtitle}>
          Manage your clients, loans, and communications — all in one place.
        </p>
      </header>

      <section style={styles.content}>
        <button style={styles.button}>Get Started</button>
      </section>

      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} UTC Finance Pvt. Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(135deg, #0052D4, #4364F7, #6FB1FC)",
    color: "white",
    textAlign: "center",
    fontFamily: "Poppins, sans-serif",
  },
  header: {
    marginTop: "15vh",
  },
  title: {
    fontSize: "2.8rem",
    marginBottom: "10px",
    fontWeight: "600",
  },
  subtitle: {
    fontSize: "1.2rem",
    opacity: 0.9,
    maxWidth: "600px",
    margin: "0 auto",
  },
  content: {
    marginTop: "20px",
  },
  button: {
    backgroundColor: "#fff",
    color: "#0052D4",
    border: "none",
    padding: "12px 30px",
    borderRadius: "30px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  footer: {
    marginBottom: "20px",
    fontSize: "0.9rem",
    opacity: 0.8,
  },
};
