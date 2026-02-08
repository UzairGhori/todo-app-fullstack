from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL: str = os.environ["DATABASE_URL"]
JWT_SECRET: str = os.environ["JWT_SECRET"]
FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:3000")
