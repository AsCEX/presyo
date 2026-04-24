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
   environment=NODE_ENV="production",PORT="3000"
   ```

4. Update and start:
   ```bash
   sudo supervisorctl reread
   sudo supervisorctl update
   sudo supervisorctl start presyo
   ```

## Step 5: Configure Apache as Reverse Proxy

Apache will handle incoming web traffic and forward it to your Node.js server running on port 3000.

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
       ProxyPass / http://127.0.0.1:3000/
       ProxyPassReverse / http://127.0.0.1:3000/

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

## Troubleshooting 503 Errors

A **503 Service Unavailable** error in Apache usually means the reverse proxy cannot connect to the Node.js server.

1.  **Check if the Node.js server is running:**
    ```bash
    pm2 status
    # OR
    sudo supervisorctl status
    ```

2.  **Check application logs for crashes:**
    ```bash
    pm2 logs presyo
    # OR
    sudo tail -f /var/log/presyo.err.log
    ```

3.  **Check if the port is being listened to:**
    ```bash
    sudo ss -tulpn | grep :3000
    ```

4.  **Test the backend directly from the server:**
    ```bash
    curl -v http://127.0.0.1:3000/health
    ```
    If this works but the website doesn't, check Apache logs:
    ```bash
    sudo tail -f /var/log/apache2/presyo-error.log
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
