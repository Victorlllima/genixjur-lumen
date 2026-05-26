# Build context: raiz do repo (passa --file apps/api/Dockerfile)
FROM python:3.12-slim

WORKDIR /app

# Deps do sistema (PyMuPDF não precisa de libmupdf-dev no slim, vem como wheel)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copia o scanner-cli primeiro (dependência local)
COPY apps/scanner-cli /app/scanner-cli
RUN pip install --no-cache-dir /app/scanner-cli

# Copia a API
COPY apps/api /app/api
RUN pip install --no-cache-dir /app/api

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost:8000/health || exit 1

CMD ["uvicorn", "lumen_api.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips=*"]
