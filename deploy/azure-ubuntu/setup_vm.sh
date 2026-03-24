#!/usr/bin/env bash
set -euo pipefail

APP_USER="chatsense"
APP_GROUP="www-data"
APP_HOME="/opt/chatsense"
APP_DIR="${APP_HOME}/app"
VENV_DIR="${APP_HOME}/venv"
ENV_DIR="/etc/chatsense"
ENV_FILE="${ENV_DIR}/backend.env"
PUBLIC_IP="20.162.106.26"
DJANGO_PORT="8004"
DB_NAME="chatsense_db"
DB_USER="chatsense_user"

# Fill these before running.
REPO_URL="${REPO_URL:-https://github.com/your-org/your-repo.git}"
REPO_BRANCH="${REPO_BRANCH:-main}"
DB_PASSWORD="${DB_PASSWORD:-replace-with-db-password}"
DJANGO_SECRET_KEY="${DJANGO_SECRET_KEY:-replace-with-a-long-random-secret}"
GEMINI_API_KEY="${GEMINI_API_KEY:-replace-with-gemini-key}"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-replace-with-telegram-bot-token}"

if [[ "${REPO_URL}" == "https://github.com/your-org/your-repo.git" ]]; then
  echo "Set REPO_URL before running this script."
  exit 1
fi

sudo apt update
sudo apt install -y \
  python3 \
  python3-venv \
  python3-dev \
  build-essential \
  libpq-dev \
  nginx \
  postgresql \
  postgresql-contrib \
  nodejs \
  npm

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  sudo useradd -r -m -d "/home/${APP_USER}" -s /bin/bash "${APP_USER}"
fi
sudo usermod -a -G "${APP_GROUP}" "${APP_USER}"

sudo mkdir -p "${APP_HOME}" "${ENV_DIR}"
sudo chown -R "${APP_USER}:${APP_USER}" "${APP_HOME}"

if [[ ! -d "${APP_DIR}/.git" ]]; then
  sudo -u "${APP_USER}" git clone --branch "${REPO_BRANCH}" "${REPO_URL}" "${APP_DIR}"
else
  sudo -u "${APP_USER}" git -C "${APP_DIR}" fetch --all
  sudo -u "${APP_USER}" git -C "${APP_DIR}" checkout "${REPO_BRANCH}"
  sudo -u "${APP_USER}" git -C "${APP_DIR}" pull --ff-only origin "${REPO_BRANCH}"
fi

sudo -u "${APP_USER}" python3 -m venv "${VENV_DIR}"
sudo -u "${APP_USER}" "${VENV_DIR}/bin/pip" install --upgrade pip
sudo -u "${APP_USER}" "${VENV_DIR}/bin/pip" install -r "${APP_DIR}/requirements.ubuntu.txt"

sudo -u postgres psql <<SQL
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
      CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';
   ELSE
      ALTER ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASSWORD}';
   END IF;
END
\$\$;
SQL

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1 || \
  sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"
sudo -u postgres psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

sudo tee "${ENV_FILE}" > /dev/null <<EOF
DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=${PUBLIC_IP}
DJANGO_SECURE_SSL_REDIRECT=False
DJANGO_SESSION_COOKIE_SECURE=False
DJANGO_CSRF_COOKIE_SECURE=False
CORS_ALLOWED_ORIGINS=http://${PUBLIC_IP}
CSRF_TRUSTED_ORIGINS=http://${PUBLIC_IP}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=127.0.0.1
DB_PORT=5432
GEMINI_API_KEY=${GEMINI_API_KEY}
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
ENABLE_RUNSERVER_STOCK_SYNC=False
EOF
sudo chmod 640 "${ENV_FILE}"
sudo chown root:"${APP_GROUP}" "${ENV_FILE}"

sudo -u "${APP_USER}" "${VENV_DIR}/bin/python" "${APP_DIR}/manage.py" migrate
sudo -u "${APP_USER}" "${VENV_DIR}/bin/python" "${APP_DIR}/manage.py" collectstatic --noinput
sudo -u "${APP_USER}" "${VENV_DIR}/bin/python" "${APP_DIR}/manage.py" sync_stock_data

sudo -u "${APP_USER}" bash -lc "cd '${APP_DIR}/frontend' && cp -f .env.production.example .env.production && npm ci && npm run build"

sudo cp "${APP_DIR}/deploy/azure-ubuntu/chatsense-backend.service" /etc/systemd/system/
sudo cp "${APP_DIR}/deploy/azure-ubuntu/chatsense-stock-sync.service" /etc/systemd/system/
sudo cp "${APP_DIR}/deploy/azure-ubuntu/chatsense-stock-sync.timer" /etc/systemd/system/
sudo cp "${APP_DIR}/deploy/azure-ubuntu/chatsense.nginx.conf" /etc/nginx/sites-available/chatsense

if [[ ! -L /etc/nginx/sites-enabled/chatsense ]]; then
  sudo ln -s /etc/nginx/sites-available/chatsense /etc/nginx/sites-enabled/chatsense
fi
if [[ -f /etc/nginx/sites-enabled/default ]]; then
  sudo rm -f /etc/nginx/sites-enabled/default
fi

sudo systemctl daemon-reload
sudo systemctl enable --now chatsense-backend
sudo systemctl enable --now chatsense-stock-sync.timer
sudo nginx -t
sudo systemctl reload nginx

echo
echo "Deployment completed."
echo "Verify with:"
echo "  systemctl status chatsense-backend"
echo "  systemctl status chatsense-stock-sync.timer"
echo "  curl http://127.0.0.1:${DJANGO_PORT}/"
echo "  curl http://${PUBLIC_IP}/"
