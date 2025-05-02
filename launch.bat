@echo off
REM Navigate to the directory of this script
cd /d "%~dp0"

REM Stop and remove existing containers
echo Stopping existing containers...
docker-compose down

REM Build images
echo Building Docker images...
docker-compose build

REM Start containers in detached mode
echo Starting containers...
docker-compose up -d

REM Wait for services to initialize (adjust time as needed)
echo Waiting for services to start...
timeout /t 20 /nobreak >nul

REM Open the GUI in default browser (update URL if needed)
start "" "http://localhost:3000"

echo Application launched successfully!
pause
