from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os

app = FastAPI(title="TaskCampus API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "backend/data.json"

class Task(BaseModel):
    id: Optional[int] = None
    titulo: str
    descripcion: str
    asignatura: str
    fecha_entrega: str
    prioridad: str 
    estado: str 

def leer_datos() -> List[dict]:
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)

def guardar_datos(datos: List[dict]):
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(datos, file, indent=4, ensure_ascii=False)

@app.get("/tasks/summary")
def get_summary():
    tareas = leer_datos()
    total = len(tareas)
    pendientes = sum(1 for t in tareas if t["estado"].lower() == "pendiente")
    finalizadas = sum(1 for t in tareas if t["estado"].lower() == "finalizada")
    alta_prioridad = sum(1 for t in tareas if t["prioridad"].lower() == "alta")
    
    return {
        "total_tareas": total,
        "tareas_pendientes": pendientes,
        "tareas_finalizadas": finalizadas,
        "tareas_alta_prioridad": alta_prioridad
    }

@app.get("/tasks")
def get_tasks(
    estado: Optional[str] = Query(None),
    prioridad: Optional[str] = Query(None),
    asignatura: Optional[str] = Query(None)
):
    tareas = leer_datos()
    resultado = tareas
    if estado:
        resultado = [t for t in resultado if t["estado"].lower() == estado.lower()]
    if prioridad:
        resultado = [t for t in resultado if t["prioridad"].lower() == prioridad.lower()]
    if asignatura:
        resultado = [t for t in resultado if t["asignatura"].lower() == asignatura.lower()]
    return resultado

@app.get("/tasks/{task_id}")
def get_task(task_id: int):
    tareas = leer_datos()
    for t in tareas:
        if t["id"] == task_id:
            return t
    raise HTTPException(status_code=404, detail="Tarea no encontrada")

@app.post("/tasks")
def create_task(task: Task):
    tareas = leer_datos()
    nuevo_id = 1 if not tareas else max(t["id"] for t in tareas) + 1
    nueva_tarea = task.dict()
    nueva_tarea["id"] = nuevo_id
    tareas.append(nueva_tarea)
    guardar_datos(tareas)
    return nueva_tarea

@app.put("/tasks/{task_id}")
def update_task(task_id: int, updated_task: Task):
    tareas = leer_datos()
    for index, t in enumerate(tareas):
        if t["id"] == task_id:
            tarea_actualizada = updated_task.dict()
            tarea_actualizada["id"] = task_id 
            tareas[index] = tarea_actualizada
            guardar_datos(tareas)
            return tarea_actualizada
    raise HTTPException(status_code=404, detail="Tarea no encontrada")

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    tareas = leer_datos()
    for index, t in enumerate(tareas):
        if t["id"] == task_id:
            tareas.pop(index)
            guardar_datos(tareas)
            return {"mensaje": "Tarea eliminada exitosamente"}
    raise HTTPException(status_code=404, detail="Tarea no encontrada")