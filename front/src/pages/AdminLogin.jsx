import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function AdminLogin() {
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.login(pass);
      if (res.token) {
        localStorage.setItem("admin_token", res.token); // Сохраняем токен
        navigate("/admin/panel"); // Переходим в панель
      }
    } catch {
      setError("Неверный пароль"); // Показываем ошибку
    }
  };

  return (
    <div className="auth-box">
      <h2>Вход админа</h2>
      <form onSubmit={handleLogin}>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Пароль" required />
        <button type="submit">Войти</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}