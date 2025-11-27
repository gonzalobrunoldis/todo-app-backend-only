from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel

from postgrest.exceptions import APIError

from supabase import create_client
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import os

# Environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


async def get_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid auth scheme")

    return token

# Esta función valida el token llamando a Supabase
async def get_current_user(token: str = Depends(get_token)):
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Llama a Supabase para validar el token
    user_response = supabase.auth.get_user(token)

    if user_response is None or user_response.user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user_response.user.id


# Fast API instance
app = FastAPI()

class TodoBase(BaseModel):
    # Es la base de los otros modelos. Define los campos comunes que existen para todos los TODOs
    title: str
    done: bool = False

class TodoCreate(TodoBase):
    pass

class TodoDB(TodoBase):
    id: str
    user_id: str | None
    created_at: str


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoints
@app.get("/health")
def health_check():
    return {"status": "ok"}

# Fetch all todos
@app.get("/todos", response_model=list[TodoDB]) 
def get_todos(user_id: str = Depends(get_current_user)):
    """
    Response model valida que los datos que devuelve el endpoint sean una lista de objetos TodoDB
    donde cada elemento tiene id, title, done, user_id, created_at
    Si falta un campo o un tipo no coincide → FastAPI lanza error
    """
    response = supabase.table("todos").select("*").eq("user_id", user_id).execute()
    return response.data

# Fetch a specific todo by id
@app.get("/todos/{todo_id}", response_model=TodoDB)
def get_todo(todo_id: str):
    try: 
        response = (
            supabase
            .table("todos")
            .select("*")
            .eq("id", todo_id)
            .single() # Si devuelve 0 filas o más de 1 fila, considéralo un error
            .execute()
        )

    except APIError:
        raise HTTPException(status_code=404, detail="Todo not found")

    return response.data
    

# Create a new todo
@app.post("/todos", response_model=TodoDB)
def create_todo(todo: TodoCreate, user_id: str = Depends(get_current_user)):
    data = {
        "title": todo.title,
        "done": todo.done,
        "user_id": user_id
    }

    response = (
        supabase
        .table("todos")
        .insert(data)
        .execute()
    )

    if response.data is None:
        raise HTTPException(status_code=400, detail="Todo not inserted")

    return response.data[0]

# Update a specific todo by id
@app.put("/todos/{todo_id}", response_model=TodoDB)
def update_todo(todo_id: str, todo: TodoCreate, user_id: str = Depends(get_current_user)):
    response = (
        supabase
        .table("todos")
        .update({
            "title": todo.title,
            "done": todo.done
        })
        .eq("id", todo_id)
        .eq("user_id", user_id)
        .execute()
    )

    # Si no se actualizó ninguna fila
    if not response.data:
        raise HTTPException(status_code=404, detail="Todo not found or unauthorized")

    # Devuelve la única fila afectada
    return response.data[0]

# Delete a specific todo by id
@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: str, user_id: str = Depends(get_current_user)):
    response = (
        supabase
        .table("todos")
        .delete()
        .eq("id", todo_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Todo not found")

    return {"message": "Todo deleted successfully"}

