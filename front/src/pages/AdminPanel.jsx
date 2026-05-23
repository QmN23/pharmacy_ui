import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function AdminPanel() {
  const [refs, setRefs] = useState({ manufacturers: [], substances: [], indications: [] });
  const [allMeds, setAllMeds] = useState([]);
  
  // Состояние формы и режима редактирования
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "", country: "", release_form: "", prescription_required: false,
    shelf_life_months: "", manufacturer_id: "", substance_ids: [],
    indication_ids: [], contraindications: ""
  });
  
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) return navigate("/admin");
    api.getRefs().then(setRefs);
    loadMeds();
  }, [token, navigate]);

  const loadMeds = () => api.getMedicines({}).then(setAllMeds);

  const handleChange = (e) => {
    const { name, value, type, checked, options } = e.target;
    if (type === "select-multiple") {
      const selected = Array.from(options).filter(o => o.selected).map(o => Number(o.value));
      setForm(prev => ({ ...prev, [name]: selected }));
    } else {
      setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // Режим редактирования
        await api.updateMedicine(editId, form, token);
        alert("Обновлено");
      } else {
        // Режим добавления
        await api.addMedicine(form, token);
        alert("Добавлено");
      }
      resetForm();
      loadMeds();
    } catch (err) {
      alert("Ошибка: " + err.detail);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setForm({ name: "", country: "", release_form: "", prescription_required: false, shelf_life_months: "", manufacturer_id: "", substance_ids: [], indication_ids: [], contraindications: "" });
  };

  const handleEdit = async (id) => {
    try {
      const data = await api.getMedicineForEdit(id, token);
      // Заполняем форму данными
      setForm({
        ...data,
        substance_ids: data.substance_ids || [],
        indication_ids: data.indication_ids || []
      });
      setEditId(id);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Прокрутка к форме
    } catch {
      alert("Не удалось загрузить данные");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить?')) return;
    await api.deleteMedicine(id, token);
    loadMeds();
    if (editId === id) resetForm();
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const sortedMeds = [...allMeds].sort((a, b) => {
    const valA = a[sortConfig.key] ?? '';
    const valB = b[sortConfig.key] ?? '';
    if (typeof valA === 'boolean') return sortConfig.direction === 'asc' ? (valA === valB ? 0 : valA ? 1 : -1) : (valA === valB ? 0 : valA ? -1 : 1);
    const res = String(valA).localeCompare(String(valB), 'ru');
    return sortConfig.direction === 'asc' ? res : -res;
  });

  if (!token) return null;

  return (
    <section>
      <h2>Панель администратора <button onClick={() => { localStorage.removeItem("admin_token"); navigate("/admin"); }}>Выйти</button></h2>
      
      {/* Форма (общая для добавления и редактирования) */}
      <form onSubmit={handleSubmit} className="admin-form" style={{border: editId ? '2px solid #0d6efd' : 'none'}}>
        <h3>{editId ? `✏️ Редактировать: ID ${editId}` : '➕ Добавить лекарство'}</h3>
        {editId && <button type="button" onClick={resetForm} style={{marginBottom:'10px', background:'#6c757d', color:'#fff', border:'none', padding:'5px 10px', cursor:'pointer'}}>Отмена редактирования</button>}
        
        <input name="name" value={form.name} onChange={handleChange} placeholder="Название" required />
        <input name="country" value={form.country} onChange={handleChange} placeholder="Страна" required />
        <input name="release_form" value={form.release_form} onChange={handleChange} placeholder="Форма" required />
        <input type="number" name="shelf_life_months" value={form.shelf_life_months} onChange={handleChange} placeholder="Срок (мес)" required />
        <label><input type="checkbox" name="prescription_required" checked={form.prescription_required} onChange={handleChange} /> По рецепту</label>
        <textarea name="contraindications" value={form.contraindications} onChange={handleChange} placeholder="Противопоказания" rows="2" />
        
        <select name="manufacturer_id" value={form.manufacturer_id} onChange={handleChange} required>
          <option value="">Производитель</option>
          {refs.manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        
        <select name="substance_ids" multiple value={form.substance_ids} onChange={handleChange} style={{height: '80px'}}>
          {refs.substances.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        
        <select name="indication_ids" multiple value={form.indication_ids} onChange={handleChange} style={{height: '80px'}}>
          {refs.indications.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        
        <button type="submit">{editId ? 'Сохранить изменения' : 'Сохранить'}</button>
      </form>

      {/* Таблица */}
      <h3>Все лекарства</h3>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')} style={{cursor:'pointer'}}>
              Название {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('country')} style={{cursor:'pointer'}}>
              Страна {sortConfig.key === 'country' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th>Форма</th>
            <th>Рецепт</th>
            <th>Производитель</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {sortedMeds.map(m => (
            <tr key={m.id} style={editId === m.id ? {background: '#e3f2fd'} : {}}>
              <td>{m.name}</td>
              <td>{m.country}</td>
              <td>{m.release_form}</td>
              <td>{m.prescription_required ? "Да" : "Нет"}</td>
              <td>{m.manufacturer || "—"}</td>
              <td>
                <button onClick={() => handleEdit(m.id)} style={{background:'#ffc107', border:'none', padding:'4px 8px', cursor:'pointer', borderRadius:'4px', marginRight:'5px'}}>✏️</button>
                <button onClick={() => handleDelete(m.id)} style={{background:'#dc3545', color:'#fff', border:'none', padding:'4px 8px', cursor:'pointer', borderRadius:'4px'}}>🗑</button>
              </td>
            </tr>
          ))}
          {sortedMeds.length === 0 && <tr><td colSpan="6" style={{textAlign:'center'}}>Нет лекарств</td></tr>}
        </tbody>
      </table>
    </section>
  );
}