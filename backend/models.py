from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
import enum

class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default=UserRole.student)

    quizzes = relationship("Quiz", back_populates="owner")
    mock_tests = relationship("MockTest", back_populates="owner")

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    options = Column(String) # Storing as JSON string for simplicity
    correct_answer = Column(String)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))

    quiz = relationship("Quiz", back_populates="questions")

class MockTest(Base):
    __tablename__ = "mock_tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="mock_tests")
    sections = relationship("MockTestSection", back_populates="mock_test")

class MockTestSection(Base):
    __tablename__ = "mock_test_sections"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True) # listening, reading, writing
    passage = Column(String, nullable=True) # For reading section
    task1 = Column(String, nullable=True) # For writing section
    task2 = Column(String, nullable=True) # For writing section
    mock_test_id = Column(Integer, ForeignKey("mock_tests.id"))

    mock_test = relationship("MockTest", back_populates="sections")
    questions = relationship("MockTestQuestion", back_populates="section")

class MockTestQuestion(Base):
    __tablename__ = "mock_test_questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    options = Column(String) # Storing as JSON string for simplicity
    correct_answer = Column(String)
    section_id = Column(Integer, ForeignKey("mock_test_sections.id"))

    section = relationship("MockTestSection", back_populates="questions")