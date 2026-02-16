# Complete Manual Deployment Guide (Saplings)

**Project:** Saplings CRM
**Server IP:** `43.205.137.221`
**Folder:** `~/Saplings`
**Port:** `3002` (To avoid conflict with other apps)

---

## Phase 1: Server Setup (Skip if already done)

Since `Venkteshwar` and `GD Goenka` seem to be on this server, Node.js and PostgreSQL are likely already installed. You just need to set up the **Database**.

### 1. Setup Database User & Schema (Specific for Saplings)
Create a **separate database** for Saplings to keep data isolated.

```bash
# Switch to postgres user
sudo -u postgres psql

# Run these SQL commands inside the prompt:
CREATE USER saplings_user WITH PASSWORD 'saplings_pass_123';
CREATE DATABASE saplings_db;
GRANT ALL PRIVILEGES ON DATABASE saplings_db TO saplings_user;
ALTER DATABASE saplings_db OWNER TO saplings_user;
\q
```

---

## Phase 2: Application Setup

### 1. Configure Environment (On Server)
You have already cloned the code. Now create the environment file.

```bash
cd ~/Saplings
nano .env.production
```

Paste this inside:
```env
DATABASE_URL="postgresql://saplings_user:saplings_pass_123@localhost:5432/saplings_db"
NODE_ENV="production"
```

### 2. Initialize Database Tables (On Server)
```bash
psql "postgresql://saplings_user:saplings_pass_123@localhost:5432/saplings_db" -f init.sql
```

---

## Phase 3: Build & Deploy (Local Build Strategy)

We will build locally and upload, just like the other projects.

### 1. On Windows (Your Local PC)
Open your VS Code terminal in the `Saplings` project:

```powershell
# 1. Build the project
npm run build

# 2. Upload the .next folder to EC2
scp -i "C:/Users/HP/Downloads/CRM_School.pem" -r .next ec2-user@43.205.137.221:~/Saplings/.next

# 3. Upload public folder (for assets)
scp -i "C:/Users/HP/Downloads/CRM_School.pem" -r public ec2-user@43.205.137.221:~/Saplings/public

# 4. Upload config files (ensure they are up to date)
scp -i "C:/Users/HP/Downloads/CRM_School.pem" package.json ec2-user@43.205.137.221:~/Saplings/package.json
scp -i "C:/Users/HP/Downloads/CRM_School.pem" next.config.mjs ec2-user@43.205.137.221:~/Saplings/next.config.mjs
```

### 2. On EC2 (Server)
Start the app with PM2 using the configuration file:

```bash
# Go to folder
cd ~/Saplings

# Install dependencies
npm install --production

# Start/Restart the App using the ecosystem file
pm2 start ecosystem.config.js
pm2 save
```

---

## Phase 4: Domain & HTTPS (SSL)

### 1. DNS Setup
Create an **A Record** for your new domain pointing to `43.205.137.221`.

### 2. Configure Nginx
Create the config file:

```bash
sudo nano /etc/nginx/conf.d/saplings.conf
```

Paste this content (Replace `your-domain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name admissionenquirycnb.saplingsspv.com;

    location / {
        proxy_pass http://localhost:3002; # Pointing to Port 3002
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable HTTPS
```bash
# Verify config
sudo nginx -t
sudo systemctl restart nginx

# Generate SSL Cert
sudo certbot --nginx -d admissionenquirycnb.saplingsspv.com
```
