from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/version")
def root():
    return {"version": "1.37.3"}


uvicorn.run(app, host="127.0.0.1", port=3333)
