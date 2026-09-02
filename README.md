# Antarctic Navigation System

A research-oriented Antarctic navigation platform combining sea-ice forecasting, iceberg drift prediction, and deterministic route optimization for NCPOR mission planning.

## Architecture

- `data_pipeline/`: Fetches, aligns, and quality-controls environmental data.
- `ml_engine/`: Forecasting, drift modeling, training, inference, and evaluation.
- `routing/`: Physics-informed cost modeling and time-dependent A* routing.
- `backend/`: FastAPI service exposing forecasts, routes, mission summaries, and explanatory briefings.
- `frontend/`: React, Deck.gl, and MapLibre polar operations interface.
- `tests/`: Integrity and behavioral tests.
- `notebooks/`: Judge evaluation and analysis notebooks.

## Quick start

1. Copy `.env.example` to `.env` and provide service credentials.
2. Start infrastructure with `docker compose up --build`.
3. Use the sample data in `data/sample/` for offline demonstrations.

The routing engine remains deterministic; the optional LLM agent provides explanations only.
