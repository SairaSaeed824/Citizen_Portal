from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.opportunities import router as opportunities_router

app = FastAPI(
    title="Citizen Portal API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(opportunities_router)


@app.get("/")
def root():
    return {
        "message": "Citizen Portal API is running"
    }