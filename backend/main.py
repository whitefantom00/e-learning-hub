from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import models, schemas, auth
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/users/", response_model=schemas.UserCreate)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=schemas.UserCreate)
async def read_users_me(current_user: schemas.UserCreate = Depends(auth.get_current_active_user)):
    return current_user

@app.get("/admin-only/")
async def admin_only_endpoint(current_user: schemas.UserCreate = Depends(auth.get_current_admin_user)):
    return {"message": "Welcome, Admin!"}

@app.get("/")
def read_root():
    return {"Hello": "World"}