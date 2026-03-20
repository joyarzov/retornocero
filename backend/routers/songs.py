from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from database import get_db
import models
from auth_utils import get_current_user, get_current_admin

router = APIRouter(prefix="/songs", tags=["songs"])


class SongCreate(BaseModel):
    title: str
    artist: str
    key: Optional[str] = None
    capo: Optional[int] = 0
    content: str
    youtube_url: Optional[str] = None
    notes: Optional[str] = None
    source_url: Optional[str] = None


class SongUpdate(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    key: Optional[str] = None
    capo: Optional[int] = None
    content: Optional[str] = None
    youtube_url: Optional[str] = None
    notes: Optional[str] = None


class SongResponse(BaseModel):
    id: int
    title: str
    artist: str
    key: Optional[str]
    capo: int
    content: str
    youtube_url: Optional[str]
    notes: Optional[str]
    source_url: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: Optional[int]

    class Config:
        from_attributes = True


class SongListItem(BaseModel):
    id: int
    title: str
    artist: str
    key: Optional[str]
    capo: int
    youtube_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[SongListItem])
def list_songs(
    search: Optional[str] = Query(None),
    key: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Song)
    if search:
        query = query.filter(
            or_(
                models.Song.title.ilike(f"%{search}%"),
                models.Song.artist.ilike(f"%{search}%")
            )
        )
    if key:
        query = query.filter(models.Song.key == key)
    return query.order_by(models.Song.title).offset(skip).limit(limit).all()


@router.get("/{song_id}", response_model=SongResponse)
def get_song(
    song_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song


@router.post("/", response_model=SongResponse)
def create_song(
    song: SongCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    db_song = models.Song(**song.dict(), created_by=current_user.id)
    db.add(db_song)
    db.commit()
    db.refresh(db_song)
    return db_song


@router.put("/{song_id}", response_model=SongResponse)
def update_song(
    song_id: int,
    song: SongUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    db_song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not db_song:
        raise HTTPException(status_code=404, detail="Song not found")
    for field, value in song.dict(exclude_unset=True).items():
        setattr(db_song, field, value)
    db.commit()
    db.refresh(db_song)
    return db_song


@router.delete("/{song_id}")
def delete_song(
    song_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    db_song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not db_song:
        raise HTTPException(status_code=404, detail="Song not found")
    db.delete(db_song)
    db.commit()
    return {"message": "Song deleted"}
