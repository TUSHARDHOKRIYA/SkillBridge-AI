
# Use an official Python runtime as a parent image
FROM python:3.13-slim

# Install system dependencies needed by PyMuPDF and other packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmupdf-dev \
    libfreetype6 \
    libharfbuzz0b \
    libjpeg62-turbo \
    libopenjp2-7 \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Cloud Run expects the container to listen on the port defined by $PORT
# We use a shell-style CMD to allow variable expansion
CMD uvicorn ai.api.app:app --host 0.0.0.0 --port $PORT
