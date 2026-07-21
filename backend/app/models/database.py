"""
SQLAlchemy models — Postgres tables for documents, chunks, and compliance rules.
Uses pgvector for embedding storage and similarity search.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Float, Index, create_engine
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, relationship, sessionmaker
from pgvector.sqlalchemy import Vector

from app.config import settings


# ---------------------------------------------------------------------------
# Engine & Session
# ---------------------------------------------------------------------------

engine = create_engine(
    settings.POSTGRES_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine)

EMBEDDING_DIM = 384  # all-MiniLM-L6-v2


# ---------------------------------------------------------------------------
# Base
# ---------------------------------------------------------------------------

class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# Documents
# ---------------------------------------------------------------------------

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(500), nullable=False)
    doc_type = Column(String(50), nullable=False)  # manual | ticket | inspection | incident | interview
    source_path = Column(String(1000), nullable=True)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    metadata_ = Column("metadata", JSONB, default=dict)

    # Relationship
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Document(id={self.id}, title='{self.title}', type='{self.doc_type}')>"


# ---------------------------------------------------------------------------
# Chunks (with vector embeddings)
# ---------------------------------------------------------------------------

class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(EMBEDDING_DIM), nullable=True)
    chunk_index = Column(Integer, nullable=False, default=0)
    page_number = Column(Integer, nullable=True)
    metadata_ = Column("metadata", JSONB, default=dict)

    # Relationship
    document = relationship("Document", back_populates="chunks")

    # Index for vector similarity search
    __table_args__ = (
        Index(
            "ix_chunks_embedding",
            embedding,
            postgresql_using="ivfflat",
            postgresql_with={"lists": 100},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
    )

    def __repr__(self):
        return f"<Chunk(id={self.id}, doc_id={self.document_id}, len={len(self.content)})>"


# ---------------------------------------------------------------------------
# Compliance Rules
# ---------------------------------------------------------------------------

class ComplianceRule(Base):
    __tablename__ = "compliance_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    clause_ref = Column(String(100), unique=True, nullable=False)
    description = Column(String(500), nullable=False)
    requirement_text = Column(Text, nullable=False)
    applies_to_equipment_type = Column(String(100), nullable=True)
    interval_days = Column(Integer, nullable=True)
    metadata_ = Column("metadata", JSONB, default=dict)

    def __repr__(self):
        return f"<ComplianceRule(id={self.id}, ref='{self.clause_ref}')>"


# ---------------------------------------------------------------------------
# Table creation helpers
# ---------------------------------------------------------------------------

def init_db():
    """Create all tables and enable pgvector extension. Safe to run multiple times."""
    from sqlalchemy import text

    # Enable pgvector extension first
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()

    # Create all tables
    Base.metadata.create_all(engine)
    print("Success: Postgres tables initialized (documents, chunks, compliance_rules)")


def get_db():
    """Yield a database session for dependency injection."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
