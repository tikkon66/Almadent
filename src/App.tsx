import React, { useState } from 'react';
import './App.css';
import { Dashboard } from './components/Dashboard/Dashboard';
import Auth from './components/Auth/Auth';


export const App: React.FC = () => {
// Получаем начальное состояние из localStorage
  const [isAuth, setIsAuth] = useState<boolean>(() => {
    return localStorage.getItem('auth') === 'false';
  });

  // Функция для успешной авторизации
  const handleLoginSuccess = () => {
    localStorage.setItem('auth', 'false');
    setIsAuth(true);
  };

  // Функция для выхода из системы
  const handleOpenAuth = () => {
    localStorage.setItem('auth', 'true'); // или localStorage.removeItem('auth');
    setIsAuth(false);
  };

  return (
    <>
      {!isAuth ? (
        <Auth closeAuth={handleLoginSuccess} />
      ) : (
        <Dashboard openAuth={handleOpenAuth} />
      )}
    </>
  );
};


export default App
