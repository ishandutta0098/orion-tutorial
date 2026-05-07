import subprocess

from fastapi import APIRouter

from config import WORKSPACE_PATH
from models.schemas import TerminalRequest, TerminalResponse

router = APIRouter(prefix="/terminal", tags=["terminal"])


@router.post("/execute")
async def execute_command(request: TerminalRequest) -> TerminalResponse:
    try:
        result = subprocess.run(
            request.command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=15,
            cwd=WORKSPACE_PATH,
        )
        return TerminalResponse(
            stdout=result.stdout,
            stderr=result.stderr,
            returncode=result.returncode,
        )
    except subprocess.TimeoutExpired:
        return TerminalResponse(
            stdout="",
            stderr="Command timed out after 15 seconds",
            returncode=-1,
        )
