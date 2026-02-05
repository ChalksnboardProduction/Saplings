# Nginx & SSL Setup Guide for Amazon Linux 2023

**Domain:** `admissionenquirycnb.thevenkateshwarschool.com`
**EC2 IP:** `43.205.137.221`

## Step 1: Install Nginx
Run these commands on your EC2 server:

```bash
# Install Nginx
sudo dnf install -y nginx

# Start and Enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 2: Configure Reverse Proxy
We need to tell Nginx to forward traffic from your Domain -> Port 3000.

1.  **Create a new config file:**
    ```bash
    sudo nano /etc/nginx/conf.d/venkteshwar.conf
    ```

2.  **Paste this configuration:**
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

3.  **Save and Exit:**
    (Press `Ctrl+O`, `Enter`, `Ctrl+X`)

4.  **Test and Restart Nginx:**
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```

## Step 3: Install Certbot (SSL)
We will use Certbot to get a free HTTPS certificate.

```bash
# Install Certbot and Nginx plugin
sudo dnf install -y certbot python3-certbot-nginx

# Run Certbot (Follow the on-screen instructions)
sudo certbot --nginx -d admissionenquirycnb.thevenkateshwarschool.com
```

-   Enter your email when asked.
-   Agree to terms (`Y`).
-   It will automatically update your Nginx config to support HTTPS.

## Step 4: Verify
Open `https://admissionenquirycnb.thevenkateshwarschool.com` in your browser.
