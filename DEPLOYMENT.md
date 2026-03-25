# DocQ | Production Deployment Guide
**Infrastructure Target**: `docq.bourntec.com`
**Drafted**: 2026-03-25

---

## 1. System Prerequisites
Ensure the target server (Ubuntu 22.04+ recommended) has the following runtimes installed:
*   **Python 3.10+**
*   **Node.js 18+ & NPM**
*   **Nginx** (Reverse Proxy & Static File Server)
*   **Gunicorn** (WSGI HTTP Server)

---

## 2. Phase 1: Environment Orchestration

### 2.1 Clone and Setup Backend
```bash
# Clone the repository
git clone https://github.com/Bourntec-Solutions-Inc/DocQ.git
cd DocQ/backend

# Initialize virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2.2 Configure Backend Environment Variables
Create a `.env` file in the `backend/` directory:
```env
DEBUG=False
SECRET_KEY=your-highly-secure-production-key
ALLOWED_HOSTS=docq.bourntec.com,localhost
CORS_ALLOWED_ORIGINS=https://docq.bourntec.com
```

### 2.3 Configure Frontend Environment Variables
Vite uses environment-specific files during the build process. Ensure `DocQ/frontend/.env.production` is correctly set:
```env
VITE_API_URL=https://docq.bourntec.com/api/
```

---

## 3. Phase 2: Application Delivery

### 3.1 Database & Intelligence Lifecycle

DocQ utilizes an adaptive persistence layer. While it defaults to SQLite for local development, it is architected for PostgreSQL in production.

#### A. Generating & Applying Migrations
> [!IMPORTANT]
> Since migrations are excluded from Version Control (`.gitignore`) to prevent collaborative conflicts, you MUST generate them upon first deployment to a new environment.

```bash
cd backend
# 1. Generate the schema definitions based on the DocQ architecture
python manage.py makemigrations accounts jobs execution scheduler chat reports common

# 2. Apply the schema to the target database
python manage.py migrate
```

#### B. Administrative Access
Establish the first executive identity to manage jobs and view system-wide telemetry:
```bash
python manage.py createsuperuser
# Follow prompts to set email, name, and password
```

#### C. Enterprise Database (PostgreSQL Recommendation)
For high-concurrency production workloads on `docq.bourntec.com`, replace SQLite by updating your `backend/.env`:
1.  **Driver**: `pip install psycopg2-binary`.
2.  **Env**: `DATABASE_URL=postgres://user:password@localhost:5432/docq_db`.

---

## 4. Phase 2: Application Delivery

### 4.1 Backend Asset Finalization
```bash
# 1. Aggregate static assets for Nginx
python manage.py collectstatic --noinput

# 2. Persistence & Permissions
# Ensure the backend can write audit results and PDF syntheses
mkdir -p media/reports media/jobs
chmod -R 755 media/
```

### 3.2 Frontend Synthesis (Vite)
```bash
cd ../frontend
npm install
npm run build
# This creates a 'dist/' folder containing the optimized SPA
```

---

## 4. Phase 3: Service Orchestration

### 4.1 Nginx Reverse Proxy Configuration
Create a new Nginx configuration (e.g., `/etc/nginx/sites-available/docq`):
```nginx
server {
    listen 80;
    server_name docq.bourntec.com;

    # Frontend Static Files
    location / {
        root /var/www/docq/frontend/dist;
        index index.html;
        try_files $uri /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Django Admin & Static/Media
    location /admin/ { proxy_pass http://127.0.0.1:8000/admin/; }
    location /static/ { alias /var/www/docq/backend/static/; }
    location /media/ { alias /var/www/docq/backend/media/; }
}
```

### 4.2 Gunicorn Application Server
Run the backend as a background process using Gunicorn:
```bash
cd ../backend
gunicorn --workers 3 --bind 127.0.0.1:8000 core.wsgi:application
```
*Note: For production persistence, wrap this in a **systemd** service unit.*

---

## 5. Phase 4: Security & SSL Hardening

1.  **SSL Termination**: Generate a TLS certificate using Certbot:
    ```bash
    sudo certbot --nginx -d docq.bourntec.com
    ```
2.  **HTTPS Enforcement**: Confirm that DocQ automatically redirects HTTP → HTTPS (handled by Django's `SECURE_SSL_REDIRECT=True` and Nginx).
3.  **Firewall Check**: Ensure ports `80` (HTTP) and `443` (HTTPS) are open.

---

## 6. Maintenance & Troubleshooting
*   **Logs**: 
    *   Backend: `tail -f /var/log/nginx/error.log`
    *   Intelligence Engine: Check the `ExecutionLog` model in the Django Admin for ingestion failures.
*   **Misfire Grace Period**: The `APScheduler` in the backend is configured with a 60s grace window. If the server is down for more than 60s, missed runs will be logged as skipped and rescheduled for the next cycle.
