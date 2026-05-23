from fastapi import APIRouter, HTTPException
from schemas import LoginRequest, TokenResponse

router = APIRouter(prefix="/api/admin", tags=["auth"])
ADMIN_TOKEN = "learn_pharmacy_secret"  # Простой токен

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
    # Сравниваем пароль
    if req.password == "admin123":
        return TokenResponse(token=ADMIN_TOKEN)
    raise HTTPException(status_code=401, detail="Неверный пароль")