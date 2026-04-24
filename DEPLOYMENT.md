# Deployment Guide for Ubuntu 24.04

This guide covers how to deploy the **Presyo** (Vite + React PWA) application to an Ubuntu 24.04 server using Nginx.

## Prerequisites

-   A server running Ubuntu 24.04.
-   A user with `sudo` privileges.
-   Your project pushed to a Git repository (e.g., GitHub).

## Step 1: Update System & Install Dependencies

Update the package list and install necessary tools.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl nginx
```

## Step 2: Install Node.js

We recommend using Node.js 20 or later. Use the NodeSource repository for the latest version.

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify the installation:
```bash
node -v
npm -v
```

## Step 3: Clone and Build the Project

1. Clone your repository:
   ```bash
   git clone git@github.com-ascex:AsCEX/presyo.git
   cd presyo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project for production:
   ```bash
   npm run build
   ```
   This will create a `dist` folder in the project root.

## Step 4: Configure Process Manager (PM2 or Supervisor)

Since you want to run a Node.js server, you should use a process manager to keep the application running in the background and restart it if it crashes.

### Option A: Using PM2 (Recommended)

1. Install PM2 globally:
   ```bash
   sudo npm install -g pm2
   ```

2. Start the application:
   Using an ecosystem file (recommended):
   ```bash
   pm2 start ecosystem.config.cjs
   ```

   Or starting directly:
   ```bash
   pm2 start server.js --name "presyo"
   ```

3. Configure PM2 to start on boot:
   ```bash
   pm2 startup systemd
   # Follow the instruction displayed on the screen to run a specific command
   pm2 save
   ```

### Option B: Using Supervisor

1. Install Supervisor:
   ```bash
   sudo apt install -y supervisor
   ```

2. Create a configuration file:
   ```bash
   sudo nano /etc/supervisor/conf.d/presyo.conf
   ```

3. Paste the following configuration (adjust paths and user):
   ```ini
   [program:presyo]
   command=/usr/bin/node /home/ascex/presyo/server.js
   directory=/home/ascex/presyo
   autostart=true
   autorestart=true
   stderr_logfile=/var/log/presyo.err.log
   stdout_logfile=/var/log/presyo.out.log
   user=ascex
   environment=NODE_ENV="production",PORT="3111"
   ```

4. Update and start:
   ```bash
   sudo supervisorctl reread
   sudo supervisorctl update
   sudo supervisorctl start presyo
   ```

## Step 5: Configure Apache as Reverse Proxy

Apache will handle incoming web traffic and forward it to your Node.js server running on port 3111.

1. Install Apache and enable necessary modules:
   ```bash
   sudo apt install -y apache2
   sudo a2enmod proxy proxy_http
   ```

2. Create a new VirtualHost configuration:
   ```bash
   sudo nano /etc/apache2/sites-available/presyo.conf
   ```

3. Paste the following configuration (replace `your_domain_or_ip`):
   ```apache
   <VirtualHost *:80>
       ServerName your_domain_or_ip

       ProxyPreserveHost On
       ProxyPass / http://127.0.0.1:3111/
       ProxyPassReverse / http://127.0.0.1:3111/

       ErrorLog ${APACHE_LOG_DIR}/presyo-error.log
       CustomLog ${APACHE_LOG_DIR}/presyo-access.log combined
   </VirtualHost>
   ```

4. Enable the site and restart Apache:
   ```bash
   sudo a2ensite presyo
   sudo a2dissite 000-default # Optional: disable default site
   sudo systemctl restart apache2
   ```

## Verifying the Reverse Proxy

To ensure your reverse proxy (Apache or Nginx) is working correctly, follow these steps:

### 1. Check Configuration Syntax
Before restarting, always check if the configuration files have any syntax errors.

**For Apache:**
```bash
sudo apache2ctl configtest
```
You should see `Syntax OK`.

**For Nginx:**
```bash
sudo nginx -t
```
You should see `syntax is ok` and `test is successful`.

### 2. Check Service Status
Ensure the web server is actually running.

**For Apache:**
```bash
sudo systemctl status apache2
```

**For Nginx:**
```bash
sudo systemctl status nginx
```

### 3. Verify Backend Connectivity
The reverse proxy needs the Node.js app to be reachable. Test it from the server itself:
```bash
curl -I http://127.0.0.1:3111
```
(Note: Use the port defined in your `ecosystem.config.cjs`, which is `3111` in this project).

### 4. Check Reverse Proxy Response
Test if the reverse proxy is responding on the public/local IP:
```bash
curl -I http://localhost
```
You should see a `200 OK` if it's serving the app correctly.

### 5. Inspect Logs
If you get a **502 Bad Gateway** or **503 Service Unavailable**, check the error logs:

**For Apache:**
```bash
sudo tail -f /var/log/apache2/presyo-error.log
```

**For Nginx:**
```bash
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting 503 Errors

A **503 Service Unavailable** error in Apache usually means the reverse proxy cannot connect to the Node.js server.

### "Connection refused" (111) Troubleshooting

If you see `(111)Connection refused: AH00957` in Apache logs, it means Apache tried to connect to port 3111 but nothing was listening there, or the connection was actively rejected.

1.  **Check if the Node.js server is running:**
    ```bash
    pm2 status
    # OR
    sudo supervisorctl status
    ```
    If it's `stopped` or `errored`, start/restart it.

2.  **Verify the Port and Interface:**
    Ensure the app is listening on `127.0.0.1` or `0.0.0.0`.
    ```bash
    sudo ss -tulpn | grep :3111
    ```
    Expected output should show `LISTEN` and `127.0.0.1:3111` or `*:3111`.

3.  **Check for Firewall (UFW) Issues:**
    Usually, UFW doesn't block `lo` (loopback), but it's worth checking:
    ```bash
    sudo ufw status
    ```
    If you suspect a block, ensure loopback is allowed:
    ```bash
    sudo ufw allow in on lo
    ```

4.  **Check for SElinux (RHEL/CentOS) or AppArmor (Ubuntu):**
    On Ubuntu, AppArmor usually doesn't block local proxying by default, but if you've hardened the server, check `/var/log/syslog` for AppArmor denials.

5.  **Test the backend directly from the server:**
    ```bash
    curl -v http://127.0.0.1:3111/health
    ```
    If this works but the website doesn't, check Apache logs:
    ```bash
    sudo tail -f /var/log/apache2/presyo-error.log
    ```

6.  **Check application logs for crashes:**
    ```bash
    pm2 logs presyo
    # OR
    sudo tail -f /var/log/presyo.err.log
    ```

## Stopping and Starting the App

If you need to stop the application completely:

### Option A: Using PM2

To stop the process:
```bash
pm2 stop presyo
```
Or if using the ecosystem file:
```bash
pm2 stop ecosystem.config.cjs
```

To start it again:
```bash
pm2 start ecosystem.config.cjs
```

To delete the process from PM2's list:
```bash
pm2 delete presyo
```

### Option B: Using Supervisor

To stop the process:
```bash
sudo supervisorctl stop presyo
```

To start it again:
```bash
sudo supervisorctl start presyo
```

## Redeployment (Updating the App)

When you have new changes and want to update the production app, you don't necessarily need to `stop` PM2. Instead, follow these steps:

1.  **Pull the latest code:**
    ```bash
    git pull origin main
    ```

2.  **Install any new dependencies:**
    ```bash
    npm install
    ```

3.  **Build the project:**
    ```bash
    npm run build
    ```

4.  **Reload the process (Zero-Downtime):**
    If using PM2 with an ecosystem file:
    ```bash
    pm2 reload ecosystem.config.cjs
    ```
    `reload` is better than `restart` because it restarts processes one by one, keeping the app online.

    If using Supervisor:
    ```bash
    sudo supervisorctl restart presyo
    ```

5.  **Check for "dist" folder:**
    Ensure you have run `npm run build` and the `dist` folder exists in your project directory.

## Alternative: Deployment with Nginx

If you prefer Nginx over Apache, use the following configuration to serve static files directly:

1. Create a configuration file:
   ```bash
   sudo nano /etc/nginx/sites-available/presyo
   ```

2. Paste configuration:
   ```nginx
   server {
       listen 80;
       server_name your_domain_or_ip;
       root /home/ascex/presyo/dist;
       index index.html;
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. Enable and restart:
   ```bash
   sudo ln -s /etc/nginx/sites-available/presyo /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```

## Alternative: Deployment with Docker

1. **Install Docker on Ubuntu:**
   ```bash
   sudo apt install -y docker.io docker-compose
   ```

2. **Create a `Dockerfile` in the project root:**
   ```dockerfile
   # Build stage
   FROM node:20-slim AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   # Production stage
   FROM nginx:stable-alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx-docker.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

3. **Create `nginx-docker.conf` for Docker:**
   ```nginx
   server {
       listen 80;
       location / {
           root /usr/share/nginx/html;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **Build and Run:**
   ```bash
   docker build -t presyo-app .
   docker run -d -p 80:80 presyo-app
   ```
