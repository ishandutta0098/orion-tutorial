import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import AVAILABLE_MODELS, WORKSPACE_PATH
from models.schemas import ModelInfo
from routers.agent import router as agent_router
from routers.chat import router as chat_router
from routers.files import router as files_router
from routers.rules import router as rules_router
from routers.terminal import router as terminal_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Orion backend started")
    Path(WORKSPACE_PATH).mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(title="Orion", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")
app.include_router(files_router, prefix="/api")
app.include_router(agent_router, prefix="/api")
app.include_router(terminal_router, prefix="/api")
app.include_router(rules_router, prefix="/api")

models_router = APIRouter(tags=["models"])


@models_router.get("/models")
async def list_models() -> list[ModelInfo]:
    return [ModelInfo(**m) for m in AVAILABLE_MODELS]


app.include_router(models_router, prefix="/api")
