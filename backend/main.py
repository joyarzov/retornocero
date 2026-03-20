from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from contextlib import asynccontextmanager
import logging

from database import engine, Base, get_db
from routers import auth, songs, users, import_song
import models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    # Create default admin user if not exists
    from database import SessionLocal
    from models import User
    from auth_utils import get_password_hash
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "joyarzo").first()
        if not admin:
            admin_user = User(
                username="joyarzo",
                full_name="Jose",
                hashed_password=get_password_hash("Jose1520"),
                is_admin=True,
                is_active=True
            )
            db.add(admin_user)
            # Create read-only users
            for name, username in [("Alvaro", "alvaro"), ("Dany", "dany"), ("Lenys", "lenys"), ("Jody", "jody")]:
                user = User(
                    username=username,
                    full_name=name,
                    hashed_password=get_password_hash(username + "123"),
                    is_admin=False,
                    is_active=True
                )
                db.add(user)
            db.commit()
            logger.info("Default users created")
    except Exception as e:
        logger.error(f"Error creating default users: {e}")
        db.rollback()
    finally:
        db.close()
    yield
    # Shutdown


app = FastAPI(
    title="RetornoCero API",
    description="API para gestión de acordes de banda de covers",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(songs.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(import_song.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "RetornoCero"}
