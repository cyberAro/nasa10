import json
import os
import subprocess
import sys
import time
from functools import lru_cache
from pathlib import Path

import firebase_admin
import joblib
import numpy as np
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import auth, credentials
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "web/public/data"
sys.path[:0] = [str(ROOT / "channels"), str(ROOT / "models"), str(ROOT / "api")]

import otp  # noqa: E402
from text_flow import reply as text_reply  # noqa: E402

app = FastAPI(title="Field Shift API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://nasa10.vercel.app", "http://localhost:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    allow_credentials=True,
)


def init_firebase():
    """Initialize Firebase Admin once using an environment variable or JSON file."""
    if not firebase_admin._apps:
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", str(ROOT / "firebase-service-account.json"))
        if not Path(cred_path).exists():
            raise RuntimeError("Firebase service account file not found.")
        firebase_admin.initialize_app(credentials.Certificate(cred_path))


# ... [Keep load, districts, check, yield_model, health, districts, pack, national, backtest, yield routes as-is] ...


@app.post("/api/plan")
def plan(req: PlanRequest):
    check(req.district)
    try:
        r = subprocess.run(
            ["node", str(ROOT / "web/scripts/plan_cli.mjs")],
            input=req.model_dump_json(exclude_none=True),
            capture_output=True,
            text=True,
            timeout=30,
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(504, "Planner timed out")

    if r.returncode != 0:
        raise HTTPException(500, f"Planner process failed: {r.stderr.strip()}")

    try:
        out = json.loads(r.stdout)
    except json.JSONDecodeError:
        raise HTTPException(500, "Invalid JSON returned by planner")

    if "error" in out:
        raise HTTPException(400, out["error"])
    return out


_ip_hits: dict[str, list[float]] = {}


def _ip_ok(request: Request, limit: int = 10) -> bool:
    forwarded = request.headers.get("x-forwarded-for")
    ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "?")
    now = time.time()
    hits = [t for t in _ip_hits.get(ip, []) if now - t < 3600]
    if len(hits) >= limit:
        _ip_hits[ip] = hits
        return False
    _ip_hits[ip] = hits + [now]
    return True


@app.post("/api/otp/verify")
def otp_verify(body: OtpCheck):
    r = otp.check_code(body.reqid, body.code)
    if not r["ok"]:
        raise HTTPException(400, r["error"])
    try:
        init_firebase()
        # Frontend must pass this custom token into signInWithCustomToken(auth, token)
        # to obtain the Firebase ID token used in /api/auth/me
        token = auth.create_custom_token(r["phone"], {"role": "farmer"}).decode("utf-8")
        return {"token": token, "phone": r["phone"]}
    except Exception as e:
        raise HTTPException(500, f"Auth token creation failed: {str(e)}")


@app.get("/api/auth/me")
def get_me(authorization: str | None = Header(default=None)):
    """Expects a Firebase ID Token (obtained after signInWithCustomToken on the client)."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split("Bearer ", 1)[1].strip()
    try:
        init_firebase()
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token.get("uid"),
            "phone": decoded_token.get("phone_number"),
            "role": decoded_token.get("role", "farmer"),
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired ID token")
