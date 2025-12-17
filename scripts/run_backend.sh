#!/bin/bash

echo "🚀 Starting YesorNext Backend..."

cd infra

echo "Building and starting Docker containers..."
docker-compose -f docker-compose.local.yml up --build

echo "Backend is running at http://localhost:8000"
echo "API Docs at http://localhost:8000/docs"
