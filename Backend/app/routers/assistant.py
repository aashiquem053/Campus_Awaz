"""Assistant chat + today's timetable + notifications list (student & faculty)."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ..core.security import current_user, roles
from ..database import q, run, now
from ..services.chat_engine import answer
from ..services.notifications import match
from ..services.timetable import slots, blocks, place, tl
from ..config import DAYS

router = APIRouter()
class Txt(BaseModel): t: str


@router.post("/chat")
def chat(b: Txt, u=Depends(roles("student", "faculty"))):
    a, L = answer(b.t.strip()[:300], u); return {"a": a, "lang": L}          # lang: 0 English, 1 Hinglish, 2 Hindi


@router.get("/today")
def today(u=Depends(roles("student", "faculty"))):
    n = now(); d = n.strftime("%a"); sl = slots(u, d) if d in DAYS else [[]] * 8
    if sl is None: return {"day": d, "blocks": None}
    return {"day": d, "blocks": [{"t": f"{tl(b['i'])} - {tl(b['end'] + 1)}", "s": "Library" if b["k"] == "LIB" else b["s"], "f": b.get("f", ""),
                                   "p": place(b["r"]) if b.get("r") else "", "sec": b.get("sec", ""), "on": b["i"] <= n.hour - 9 <= b["end"]} for b in blocks(sl)]}


@router.get("/notes")
def notes(u=Depends(roles("student", "faculty"))):
    return {"seen": u["seen"], "items": [n for n in q("select * from notes order by id desc limit 300") if match(u, n["to_"])][:60]}


@router.post("/notes/seen")
def seen(u=Depends(roles("student", "faculty"))):
    run("update users set seen=? where email=?", now().timestamp(), u["email"]); return {}
