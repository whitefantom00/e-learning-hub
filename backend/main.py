from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import models, schemas, auth, zoho_crm
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

    # Create contact in Zoho CRM
    create_zoho_contact(user.email)

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

# Mock Test Management Endpoints
@app.post("/mock-tests/", response_model=schemas.MockTest)
async def create_mock_test(mock_test: schemas.MockTestCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_teacher_user)):
    db_mock_test = models.MockTest(title=mock_test.title, description=mock_test.description, owner_id=current_user.id)
    db.add(db_mock_test)
    db.commit()
    db.refresh(db_mock_test)

    # Add listening section
    db_listening_section = models.MockTestSection(
        title="listening",
        mock_test_id=db_mock_test.id
    )
    db.add(db_listening_section)
    db.commit()
    db.refresh(db_listening_section)
    for q_data in mock_test.listening_section.questions:
        db_question = models.MockTestQuestion(
            text=q_data.text,
            options=json.dumps(q_data.options),
            correct_answer=q_data.correct_answer,
            section_id=db_listening_section.id
        )
        db.add(db_question)

    # Add reading section
    db_reading_section = models.MockTestSection(
        title="reading",
        passage=mock_test.reading_section.passage,
        mock_test_id=db_mock_test.id
    )
    db.add(db_reading_section)
    db.commit()
    db.refresh(db_reading_section)
    for q_data in mock_test.reading_section.questions:
        db_question = models.MockTestQuestion(
            text=q_data.text,
            options=json.dumps(q_data.options),
            correct_answer=q_data.correct_answer,
            section_id=db_reading_section.id
        )
        db.add(db_question)

    # Add writing section
    db_writing_section = models.MockTestSection(
        title="writing",
        task1=mock_test.writing_section.task1,
        task2=mock_test.writing_section.task2,
        mock_test_id=db_mock_test.id
    )
    db.add(db_writing_section)
    db.commit()
    db.refresh(db_writing_section)

    db.commit()
    db.refresh(db_mock_test)
    return db_mock_test

@app.get("/mock-tests/", response_model=list[schemas.MockTest])
async def read_mock_tests(db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_teacher_user)):
    mock_tests = db.query(models.MockTest).filter(models.MockTest.owner_id == current_user.id).all()
    return mock_tests

@app.get("/mock-tests/{test_id}", response_model=schemas.MockTest)
async def read_mock_test(test_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_teacher_user)):
    mock_test = db.query(models.MockTest).filter(models.MockTest.id == test_id, models.MockTest.owner_id == current_user.id).first()
    if mock_test is None:
        raise HTTPException(status_code=404, detail="Mock Test not found")
    return mock_test

@app.put("/mock-tests/{test_id}", response_model=schemas.MockTest)
async def update_mock_test(test_id: int, mock_test: schemas.MockTestCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_teacher_user)):
    db_mock_test = db.query(models.MockTest).filter(models.MockTest.id == test_id, models.MockTest.owner_id == current_user.id).first()
    if db_mock_test is None:
        raise HTTPException(status_code=404, detail="Mock Test not found")
    
    db_mock_test.title = mock_test.title
    db_mock_test.description = mock_test.description

    # Update sections and questions
    # Listening
    db_listening_section = db.query(models.MockTestSection).filter(models.MockTestSection.mock_test_id == test_id, models.MockTestSection.title == "listening").first()
    db.query(models.MockTestQuestion).filter(models.MockTestQuestion.section_id == db_listening_section.id).delete()
    for q_data in mock_test.listening_section.questions:
        db_question = models.MockTestQuestion(
            text=q_data.text,
            options=json.dumps(q_data.options),
            correct_answer=q_data.correct_answer,
            section_id=db_listening_section.id
        )
        db.add(db_question)

    # Reading
    db_reading_section = db.query(models.MockTestSection).filter(models.MockTestSection.mock_test_id == test_id, models.MockTestSection.title == "reading").first()
    db_reading_section.passage = mock_test.reading_section.passage
    db.query(models.MockTestQuestion).filter(models.MockTestQuestion.section_id == db_reading_section.id).delete()
    for q_data in mock_test.reading_section.questions:
        db_question = models.MockTestQuestion(
            text=q_data.text,
            options=json.dumps(q_data.options),
            correct_answer=q_data.correct_answer,
            section_id=db_reading_section.id
        )
        db.add(db_question)

    # Writing
    db_writing_section = db.query(models.MockTestSection).filter(models.MockTestSection.mock_test_id == test_id, models.MockTestSection.title == "writing").first()
    db_writing_section.task1 = mock_test.writing_section.task1
    db_writing_section.task2 = mock_test.writing_section.task2

    db.commit()
    db.refresh(db_mock_test)
    return db_mock_test

@app.delete("/mock-tests/{test_id}")
async def delete_mock_test(test_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_teacher_user)):
    db_mock_test = db.query(models.MockTest).filter(models.MockTest.id == test_id, models.MockTest.owner_id == current_user.id).first()
    if db_mock_test is None:
        raise HTTPException(status_code=404, detail="Mock Test not found")
    db.delete(db_mock_test)
    db.commit()
    return {"message": "Mock Test deleted successfully"}

@app.post("/mock-tests/{test_id}/submit")
async def submit_mock_test(test_id: int, submission: schemas.MockTestSubmission, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_active_user)):
    mock_test = db.query(models.MockTest).filter(models.MockTest.id == test_id).first()
    if mock_test is None:
        raise HTTPException(status_code=404, detail="Mock Test not found")

    listening_score = 0
    reading_score = 0

    # Grade Listening Section
    listening_section = db.query(models.MockTestSection).filter(models.MockTestSection.mock_test_id == test_id, models.MockTestSection.title == "listening").first()
    if listening_section and "listening" in submission.answers:
        for question in listening_section.questions:
            if str(question.id) in submission.answers["listening"] and submission.answers["listening"][str(question.id)] == question.correct_answer:
                listening_score += 1

    # Grade Reading Section
    reading_section = db.query(models.MockTestSection).filter(models.MockTestSection.mock_test_id == test_id, models.MockTestSection.title == "reading").first()
    if reading_section and "reading" in submission.answers:
        for question in reading_section.questions:
            if str(question.id) in submission.answers["reading"] and submission.answers["reading"][str(question.id)] == question.correct_answer:
                reading_score += 1

    # Grade Writing Section using Gemini API
    writing_feedback = None
    if "writing" in submission.answers:
        task1_answer = submission.answers["writing"].get("task1", "")
        task2_answer = submission.answers["writing"].get("task2", "")
        
        # Placeholder for Gemini API call
        # In a real application, you would send task1_answer and task2_answer to Gemini API
        # and get feedback and suggestions.
        writing_feedback = {
            "task1_feedback": "This is a placeholder feedback for Task 1 from Gemini API.",
            "task2_feedback": "This is a placeholder feedback for Task 2 from Gemini API.",
            "overall_suggestion": "Overall placeholder suggestion from Gemini API."
        }

    return {
        "message": "Mock test submitted successfully",
        "listening_score": listening_score,
        "reading_score": reading_score,
        "total_questions_listening": len(listening_section.questions) if listening_section else 0,
        "total_questions_reading": len(reading_section.questions) if reading_section else 0,
        "writing_feedback": writing_feedback
    }

@app.post("/test-results/", response_model=schemas.TestResult)
async def create_test_result(test_result: schemas.TestResultCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_active_user)):
    db_test_result = models.TestResult(
        mock_test_id=test_result.mock_test_id,
        user_id=current_user.id,
        listening_score=test_result.listening_score,
        reading_score=test_result.reading_score,
        writing_feedback=json.dumps(test_result.writing_feedback) if test_result.writing_feedback else None,
        total_questions_listening=test_result.total_questions_listening,
        total_questions_reading=test_result.total_questions_reading
    )
    db.add(db_test_result)
    db.commit()
    db.refresh(db_test_result)
    return db_test_result

@app.get("/test-results/me/", response_model=list[schemas.TestResult])
async def read_my_test_results(db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_active_user)):
    test_results = db.query(models.TestResult).filter(models.TestResult.user_id == current_user.id).all()
    return test_results

@app.get("/")
def read_root():
    return {"Hello": "World"}