FROM python:3.12-slim

WORKDIR /app

# Instala dependências do sistema (PyMuPDF precisa de libmupdf)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmupdf-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia o scanner-cli primeiro (dependência local)
COPY ../scanner-cli /app/scanner-cli
RUN pip install --no-cache-dir /app/scanner-cli

# Copia e instala a API
COPY . /app/api
RUN pip install --no-cache-dir /app/api

EXPOSE 8000

CMD ["uvicorn", "lumen_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
