# Azure Ubuntu VM deployment

This project deploys cleanly on Ubuntu as:

- `gunicorn` running the Django backend on `127.0.0.1:8004`
- `nginx` serving the built Vite frontend and proxying `/api/` and `/admin/`
- a `systemd` timer running stock cache refresh every 5 minutes

## 1. Install OS packages

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-dev build-essential libpq-dev nginx postgresql postgresql-contrib nodejs npm
```

For a one-shot setup on your VM `20.162.106.26`, you can also use [deploy/azure-ubuntu/setup_vm.sh](/c:/Users/sudar/OneDrive/Desktop/Praju%20Bizmetric/ChatSense/Group_5/deploy/azure-ubuntu/setup_vm.sh) after setting `REPO_URL`, `DB_PASSWORD`, `DJANGO_SECRET_KEY`, `GEMINI_API_KEY`, and `TELEGRAM_BOT_TOKEN`.

## 2. Copy the project

```bash
sudo mkdir -p /opt/chatsense
sudo chown -R chatsense:chatsense /opt/chatsense
git clone <your-repo-url> /opt/chatsense/app
cd /opt/chatsense/app
```

If the `chatsense` Linux user does not exist yet:

```bash
sudo useradd -r -m -d /home/chatsense -s /bin/bash chatsense
sudo usermod -a -G www-data chatsense
```

## 3. Backend environment

```bash
python3 -m venv /opt/chatsense/venv
source /opt/chatsense/venv/bin/activate
pip install --upgrade pip
pip install -r requirements.ubuntu.txt
```

Create `/etc/chatsense/backend.env` from `.env.example` and set real values. The example already includes your current public IP `20.162.106.26`.

```bash
sudo mkdir -p /etc/chatsense
sudo cp .env.example /etc/chatsense/backend.env
sudo nano /etc/chatsense/backend.env
```

## 4. PostgreSQL

```bash
sudo -u postgres psql
CREATE DATABASE chatsense_db;
CREATE USER chatsense_user WITH PASSWORD 'replace-me';
GRANT ALL PRIVILEGES ON DATABASE chatsense_db TO chatsense_user;
\q
```

Update `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, and `DB_PORT` in `/etc/chatsense/backend.env`.

## 5. Django setup

```bash
source /opt/chatsense/venv/bin/activate
cd /opt/chatsense/app
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py sync_stock_data
```

## 6. Frontend build

Create `frontend/.env.production` from `frontend/.env.production.example`.

```bash
cd /opt/chatsense/app/frontend
cp .env.production.example .env.production
npm ci
npm run build
```

Leave `VITE_API_BASE_URL=/api/` when using the provided nginx config for `20.162.106.26`.

## 7. systemd services

```bash
sudo cp deploy/azure-ubuntu/chatsense-backend.service /etc/systemd/system/
sudo cp deploy/azure-ubuntu/chatsense-stock-sync.service /etc/systemd/system/
sudo cp deploy/azure-ubuntu/chatsense-stock-sync.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now chatsense-backend
sudo systemctl enable --now chatsense-stock-sync.timer
```

## 8. nginx

```bash
sudo cp deploy/azure-ubuntu/chatsense.nginx.conf /etc/nginx/sites-available/chatsense
sudo ln -s /etc/nginx/sites-available/chatsense /etc/nginx/sites-enabled/chatsense
sudo nginx -t
sudo systemctl reload nginx
```

## 9. Verify

```bash
systemctl status chatsense-backend
systemctl status chatsense-stock-sync.timer
curl http://127.0.0.1:8004/
curl http://127.0.0.1/api/
```

## Notes

- The repo currently contains a real-looking Gemini key in `.env`. Rotate that secret before any deployment.
- Use `requirements.ubuntu.txt` on Linux because the existing `requirements.txt` includes Windows-only packages and misses a few chatbot/runtime dependencies.
- The old auto-sync thread now stays disabled unless `ENABLE_RUNSERVER_STOCK_SYNC=True`, which avoids duplicate sync loops in production.
