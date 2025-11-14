// src/pages/ComingSoon.js
import React, { useEffect, useState } from "react";

export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2025-12-31T00:00:00"); // <-- set your launch date here

    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚀 Coming Soon</h1>
      <p style={styles.subtitle}>We’re working hard to launch something amazing!</p>

      <div style={styles.timer}>
        <div style={styles.box}>
          <span style={styles.number}>{timeLeft.days}</span>
          <span style={styles.label}>Days</span>
        </div>
        <div style={styles.box}>
          <span style={styles.number}>{timeLeft.hours}</span>
          <span style={styles.label}>Hours</span>
        </div>
        <div style={styles.box}>
          <span style={styles.number}>{timeLeft.minutes}</span>
          <span style={styles.label}>Minutes</span>
        </div>
        <div style={styles.box}>
          <span style={styles.number}>{timeLeft.seconds}</span>
          <span style={styles.label}>Seconds</span>
        </div>
      </div>

      <p style={styles.footer}>Stay tuned — we’ll be live soon!</p>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontFamily: "Poppins, sans-serif",
  },
  title: {
    fontSize: "3rem",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "1.2rem",
    marginBottom: "40px",
  },
  timer: {
    display: "flex",
    gap: "20px",
  },
  box: {
    background: "rgba(255,255,255,0.15)",
    padding: "20px 30px",
    borderRadius: "10px",
  },
  number: {
    display: "block",
    fontSize: "2rem",
    fontWeight: "bold",
  },
  label: {
    fontSize: "0.9rem",
    textTransform: "uppercase",
    opacity: 0.8,
  },
  footer: {
    marginTop: "50px",
    fontSize: "1rem",
    opacity: 0.8,
  },
};
