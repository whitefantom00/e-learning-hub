from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import models, schemas, auth
from .database import SessionLocal, engine
import json

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

@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(auth.get_current_active_user)):
    return current_user

@app.get("/admin-only/")
async def admin_only_endpoint(current_user: schemas.User = Depends(auth.get_current_admin_user)):
    return {"message": "Welcome, Admin!"}

@app.get("/admin/users/", response_model=list[schemas.User])
async def read_users(db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_admin_user)):
    users = db.query(models.User).all()
    return users

@app.get("/admin/users/{user_id}", response_model=schemas.User)
async def read_user(user_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/admin/users/{user_id}", response_model=schemas.User)
async def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_admin_user)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.email:
        db_user.email = user.email
    if user.password:
        db_user.hashed_password = auth.get_password_hash(user.password)
    if user.role:
        db_user.role = user.role
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/admin/users/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_admin_user)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

# Quiz Management Endpoints
@app.post("/quizzes/", response_model=schemas.Quiz)
async def create_quiz(quiz: schemas.QuizCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_teacher_user)):
    db_quiz = models.Quiz(title=quiz.title, description=quiz.description, owner_id=current_user.id)
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)

    for q_data in quiz.questions:
        db_question = models.Question(
            text=q_data.text,
            options=json.dumps(q_data.options),
            correct_answer=q_data.correct_answer,
            quiz_id=db_quiz.id
        )
        db.add(db_question)
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

@app.get("/quizzes/", response_model=list[schemas.Quiz])
async def read_quizzes(db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_teacher_user)):
    quizzes = db.query(models.Quiz).filter(models.Quiz.owner_id == current_user.id).all()
    return quizzes

@app.get("/quizzes/{quiz_id}", response_model=schemas.Quiz)
async def read_quiz(quiz_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_teacher_user)):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id, models.Quiz.owner_id == current_user.id).first()
    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@app.put("/quizzes/{quiz_id}", response_model=schemas.Quiz)
async def update_quiz(quiz_id: int, quiz: schemas.QuizCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_teacher_user)):
    db_quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id, models.Quiz.owner_id == current_user.id).first()
    if db_quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    db_quiz.title = quiz.title
    db_quiz.description = quiz.description
    
    # Delete old questions and add new ones
    db.query(models.Question).filter(models.Question.quiz_id == quiz_id).delete()
    for q_data in quiz.questions:
        db_question = models.Question(
            text=q_data.text,
            options=json.dumps(q_data.options),
            correct_answer=q_data.correct_answer,
            quiz_id=db_quiz.id
        )
        db.add(db_question)
    
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

@app.delete("/quizzes/{quiz_id}")
async def delete_quiz(quiz_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_teacher_user)):
    db_quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id, models.Quiz.owner_id == current_user.id).first()
    if db_quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")
    db.delete(db_quiz)
    db.commit()
    return {"message": "Quiz deleted successfully"}

@app.get("/")
def read_root():
    return {"Hello": "World"}