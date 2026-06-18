# Kubernetes Deployment Guide

This guide details the step-by-step instructions to orchestrate the **GlobalMedX** microservices on a local Kubernetes cluster (like Minikube, MicroK8s, or Docker Desktop K8s).

---

## 1. Verify Cluster Prerequisites
Ensure `kubectl` is authenticated and connected to your active cluster context:
```bash
kubectl cluster-info
```

---

## 2. Namespace & Configuration Deployments
Apply configurations in sequence:

1. **Namespace Isolation:**
   ```bash
   kubectl apply -f k8s/namespace.yaml
   ```
2. **Secrets Storage:**
   Deploy DB URLs, JWT tokens, and Vault access credentials:
   ```bash
   kubectl apply -f k8s/secrets.yaml
   ```
3. **ConfigMaps:**
   Register global environment variables:
   ```bash
   kubectl apply -f k8s/configmap.yaml
   ```

---

## 3. Database & Application Workloads

1. **MongoDB Stateful/PV Provisioning:**
   ```bash
   kubectl apply -f k8s/mongodb-deployment.yaml
   ```
2. **REST API Backend Pods:**
   ```bash
   kubectl apply -f k8s/backend-deployment.yaml
   ```
3. **Nginx React Frontend Pods:**
   ```bash
   kubectl apply -f k8s/frontend-deployment.yaml
   ```

---

## 4. Ingress Routing & DNS Setup

To allow local hostname mappings (`http://globalmedx.local`):

1. **Apply Ingress Controller rules:**
   ```bash
   kubectl apply -f k8s/ingress.yaml
   ```
2. **Locate ingress ingress gateway IP:**
   - **Minikube:**
     ```bash
     minikube ip
     ```
   - **Docker Desktop / Cloud:** The ingress gateway is binded to `127.0.0.1`.
3. Add the output IP to your hosts index file (`/etc/hosts`):
   ```text
   127.0.0.1 globalmedx.local
   ```
4. Test DNS mapping in your browser by opening `http://globalmedx.local`.

---

## 5. Horizontal Pod Autoscaler (HPA) Verification
Validate backend autoscaling:

1. **Enable Metrics Server (Minikube):**
   ```bash
   minikube addons enable metrics-server
   ```
2. **Apply Autoscaler rules:**
   ```bash
   kubectl apply -f k8s/hpa.yaml
   ```
3. **Monitor backend pods scaling metrics:**
   ```bash
   kubectl get hpa backend-hpa -n globalmedx --watch
   ```
