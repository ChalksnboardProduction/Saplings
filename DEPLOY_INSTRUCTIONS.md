# Quick Deployment Guide (Venkteshwar School CRM)

Follow these steps to deploy the application to the AWS EC2 instance.

**Server IP:** `43.205.137.221`
**SSH Key:** `C:/Users/HP/Downloads/CRM_School.pem`
**App Directory:** `~/venketeshwar`

## 1. Build Verification (Local)
First, ensure the application builds correctly on your local machine.

```powershell
npm run build
```

## 2. Deploy (Changes Only)
Run this command in your **VS Code Terminal (PowerShell)** to upload the built application and static assets.

```powershell
scp -i "C:/Users/HP/Downloads/CRM_School.pem" -r .next public package.json next.config.mjs ec2-user@43.205.137.221:~/venketeshwar/
```

## 3. Restart Application (Remote)
Run this command to install any new dependencies and restart the server.

```powershell
ssh -i "C:/Users/HP/Downloads/CRM_School.pem" ec2-user@43.205.137.221 "cd ~/venketeshwar && npm install --production && pm2 restart venkteshwar"
```

---

### Troubleshooting
- **Permission Denied?** Ensure the path to your `.pem` file is correct.
- **502 Bad Gateway?** The server might be restarting. Wait 30 seconds.
- **Check Logs:** `ssh -i ... ec2-user@... "pm2 logs venkteshwar"`
