const API_URL = "http://localhost:8000/api";

export const api = {
  getMedicines: (filters) => {
    // Собираем параметры
    const params = new URLSearchParams(filters).toString();
    return fetch(`${API_URL}/medicines?${params}`).then(r => r.json());
  },
  getMedicineDetail: (id) => fetch(`${API_URL}/medicines/${id}`).then(r => r.json()),
  getRefs: () => fetch(`${API_URL}/references`).then(r => r.json()),
  login: (pass) => fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: pass })
  }).then(r => r.json()),
  addMedicine: (data, token) => fetch(`${API_URL}/medicines`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  deleteMedicine: (id, token) => fetch(`${API_URL}/medicines/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json()),
  getMedicineForEdit: (id, token) => fetch(`${API_URL}/medicines/${id}/edit`, {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json()),
  updateMedicine: (id, data, token) => fetch(`${API_URL}/medicines/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
};