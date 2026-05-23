from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, medicines

app = FastAPI()

# Разрешаем CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Адрес вашего React-приложения
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы (GET, POST, DELETE...)
    allow_headers=["*"],  # Разрешаем все заголовки
)

# Подключаем роутеры
app.include_router(auth.router)
app.include_router(medicines.router)

@app.get("/")
def root():
    return {"status": "ok"}