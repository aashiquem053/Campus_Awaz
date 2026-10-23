"""Admin-only endpoints (the 3 fixed admins)."""
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from ..config import DOCS_DIR
from ..core.security import admin_only
from ..database import q, one, run, now
from ..services.notifications import notify
from ..services.timetable import fd
from .assistant import Txt

router = APIRouter(prefix="/admin")
class Ev(BaseModel): k: str = "Event"; title: str; d: str; tm: str = ""; x: str = ""
class Room(BaseModel): f: str; t: str; n: str = ""


@router.get("/queries")
def queries(u=Depends(admin_only)): return q("select * from ques where a is null order by id desc")


@router.post("/queries/{i}")
def answer_query(i: int, b: Txt, u=Depends(admin_only)):
    x = one("select * from ques where id=?", i)
    if not x or not b.t.strip(): raise HTTPException(400, "Nothing to answer")
    run("update ques set a=? where id=?", b.t.strip(), i)
    notify("em:" + x["email"], "Admin answered your question", f"{x['q']} -> {b.t.strip()}"); return {}


@router.post("/complaints/{i}")
def resolve(i: int, b: Txt, u=Depends(admin_only)):
    x = one("select * from compl where id=?", i)
    if not x or not b.t.strip(): raise HTTPException(400, "Write a response")
    run("update compl set r=? where id=?", b.t.strip(), i); notify("em:" + x["email"], "Complaint resolved", b.t.strip()); return {}


@router.post("/events")
def add_event(b: Ev, u=Depends(admin_only)):
    run("insert into events(k,title,d,tm,x) values(?,?,?,?,?)", b.k, b.title.strip(), b.d, b.tm, b.x)
    notify("students", f"New {b.k}: {b.title}", fd(b.d) + (f", {b.tm}" if b.tm else "") + (f" - {b.x}" if b.x else "")); return {}


@router.post("/upload")                                          # step 1: upload (stays hidden)
async def upload(file: UploadFile = File(...), title: str = Form(""), u=Depends(admin_only)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in {".pdf", ".docx", ".xlsx", ".jpg", ".jpeg"}: raise HTTPException(400, "Allowed: pdf, docx, xlsx, jpg, jpeg")
    data = await file.read()
    if len(data) > 15 * 2 ** 20: raise HTTPException(400, "Max file size is 15 MB")
    (DOCS_DIR / "notices").mkdir(parents=True, exist_ok=True)
    fn = f"notices/{uuid.uuid4().hex}{ext}"; (DOCS_DIR / fn).write_bytes(data)
    run("insert into docs(title,fn,cat,pub,ts) values(?,?,?,?,?)", title.strip() or Path(file.filename).stem, fn, "notice", 0, now().timestamp()); return {}


@router.post("/docs/{i}/publish")                                # step 2: publish -> students see it + notification + email
def publish(i: int, u=Depends(admin_only)):
    d = one("select * from docs where id=?", i)
    if not d: raise HTTPException(404, "Not found")
    run("update docs set pub=1 where id=?", i)
    notify("students", "New notice: " + d["title"], "Open Events & Notices on your dashboard to view or download it."); return {}


@router.post("/rooms")
def add_room(b: Room, u=Depends(admin_only)):
    run("insert into rooms(f,t) values(?,?)", b.f.strip(), b.t.strip())
    notify("all", "Room change", f"Room {b.f} is engaged{' (' + b.n + ')' if b.n else ''}. Alternative: {b.t}"); return {}


@router.get("/rooms")
def rooms(u=Depends(admin_only)): return q("select * from rooms")


@router.delete("/{kind}/{i}")
def delete(kind: str, i: int, u=Depends(admin_only)):
    if kind not in ("events", "docs", "rooms"): raise HTTPException(404, "Unknown")
    if kind == "docs":
        d = one("select * from docs where id=?", i)
        if d and d["cat"] == "notice": (DOCS_DIR / d["fn"]).unlink(missing_ok=True)
    run(f"delete from {kind} where id=?", i); return {}
