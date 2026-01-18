# -----------------------------
# base stage (shared setup)
# -----------------------------
FROM pennlabs/django-base:11d476546bd11c7a499e0e93be8db6af035d360f-3.11 AS base

LABEL maintainer="Penn Labs"

WORKDIR /app
COPY pyproject.toml uv.lock /app/

# -----------------------------
# dev stage (for docker compose)
# -----------------------------
FROM base AS dev

RUN --mount=type=cache,target=/root/.cache/uv \
  uv sync --frozen

COPY . /app/

ENV DJANGO_SETTINGS_MODULE=config.settings.development
ENV SECRET_KEY="temporary key just to build the docker image"
ENV PATH="/app/.venv/bin:$PATH"

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# -----------------------------
# prod stage (default)
# -----------------------------
FROM base AS prod

RUN --mount=type=cache,target=/root/.cache/uv \
  uv sync --frozen --no-dev --no-install-project

COPY . /app/

RUN --mount=type=cache,target=/root/.cache/uv \
  uv sync --frozen --no-dev

ENV DJANGO_SETTINGS_MODULE=config.settings.production
ENV SECRET_KEY="temporary key just to build the docker image"
ENV PATH="/app/.venv/bin:$PATH"

# collect static files at build time
RUN python manage.py collectstatic --noinput
