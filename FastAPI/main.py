from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import json
from openai import AsyncOpenAI
from typing_extensions import override
from openai import AsyncAssistantEventHandler
import asyncpg
from contextlib import asynccontextmanager
import asyncio
import os

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialisation au démarrage
    db_pool = await asyncpg.create_pool(
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT")),
)
    app.state.db_pool = db_pool
    print("Connexion établie avec PostgreSQL")
    yield  # Ici, l'application est prête à recevoir des requêtes
    # Nettoyage lors de l'arrêt
    await db_pool.close()
    print("Connexion PostgreSQL fermée")

app = FastAPI(lifespan=lifespan)

class RequestData(BaseModel):
    is_first_message: bool
    user_id: int
    with_anticipated_questions: bool = False
    thread_id: str = None
    content: str

class EventHandler(AsyncAssistantEventHandler):
    websocket: WebSocket = None
    send_lock: asyncio.Lock = None

    def __init__(self):
        super().__init__()
        self.send_lock = asyncio.Lock()

    @override
    async def on_text_delta(self, delta, snapshot):
        delta_value = delta.value if hasattr(delta, 'value') else str(delta)
        print(delta_value, end="", flush=True)
        async with self.send_lock:
            await self.websocket.send_json({'event': 'text_delta', 'delta': delta_value})

    @override
    async def on_tool_call_created(self, tool_call):
        tool_call_type = tool_call.type if hasattr(tool_call, 'type') else str(tool_call)
        async with self.send_lock:
            await self.websocket.send_json({'event': 'tool_call_created', 'tool_call': tool_call_type})

    @override
    async def on_tool_call_delta(self, delta, snapshot):
        output = ""
        if delta.type == 'code_interpreter':
            if delta.code_interpreter.input:
                output += delta.code_interpreter.input
            if delta.code_interpreter.outputs:
                for out in delta.code_interpreter.outputs:
                    if out.type == "logs":
                        output += f"\n{out.logs}"
        async with self.send_lock:
            await self.websocket.send_json({'event': 'tool_call_delta', 'output': output})

async def generate_title_and_create_chat(user_message: str, websocket: WebSocket, thread_id: int, user_id: int):
    

    completion = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Tu génères un titre en 5 mots ou moins."},
            {"role": "user", "content": user_message}
        ]
    )

    title = completion.choices[0].message.content.strip()

    if not title:
        raise ValueError("Le titre n'a pas été généré correctement.")

    # Insertion du chat en base de données
    chat_id = await app.state.db_pool.fetchval(
        """
        INSERT INTO "fetchQuran_chat" (title, thread_id)
        VALUES ($1, $2)
        RETURNING id
        """,
        title, thread_id)

    # Insertion du participant en base de données et envoi du titre au client en parallèle
    await asyncio.gather(
        app.state.db_pool.execute(
            """
            INSERT INTO "fetchQuran_chat_participants" (chat_id, user_id)
            VALUES ($1, $2)
            """,
            chat_id, user_id),
        websocket.send_json({"event": "title", "data": title})
    )

@app.websocket("/ws/chat/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    

    async def process_client_message(data_json):
        request_data = RequestData(**data_json)
        print(f"Message reçu du client: {data_json}")

        if request_data.is_first_message:
            # Créer le thread
            thread = await client.beta.threads.create()
            thread_id = thread.id
            await websocket.send_json({'event': 'thread_creation', 'thread_id': thread_id})
            
            # Lancer la génération du titre et la création du chat en tâche asynchrone sans attendre
            asyncio.create_task(generate_title_and_create_chat(
                user_message=request_data.content,
                websocket=websocket,
                thread_id=thread_id,
                user_id=request_data.user_id
            ))
        else:
            thread_id = request_data.thread_id

        # Ajouter le message utilisateur au thread
        await client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=json.dumps(request_data.content)
        )

        # Démarrer le streaming de la réponse
        async with client.beta.threads.runs.stream(
            thread_id=thread_id,
            assistant_id="asst_iC6XfnkRyFHwbtFgupdixJ2D",
            event_handler=event_handler
        ) as stream:
            await stream.until_done()

        await websocket.send_json({'event': 'stream_end'})

    try:
        while True:
            event_handler = EventHandler()
            event_handler.websocket = websocket
            data_json = await websocket.receive_json()
            # Traiter les messages du client en parallèle
            asyncio.create_task(process_client_message(data_json))

    except WebSocketDisconnect:
        print("Client déconnecté")
    except Exception as e:
        print(f"Erreur dans le WebSocket: {e}")
        await websocket.send_json({'error': str(e)})
