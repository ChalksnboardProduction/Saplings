# Complete Manual Deployment Guide (Amazon Linux 2023)

**Project:** Venkteshwar School CRM
**Server IP:** `43.205.137.221`
**Domain:** `admissionenquirycnb.thevenkateshwarschool.com`

---

## Phase 1: Server Setup (One-Time)

Run these commands on your **EC2 Terminal** to prepare the system.

### 1. Update & Install Node.js v20
```bash
sudo dnf update -y
sudo dnf install -y git
# Install Node Version Manager (Fastest way to get Node 20)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### 2. Install PostgreSQL
```bash
sudo dnf install -y postgresql15-server
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. Key Fix: Allow Password Authentication
By default, Postgres fails with "Ident authentication failed". Fix it now:
```bash
# Force replace 'ident' with 'md5' in config
sudo sed -i 's/ident/md5/g' /var/lib/pgsql/data/pg_hba.conf
sudo systemctl restart postgresql
```

### 4. Setup Database User & Schema
```bash
# Switch to postgres user
sudo -u postgres psql

# Run these SQL commands inside the prompt:
CREATE USER myuser WITH PASSWORD 'mypassword';
CREATE DATABASE venkteshwar;
GRANT ALL PRIVILEGES ON DATABASE venkteshwar TO myuser;
ALTER DATABASE venkteshwar OWNER TO myuser;
\q
```

### 5. Create Swap File (Prevent Out of Memory)
Even for running the app, extra memory is safe.
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## Phase 2: Application Setup

### 1. Download Code
```bash
git clone https://github.com/prannnjal/venketeshwar.git
cd venketeshwar
npm install
```

### 2. Configure Environment
Create the production config:
```bash
nano .env.production
```
Paste this inside:
```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/venkteshwar"
NODE_ENV="production"
```

### 3. Initialize Database Tables
```bash
psql "postgresql://myuser:mypassword@localhost:5432/venkteshwar" -f init.sql
```

---

## Phase 3: Build & Deploy (The "Local Build" Strategy)

Since the EC2 instance is small, we build on Windows and upload.

### 1. On Windows (Local PC)
Open VS Code terminal:
```powershell
# Build the project
npm run build

# Upload the .next folder to EC2
# (Replace Path-to-Key with your actual .pem file path)
scp -i "Path-to-Key.pem" -r .next ec2-user@43.205.137.221:~/venketeshwar/.next
```

### 2. On EC2 (Server)
Start the app with PM2:
```bash
# Install PM2
npm install -g pm2

# Start the App
pm2 start npm --name "venkteshwar" -- start

# Save for Reboot
pm2 save
pm2 startup
# (Run the command output by the line above)
```

---

## Phase 4: Domain & HTTPS (SSL)

### 1. DNS Setup (GoDaddy/Cloudflare)
Create an **A Record**:
- **Name:** `admissionenquirycnb`
- **Value:** `43.205.137.221`

### 2. Install Nginx & Certbot
```bash
sudo dnf install -y nginx certbot python3-certbot-nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3. Configure Nginx
Create the config file:
```bash
sudo nano /etc/nginx/conf.d/venkteshwar.conf
```
Paste this content:
```nginx
server {
    listen 80;
    server_name admissionenquirycnb.thevenkateshwarschool.com;

    location / {
        proxy_pass http://localhost:3000;
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
sudo certbot --nginx -d admissionenquirycnb.thevenkateshwarschool.com
```

---

## Cheat Sheet: Common Updates using Local Build

If you change code (e.g. `page.js`), follow these 3 steps to update the live site:

1.  **Windows**: `npm run build`
2.  **Windows**: `scp -i keyring.pem -r .next ec2-user@IP:~/venketeshwar/.next`
3.  **EC2**: `pm2 restart venkteshwar`
