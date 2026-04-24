import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'
import { api } from './api/mockApi'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Products } from './pages/Products'
import { SplashScreen } from './components/SplashScreen'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

const App = () => {
  const [currentPath, setCurrentPath] = useState(localStorage.getItem("current_path") || "dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(!!api.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading for splash screen
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const handleNavigate = (e: any) => {
      const path = e.detail;
      localStorage.setItem("current_path", path);
      setCurrentPath(path);
    };

    window.addEventListener("navigate", handleNavigate);
    return () => {
      window.removeEventListener("navigate", handleNavigate);
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  if (currentPath === "products") {
    return <Products />;
  }

  return <Dashboard />;
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
