import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import bcrypt
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import SessionLocal, User, Base, engine

Base.metadata.create_all(bind=engine)

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "change-me-to-a-secret-key-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(prefix="/auth", tags=["auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    name: str
    email: str

class UserProfile(BaseModel):
    name: str
    email: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


def verify_password(plain: str, hashed: str) -> bool:
    try:
        password_bytes = plain.encode('utf-8')
        hashed_bytes = hashed.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/signup", status_code=201)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Account created successfully."}

@router.post("/login", response_model=LoginResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token({"sub": user.email}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": token, "token_type": "bearer", "name": user.name, "email": user.email}

@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    return {"name": current_user.name, "email": current_user.email}

@router.put("/me")
def update_profile(data: UpdateProfileRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user.id).first()
    if data.name:
        user.name = data.name
    db.commit()
    return {"message": "Profile updated.", "name": user.name, "email": user.email}

@router.put("/change-password")
def change_password(data: ChangePasswordRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not verify_password(data.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password changed successfully."}
