# Devcontainer Dockerfile - uses Python image; 
# django base caused some issues with dev containers + apple silicon, will investigate later
FROM python:3.11-slim AS dev

LABEL maintainer="Penn Labs"

# Install system dependencies and Node.js in a single layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    git \
    curl \
    ca-certificates \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Enable corepack and install pnpm (pinned version)
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy backend and install dependencies
# venv is created inside /app but will be overridden by volume mount at runtime
WORKDIR /app
COPY backend/ /app/

RUN --mount=type=cache,target=/root/.cache/uv \
  uv sync --frozen

ENV DJANGO_SETTINGS_MODULE=config.settings.development
ENV PATH="/app/.venv/bin:$PATH"

CMD ["sleep", "infinity"]
