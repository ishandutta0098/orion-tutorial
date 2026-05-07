from pathlib import Path

from fastapi import APIRouter

from config import WORKSPACE_PATH
from models.schemas import RulesRequest

router = APIRouter(tags=["rules"])

RULES_FILE = Path(WORKSPACE_PATH) / ".cursorrules"


@router.get("/rules")
async def get_rules() -> dict:
    if RULES_FILE.exists():
        return {"content": RULES_FILE.read_text()}
    return {"content": ""}


@router.put("/rules")
async def update_rules(request: RulesRequest) -> dict:
    RULES_FILE.write_text(request.content)
    return {"status": "ok"}
