docker stop ganrouter
docker rm ganrouter
docker build -t ganrouter .
docker run -d --name ganrouter -p 20128:20128 --env-file .env -v ganrouter-data:/app/data ganrouter