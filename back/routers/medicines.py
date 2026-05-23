from fastapi import APIRouter, Depends, HTTPException, Header, Query
from db import get_db
from schemas import MedicineCreate
import reps.medicine_repo as repo

router = APIRouter(prefix="/api", tags=["medicines"])
ADMIN_TOKEN = "learn_pharmacy_secret"

def verify_admin(authorization: str = Header(default=None)):
    # Проверяем заголовок
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Нужна авторизация")
    token = authorization.split(" ", 1)[1]
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Неверный токен")

@router.get("/medicines")
def get_medicines(
    name: str = Query(None),
    country: str = Query(None),
    prescription_required: bool = Query(None),
    conn=Depends(get_db)
):
    # Отдаём с фильтрами
    return repo.get_all_medicines(conn, name, country, prescription_required)

@router.get("/medicines/{med_id}")
def get_medicine_detail(med_id: int, conn=Depends(get_db)):
    # Одно лекарство
    med = repo.get_medicine_by_id(conn, med_id)
    if not med:
        raise HTTPException(status_code=404, detail="Не найдено")
    return med

@router.get("/references")
def get_references(conn=Depends(get_db)):
    # Отдаём справочники
    return repo.get_references(conn)

@router.post("/medicines")
def add_medicine(med: MedicineCreate, conn=Depends(get_db), _: bool = Depends(verify_admin)):
    # Создаём запись
    try:
        repo.create_medicine(conn, med.model_dump())
        return {"message": "Успешно"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/medicines/{med_id}")
def delete_medicine(med_id: int, conn=Depends(get_db), _: bool = Depends(verify_admin)):
    # Удаляем по id
    repo.delete_medicine(conn, med_id)
    return {"message": "Удалено"}

@router.get("/medicines/{med_id}/edit")
def get_med_for_edit(med_id: int, conn=Depends(get_db), _: bool = Depends(verify_admin)):
    # Данные для формы редактирования
    return repo.get_medicine_for_edit(conn, med_id)

@router.put("/medicines/{med_id}")
def update_medicine(med_id: int, med: MedicineCreate, conn=Depends(get_db), _: bool = Depends(verify_admin)):
    # Обновление лекарства
    try:
        repo.update_medicine(conn, med_id, med.model_dump())
        return {"message": "Обновлено"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))