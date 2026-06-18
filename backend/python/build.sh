#!/usr/bin/env bash
# Render build script — fails fast if Python is not 3.12.x
set -euo pipefail

PY_MAJOR=$(python -c "import sys; print(sys.version_info.major)")
PY_MINOR=$(python -c "import sys; print(sys.version_info.minor)")
PY_VER="${PY_MAJOR}.${PY_MINOR}"

echo "Python version: $(python --version)"

if [[ "$PY_MAJOR" -ne 3 ]] || [[ "$PY_MINOR" -lt 11 ]] || [[ "$PY_MINOR" -ge 13 ]]; then
  echo ""
  echo "ERROR: This service requires Python 3.12.x (found ${PY_VER})."
  echo "In Render Dashboard -> Environment, add:"
  echo "  PYTHON_VERSION = 3.12.8"
  echo "Also set Root Directory to: backend/python"
  echo "Or switch the service to Docker and use backend/python/Dockerfile"
  exit 1
fi

python -m pip install --upgrade pip
python -m pip install --only-binary=:all: -r requirements.txt || python -m pip install -r requirements.txt
