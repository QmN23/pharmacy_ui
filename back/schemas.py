from pydantic import BaseModel
from typing import List

class LoginRequest(BaseModel):
    password: str  # Проверяем вход

class TokenResponse(BaseModel):
    token: str  # Отдаём токен

class MedicineCreate(BaseModel):
    name: str
    country: str
    release_form: str
    prescription_required: bool = False
    shelf_life_months: int
    manufacturer_id: int
    substance_ids: List[int] = []  # Список веществ
    indication_ids: List[int] = []  # Список показаний