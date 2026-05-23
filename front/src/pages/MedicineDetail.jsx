import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function MedicineDetail() {
  const { id } = useParams();
  const [med, setMed] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { api.getMedicineDetail(id).then(setMed); }, [id]);

  if (!med) return <p>Загрузка...</p>;

  const renderList = (arr) => Array.isArray(arr) && arr[0] ? arr.join(", ") : "Нет данных";

  return (
    <section>
      <button onClick={() => navigate(-1)} style={{marginBottom: '15px', padding: '6px 12px', cursor:'pointer'}}>← Назад в каталог</button>
      <h2>{med.name}</h2>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px'}}>
        <div><strong> Страна:</strong> {med.country}</div>
        <div><strong>Форма:</strong> {med.release_form}</div>
        <div><strong>Рецепт:</strong> {med.prescription_required ? "Требуется" : "Не требуется"}</div>
        <div><strong>Срок годности:</strong> {med.shelf_life_months} мес</div>
        <div><strong>Производитель:</strong> {med.manufacturer || "Не указан"}</div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
        <div style={{background: '#e3f2fd', padding: '15px', borderRadius: '8px'}}>
          <h3>Состав</h3>
          <p>{renderList(med.substances)}</p>
        </div>
        <div style={{background: '#e8f5e9', padding: '15px', borderRadius: '8px'}}>
          <h3> Показания</h3>
          <p>{renderList(med.indications)}</p>
        </div>
      </div>

      <div style={{background: '#ffebee', padding: '15px', borderRadius: '8px', marginTop: '20px'}}>
        <h3>Противопоказания</h3>
        <p style={{whiteSpace: 'pre-wrap'}}>{med.contraindications || "Не указаны в базе"}</p>
      </div>
    </section>
  );
}