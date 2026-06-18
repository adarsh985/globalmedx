# Deployment Guide

This document describes the manual local deployment and multi-container Docker Compose staging setup for the **GlobalMedX Worldwide Pandemic Surveillance Platform**.

---

## 1. Prerequisites
Ensure you have the following environments configured:
- **Node.js**: Version `18.x` or higher
- **NPM**: Version `9.x` or higher
- **MongoDB**: Community server version `6.x` or higher running locally
- **Docker**: Version `20.10.x` or higher
- **Docker Compose**: Version `2.x` or higher

---

## 2. Local Host Deployments

### Backend API Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file or configure your shell environment:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/globalmedx
   JWT_SECRET=globalmedx_super_secret_jwt_key_2026
   ```
3. Install dependencies and boot backend:
   ```bash
   npm install
   npm run dev
   ```

### Frontend Web Portal Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install package requirements:
   ```bash
   npm install
   ```
3. Boot the Vite hot-reloading dev server:
   ```bash
   npm run dev
   ```
4. Access `http://localhost:3000` to interact with the application.

---

## 3. Containerized Staging Deployment (Docker Compose)

The multi-container configuration is defined in [docker-compose.yml](file:///Users/adarshsingh/Sem%204%20/Devops/globalmedx/docker/docker-compose.yml). It provisions MongoDB, Vault, ELK stack (Elasticsearch, Logstash, Kibana), Prometheus, Grafana, and the application services.

### Build and Launch Services
1. Build code artifacts and start service networks:
   ```bash
   cd docker
   docker-compose up --build -d
   ```
2. Verify all container engines are active:
   ```bash
   docker-compose ps
   ```

### Vault Credential Seeding
Because Vault starts uninitialized, you must seed credentials before the backend can boot.
1. Run the automated seed script:
   ```bash
   cd ../vault
   chmod +x init-vault.sh
   ./init-vault.sh
   ```
2. If Vault is successfully seeded, the backend log will report `MongoDB Connected: globalmedx-mongodb`.

### Teardown Commands
To stop all services and clear local data storage:
```bash
cd docker
docker-compose down -v
```
