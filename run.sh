#!/bin/bash

# Activate the Python virtual environment
source saron/.venv/bin/activate

# Run the Python FastAPI server
python3 saron/saron/server.py &
PYTHON_SERVER_PID=$!
echo "Python FastAPI server started with PID $PYTHON_SERVER_PID"

# Run the Next.js app
cd next-app/
bun run dev &
NEXTJS_APP_PID=$!
echo "Next.js app started with PID $NEXTJS_APP_PID"

# Wait for both processes to complete
wait $PYTHON_SERVER_PID $NEXTJS_APP_PID

# If either process exits, the script will clean up
trap "echo 'Stopping both processes'; kill $PYTHON_SERVER_PID $NEXTJS_APP_PID" EXIT
