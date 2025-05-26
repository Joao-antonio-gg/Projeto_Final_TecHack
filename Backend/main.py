from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from urllib.parse import urlparse

# importe aqui sua função completa
from conceitoC import verificaIndentificador

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ajuste conforme seu frontend
    allow_methods=["*"],
    allow_headers=["*"],
)

WHITELIST = {
    "facebook.com",
    "instagram.com",
    "google.com",
    "youtube.com"
    # outros domínios confiáveis...
}

def extrair_dominio(url: str) -> str:
    try:
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        domain = domain.split(':')[0]
        return domain
    except Exception:
        return ""

def analisar_url(url: str) -> dict:
    dominio = extrair_dominio(url)
    if dominio in WHITELIST:
        return {"suspeito": False, "motivos": ["Domínio presente na whitelist."]}
    
    suspeito, motivos = verificaIndentificador(url)
    return {"suspeito": suspeito, "motivos": motivos}

@app.get("/verifica")
def verifica(url: str = Query(..., description="URL a ser verificada")):
    resultado = analisar_url(url)
    return resultado

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
