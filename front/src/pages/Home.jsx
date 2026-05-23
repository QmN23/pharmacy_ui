import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Home({ isAdmin }) {
  const [meds, setMeds] = useState([]);
  const [filters, setFilters] = useState({ name: "", country: "", prescription_required: "" });
  const navigate = useNavigate();

  const loadMeds = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== "")
    );
    api.getMedicines(cleanFilters).then(setMeds);
  };

  useEffect(() => { loadMeds(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Удалить?')) return;
    const token = localStorage.getItem("admin_token");
    try {
      await api.deleteMedicine(id, token);
      loadMeds();
    } catch { alert("Ошибка"); }
  };

  return (
    <section>
      <h2>Каталог лекарств</h2>
      <div style={{display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap', background: '#e9ecef', padding: '10px', borderRadius: '8px'}}>
        <input placeholder="Название" value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})} style={{padding: '5px'}} />
        <input placeholder="Страна" value={filters.country} onChange={e => setFilters({...filters, country: e.target.value})} style={{padding: '5px'}} />
        <select value={filters.prescription_required} onChange={e => setFilters({...filters, prescription_required: e.target.value})} style={{padding: '5px'}}>
          <option value="">Все</option>
          <option value="true">По рецепту</option>
          <option value="false">Без рецепта</option>
        </select>
        <button onClick={loadMeds} style={{padding: '5px 15px', cursor: 'pointer'}}>Найти</button>
        <button onClick={() => { setFilters({name:"", country:"", prescription_required:""}); loadMeds(); }} style={{padding: '5px 15px', cursor: 'pointer'}}>Сброс</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Название</th><th>Страна</th><th>Форма</th><th>Рецепт</th>
            <th>Срок</th><th>Производитель</th>
            {isAdmin && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {meds.map(m => (
            <tr key={m.id} onClick={() => navigate(`/medicine/${m.id}`)} style={{cursor: 'pointer'}}>
              <td>{m.name}</td><td>{m.country}</td><td>{m.release_form}</td>
              <td>{m.prescription_required ? "Да" : "Нет"}</td>
              <td>{m.shelf_life_months} мес</td><td>{m.manufacturer || "—"}</td>
              {isAdmin && (
                <td onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleDelete(m.id)} style={{background:'#dc3545', color:'#fff', border:'none', padding:'4px 8px', cursor:'pointer', borderRadius: '4px'}}></button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}