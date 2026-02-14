from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL: str = os.environ.get("DATABASE_URL", "")
FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:3000")
SECRET_KEY: str = os.environ.get(
    "SECRET_KEY",
    "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7",
)
OPENROUTER_API_KEY: str = os.environ.get("OPENROUTER_API_KEY", "")
