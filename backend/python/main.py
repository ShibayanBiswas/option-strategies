"""FastAPI service for interactive option strategy payoffs and Greeks."""
from engine import STRATEGY_LEGS, compute_payoff
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="Option Strategies Analytics Engine",
    description="Payoff diagrams and Black–Scholes Greeks for option strategies",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PayoffRequest(BaseModel):
    strategyId: str
    params: dict = Field(default_factory=dict)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "python-analytics", "strategies": str(len(STRATEGY_LEGS))}


@app.get("/strategies/computable")
def computable_strategies() -> dict[str, list[str]]:
    return {"strategies": sorted(STRATEGY_LEGS.keys())}


@app.post("/payoff")
def payoff(body: PayoffRequest) -> dict:
    try:
        return compute_payoff(body.strategyId, body.params)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except KeyError as exc:
        raise HTTPException(status_code=400, detail=f"Missing parameter: {exc}") from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
