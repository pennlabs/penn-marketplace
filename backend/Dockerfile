# -----------------------------
# base stage (shared setup)
# -----------------------------
FROM pennlabs/django-base:b269ea1613686b1ac6370154debbb741b012de1a-3.11 AS base

LABEL maintainer="Penn Labs"

WORKDIR /app
COPY Pipfile* /app/

# -----------------------------
# dev stage (for docker compose)
# -----------------------------
FROM base AS dev

RUN pipenv install --system --dev
COPY . /app/

ENV DJANGO_SETTINGS_MODULE=config.settings.development
ENV SECRET_KEY="temporary key just to build the docker image"

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]

# -----------------------------
# prod stage (default)
# -----------------------------
FROM base AS prod

RUN pipenv install --system --deploy
COPY . /app/

ENV DJANGO_SETTINGS_MODULE=config.settings.production
ENV SECRET_KEY="temporary key just to build the docker image"

# collect static files at build time
RUN python3 manage.py collectstatic --noinput
