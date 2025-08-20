from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: int
    email: str
    role: str

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None

class QuestionBase(BaseModel):
    text: str
    options: List[str]
    correct_answer: str

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int
    quiz_id: int

    class Config:
        orm_mode = True

class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None

class QuizCreate(QuizBase):
    questions: List[QuestionCreate]

class Quiz(QuizBase):
    id: int
    owner_id: int
    questions: List[Question] = []

    class Config:
        orm_mode = True

# Mock Test Schemas
class MockTestQuestionBase(BaseModel):
    text: str
    options: List[str]
    correct_answer: str

class MockTestQuestionCreate(MockTestQuestionBase):
    pass

class MockTestQuestion(MockTestQuestionBase):
    id: int
    section_id: int

    class Config:
        orm_mode = True

class MockTestSectionBase(BaseModel):
    title: str
    passage: Optional[str] = None # For reading section
    task1: Optional[str] = None # For writing section
    task2: Optional[str] = None # For writing section

class MockTestSectionCreate(MockTestSectionBase):
    questions: Optional[List[MockTestQuestionCreate]] = None

class MockTestSection(MockTestSectionBase):
    id: int
    mock_test_id: int
    questions: List[MockTestQuestion] = []

    class Config:
        orm_mode = True

class MockTestBase(BaseModel):
    title: str
    description: Optional[str] = None

class MockTestCreate(MockTestBase):
    listening_section: MockTestSectionCreate
    reading_section: MockTestSectionCreate
    writing_section: MockTestSectionBase # No questions for writing section

class MockTest(MockTestBase):
    id: int
    owner_id: int
    listening_section: MockTestSection
    reading_section: MockTestSection
    writing_section: MockTestSection

    class Config:
        orm_mode = True

class MockTestSubmission(BaseModel):
    test_id: int
    answers: Dict[str, Dict[str, str]] # section_name: {question_id: answer}

class TestResultBase(BaseModel):
    mock_test_id: int
    user_id: int
    listening_score: int
    reading_score: int
    writing_feedback: Optional[Dict[str, Any]]
    total_questions_listening: int
    total_questions_reading: int

class TestResultCreate(TestResultBase):
    pass

class TestResult(TestResultBase):
    id: int

    class Config:
        orm_mode = True