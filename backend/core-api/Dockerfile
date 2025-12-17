FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY app/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

ENV SUPABASE_URL="https://axxombzunamsfqvxaxts.supabase.co"
ENV SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4eG9tYnp1bmFtc2ZxdnhheHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MzE1NTcsImV4cCI6MjA4MTUwNzU1N30.ap9uE8Q_qdT3aGirFCyaSEKfFZuV6htbM2RJkpkfNiE"
ENV SUPABASE_DB_PASSWORD="2YZ9lRlLsIkNVx9c"

ENV YELP_CLIENT_ID="f-EuKcGwQ4rfdMPC9tWw3Q"
ENV YELP_API_KEY="Y7hmreqgpkQaNKlx64Rnpb7ZeCEv_BIrPG6u-GF8CnljLyBh5rhsyY3Ofgz5Ac9lP5aBa4xLOQ2SxXOvkw5McLb6N4nTAGBmJyO8HFZ_1xI-Su6KBe06KzGVkHYyaXYx"

ENV OPENAI_API_KEY="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"

COPY app/ ./app/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
