#!/bin/bash

# SYNERGi Deployment Script

echo "====================================="
echo "   Deploying SYNERGi with Docker     "
echo "====================================="

# Check if .env files exist, if not, copy from examples
if [ ! -f backend/.env ]; then
    echo "Creating backend/.env from template..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please update backend/.env with your actual secrets before continuing."
    exit 1
fi

if [ ! -f frontend/.env ]; then
    echo "Creating frontend/.env from template..."
    cp frontend/.env.example frontend/.env
    echo "⚠️  Please update frontend/.env with your actual secrets before continuing."
    exit 1
fi

# Ensure the script exits on errors
set -e

# Pull latest changes (optional, uncomment if pulling from git)
# git pull origin main

echo "Building and starting containers..."
docker-compose up -d --build

echo "====================================="
echo "   Deployment Complete!              "
echo "====================================="
echo "Frontend is running on http://localhost:80"
echo "Backend is running on http://localhost:1026"
echo "To view logs, run: docker-compose logs -f"
