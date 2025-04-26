FROM python:3.12-slim AS build

RUN --mount=type=cache,sharing=locked,target=/var/cache/apt \
    --mount=type=cache,sharing=locked,target=/var/lib/apt \
    apt-get update && \
    apt-get install -y \
    build-essential \
    libomp-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=./requirements.txt,target=/tmp/requirements.txt \
    pip install --no-cache-dir -r /tmp/requirements.txt

FROM python:3.12-slim

RUN --mount=type=cache,sharing=locked,target=/var/cache/apt \
    --mount=type=cache,sharing=locked,target=/var/lib/apt \
    apt-get update && \
    apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY --from=build /usr/local /usr/local

COPY . /app

WORKDIR /app

ENV PYTHONPATH=/app

CMD ["python", "api.py"]

