# Manual Deployment to AWS EC2 (No Docker)

This guide details how to manually set up your environment on AWS EC2 to run the Next.js application and PostgreSQL database.

## Prerequisites
-   An AWS Account.
-   SSH access to your instance.

## Step 1: Launch an EC2 Instance
*(Same as before)*
1.  Launch an **Ubuntu Server 24.04 LTS** instance.
2.  Configure Security Group to allow **Port 3000** (Custom TCP) and **Port 22** (SSH).

## Step 2: Connect to your Instance
```powershell
ssh -i "path\to\your-key.pem" ubuntu@your-ec2-ip
```

## Step 3: Install Node.js (v20+)
Run these commands on the server to install Node.js 20:

```bash
# Download and install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node -v
# Should output v20.x.x
```

## Step 4: Install & Configure PostgreSQL (Amazon Linux 2023)
```bash
# Install Postgres 15
sudo dnf update -y
sudo dnf install -y postgresql15 postgresql15-server

# Initialize DB
sudo /usr/bin/postgresql-setup --initdb

# Start the service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create a database user and db
sudo -u postgres psql
```

Inside the `psql` shell, run:
```sql
-- Create User
CREATE USER myuser WITH PASSWORD 'mypassword';

-- Create Database
CREATE DATABASE venkteshwar;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE venkteshwar TO myuser;
ALTER DATABASE venkteshwar OWNER TO myuser;

-- Verify & Exit
\l
\q
```

## Step 5: Upload Project Files
From your **local machine**, copy the files:
```powershell
scp -i "key.pem" -r . ubuntu@your-ec2-ip:~/app
```
*(Ideally, exclude `node_modules` and `.next` folders to save time).*

## Step 6: Install Dependencies & Build
Back on the **server**:

**IMPORTANT: Fix for "Build Failed" / Out of Memory**
If you are using a Free Tier instance (t2.micro/t3.micro), `npm run build` will likely fail due to low memory. **Run these commands first to create a Swap file:**

```bash
# Create a 4GB swap file
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make it permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Now you can build:

```bash
cd ~/app

# Install dependencies
npm install

# Create production build
npm run build
```

## Step 7: Configure Environment Variables
Create a `.env.production` file:
```bash
nano .env.production
```
Paste this content (update password if changed):
```env
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/venkteshwar
NODE_ENV=production
```
Save: `Ctrl+O`, `Enter`, `Ctrl+X`.

## Step 8: Initialize Database Table
We need to create the `students` table. We can run the `init.sql` script manually:

```bash
# Login to your DB
psql "postgresql://myuser:mypassword@localhost:5432/venkteshwar" -f init.sql
```

## Step 9: Start App with PM2
PM2 is a process manager that keeps your app alive.

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the app
pm2 start npm --name "venkteshwar" -- start

# Save process list so it restarts on reboot
pm2 save
pm2 startup
```
*(Run the command output by `pm2 startup` if asked)*

## Step 10: Access the App
Go to `http://your-ec2-ip:3000`.

---
**Troubleshooting**
-   **App not loading?** Check Security Group (Step 1).
-   **Logs?** Run `pm2 logs venkteshwar`.

**Fix: "FATAL: Ident authentication failed"**
If you see this error, PostgreSQL is trying to use your Linux username instead of the password.
1.  Edit the config:
    ```bash
    sudo nano /var/lib/pgsql/data/pg_hba.conf
    ```
2.  Scroll down to the bottom. Find lines like this:
    ```
    host    all             all             127.0.0.1/32            ident
    host    all             all             ::1/128                 ident
    ```
3.  Change `ident` to `md5` (or `scram-sha-256`):
    ```
    host    all             all             127.0.0.1/32            md5
    host    all             all             ::1/128                 md5
    ```
4.  Save (`Ctrl+O`, `Enter`, `Ctrl+X`) and restart:
    ```bash
    sudo systemctl restart postgresql
    ```
