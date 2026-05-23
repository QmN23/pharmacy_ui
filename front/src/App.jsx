import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import MedicineDetail from './pages/MedicineDetail';
import { useState, useEffect } from 'react'; // Добавили хуки
import './App.css';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  // Проверяем токен при каждой загрузке страницы
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    setIsAdmin(!!token);
  }, []);

  // Функция выхода
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAdmin(false);
    window.location.href = "/"; // Перезагружаем страницу, чтобы сбросить все состояния
  };

  return (
    <BrowserRouter>
      <nav className="navbar">
        <h1>Аптека</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <a href="/">Каталог</a>
          {isAdmin ? (
            <>
              <span style={{ color: '#ffeb3b', fontWeight: 'bold' }}>Админ</span>
              <a href="/admin/panel">Панель</a>
              <button 
                onClick={handleLogout}
                style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
              >
                Выйти
              </button>
            </>
          ) : (
            <a href="/admin">Войти</a>
          )}
        </div>
      </nav>
      
      <main className="container">
        <Routes>
          <Route path="/" element={<Home isAdmin={isAdmin} />} /> {/* Передаем статус админа вниз */}
          <Route path="/medicine/:id" element={<MedicineDetail />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}