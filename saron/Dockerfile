# Use a multi-stage build to keep the final image size down
FROM python:3.11-bookworm as builder

RUN pip install --upgrade pip

# Install poetry at specified version
RUN pip install poetry==1.4.2

# Download and install ifcopenshell from the wheel
RUN wget -O ifcopenshell-0.8.0-py311-none-manylinux_2_31_x86_64.whl https://files.pythonhosted.org/packages/5a/16/9f22a53c4ce18132479f25bcc4ebdea5b46ad6c600391f8a686222cd4319/ifcopenshell-0.8.0-py311-none-manylinux_2_31_x86_64.whl && \
    pip install ifcopenshell-0.8.0-py311-none-manylinux_2_31_x86_64.whl  && \
    rm ifcopenshell-0.8.0-py311-none-manylinux_2_31_x86_64.whl 

# Install PostgreSQL client libraries
RUN apt-get update && apt-get install -y \
    libpq-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for poetry
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

WORKDIR /app

# Copy only the files needed for the poetry installation
COPY pyproject.toml poetry.lock ./

# Create an empty README to avoid errors, run installation, and remove cache directory
RUN touch README.md && \
    poetry install --without dev --no-root && \
    rm -rf $POETRY_CACHE_DIR

# Use the official slim image for the runtime
FROM python:3.11-slim-bookworm

# Install PostgreSQL client libraries in the runtime image
RUN apt-get update && apt-get install -y \
    libpq5 \
    libc6 \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from the builder stage
COPY --from=builder /app /app

WORKDIR /app

# Copy the application code and the wait-for-it script
COPY . .

# Install dotenv plugin
RUN pip install poetry==1.4.2 && \
    poetry self add poetry-dotenv-plugin && \
    poetry install --no-dev

EXPOSE 8000

ENV ENV=prod

# Run the FastAPI application
CMD ["poetry", "run", "python3", "saron/server.py"]