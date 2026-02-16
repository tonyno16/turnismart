"""
API HTTP FastAPI per il solver OR-Tools.
Endpoint: POST /solve, GET /health
"""
from typing import Any, Optional

from fastapi import FastAPI
from pydantic import BaseModel

from solver_core import solve

app = FastAPI(title="OR-Tools Scheduling API")


class SolveRequest(BaseModel):
    weekStart: str
    periodTimes: dict[str, Any] = {}
    slots: list[dict[str, Any]]
    employees: list[dict[str, Any]]
    fixedAssignments: Optional[list[dict[str, Any]]] = None


@app.post("/solve")
async def solve_endpoint(req: SolveRequest) -> dict:
    data = req.model_dump(exclude_none=True)
    return solve(data)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
