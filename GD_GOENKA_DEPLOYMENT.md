# Complete Manual Deployment Guide (GD Goenka Dhanbad)

**Project:** GD Goenka Public School, Dhanbad CRM
**Server IP:** `43.205.137.221`
**Folder:** `~/gd-goenka`
**Port:** `3001`

---

## Phase 1: Server Setup (Skip if already done)

Run these commands on your **EC2 Terminal** if this is a fresh server. If you already deployed Venketeshwar on this server, skip to **Phase 1, Step 4 (Create Database)**.

### 1. Update & Install Node.js v20
```bash
sudo dnf update -y
sudo dnf install -y git
# Install Node Version Manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### 2. Install PostgreSQL (Skip if installed)
```bash
sudo dnf install -y postgresql15-server
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. Key Fix: Allow Password Authentication (Skip if done)
```bash
# Force replace 'ident' with 'md5' in config
sudo sed -i 's/ident/md5/g' /var/lib/pgsql/data/pg_hba.conf
sudo systemctl restart postgresql
```

### 4. Setup Database User & Schema (Required for GD Goenka)
Create a **separate database** for GD Goenka to keep data isolated.

```bash
# Switch to postgres user
sudo -u postgres psql

# Run these SQL commands inside the prompt:
CREATE USER gdgoenka_user WITH PASSWORD 'gdgoenka_pass';
CREATE DATABASE gdgoenka;
GRANT ALL PRIVILEGES ON DATABASE gdgoenka TO gdgoenka_user;
ALTER DATABASE gdgoenka OWNER TO gdgoenka_user;
\q
```

### 5. Create Swap File (Skip if done)
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## Phase 2: Application Setup

### 1. Clone Code (On Server)
```bash
# Go to home directory
cd ~

# Clone explicitly into 'gd-goenka' folder
git clone https://github.com/prannnjal/gd-goenka.git gd-goenka
cd gd-goenka

# Install dependencies (production only)
npm install --production
```

### 2. Configure Environment (On Server)
Create the production config:
```bash
nano .env.production
```
Paste this inside (Note the new DB name):
```env
DATABASE_URL="postgresql://gdgoenka_user:gdgoenka_pass@localhost:5432/gdgoenka"
NODE_ENV="production"
```

### 3. Initialize Database Tables (On Server)
```bash
psql "postgresql://gdgoenka_user:gdgoenka_pass@localhost:5432/gdgoenka" -f init.sql
```

---

## Phase 3: Build & Deploy (The "Local Build" Strategy)

Since building on the server fails due to memory, we use the local build method.

### 1. On Windows (Your Local PC)
Open VS Code terminal:
```powershell
# 1. Build the project
npm run build

# 2. Upload the .next folder to EC2
# (Replace Path-to-Key with your actual .pem file path)
scp -i "C:/Users/HP/Downloads/CRM_School.pem" -r .next ec2-user@43.205.137.221:~/gd-goenka/.next

# 3. Upload public folder (for images/videos)
scp -i "C:/Users/HP/Downloads/CRM_School.pem" -r public ec2-user@43.205.137.221:~/gd-goenka/public

# 4. Upload config files (just in case)
scp -i "C:/Users/HP/Downloads/CRM_School.pem" package.json ec2-user@43.205.137.221:~/gd-goenka/package.json
scp -i "C:/Users/HP/Downloads/CRM_School.pem" next.config.mjs ec2-user@43.205.137.221:~/gd-goenka/next.config.mjs
```

### 2. On EC2 (Server)
Start the app with PM2 on **Port 3001**:
```bash
# Go to folder
cd ~/gd-goenka

# Start the App on Port 3001
PORT=3001 pm2 start npm --name "gd-goenka" -- start

# Save for Reboot
pm2 save
```

---

## Phase 4: Domain & HTTPS (SSL)

### 1. DNS Setup (GoDaddy/Cloudflare)
Create an **A Record** for your new domain:
- **Name:** `your-subdomain` (e.g., `admission-gd`)
- **Value:** `43.205.137.221`

### 2. Install Nginx & Certbot (Skip if installed)
```bash
sudo dnf install -y nginx certbot python3-certbot-nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3. Configure Nginx
Create the config file for GD Goenka:
```bash
sudo nano /etc/nginx/conf.d/gdgoenka.conf
```
Paste this content (Replace `your-domain.com` with your actual domain):
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3001; # Pointing to Port 3001
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Enable HTTPS
```bash
# Verify config
sudo nginx -t
sudo systemctl restart nginx

# Generate SSL Cert
sudo certbot --nginx -d your-domain.com
```

---

## Cheat Sheet: Common Updates using Local Build

If you change code (e.g. `page.js`), follow these 3 steps to update the live site:

1.  **Windows**: `npm run build`
2.  **Windows**: `scp -i "C:/Users/HP/Downloads/CRM_School.pem" -r .next ec2-user@43.205.137.221:~/gd-goenka/.next`
3.  **EC2**: `pm2 restart gd-goenka`
