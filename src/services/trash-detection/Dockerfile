FROM python:3.11-slim AS build

RUN apt-get update && \
    apt-get install -y \
    build-essential \
    libomp-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY --from=build /usr/local /usr/local

COPY . /app

WORKDIR /app
ENV PYTHONPATH=/app

CMD ["python", "api.py"]
