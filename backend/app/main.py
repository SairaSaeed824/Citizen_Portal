from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.opportunities import router as opportunities_router
from app.api.routes.submitted_opportunities import router as submitted_opportunities_router
from app.api.routes.scraper_scheduler import router as scraper_scheduler_router
from app.api.routes.chatbot import router as chatbot_router
from app.scheduler.scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(
    title="Citizen Portal API",
    version="1.0.0",
    lifespan=lifespan,
)

# The frontend is a public Vercel application and the FastAPI API is public.
# No cookies/auth credentials are sent from the browser to these endpoints,
# so wildcard CORS is appropriate here and also covers Vercel preview URLs.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(opportunities_router)
app.include_router(submitted_opportunities_router)
app.include_router(scraper_scheduler_router)
app.include_router(chatbot_router)


@app.get("/")
def root():
    return {
        "message": "Citizen Portal API is running"
    }
