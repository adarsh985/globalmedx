# Jenkins CI/CD Automation Guide

This guide details configuring and executing the declarative Jenkins build and deployment pipeline for the **GlobalMedX** surveillance portal.

---

## 1. Prerequisites
- A running **Jenkins** instance with Docker and Kubectl tools installed.
- Recommended Plugins:
  - Git Plugin
  - Pipeline Utility Steps
  - Docker Pipeline
  - Credentials Binding Plugin

---

## 2. Store Credentials in Jenkins
To allow the pipeline to push to Docker Hub and authenticate to your K8s cluster:

1. **Docker Hub Access:**
   - Go to: **Manage Jenkins** -> **Credentials** -> **System** -> **Global credentials**.
   - Select **Add Credentials** -> Type: **Username with password**.
   - ID: `dockerhub-login`
   - Fill in your registry username and password.

2. **Kubernetes Kubeconfig:**
   - Go to: **Manage Jenkins** -> **Credentials**.
   - Select **Add Credentials** -> Type: **Secret file**.
   - ID: `k8s-kubeconfig`
   - Upload your active `kubeconfig` file (usually located at `~/.kube/config`).

---

## 3. Create Jenkins Pipeline Job
1. Open Jenkins Dashboard -> Click **New Item**.
2. Name it `globalmedx-surveillance-pipeline` -> Select **Pipeline** -> Click **OK**.
3. Under **Pipeline Definition** -> Choose **Pipeline script from SCM**.
4. SCM: **Git**
5. Repository URL: Provide your repo checkout path.
6. Script Path: `jenkins/Jenkinsfile`
7. Click **Save** and trigger a **Build Now**.

---

## 4. Pipeline Stages Explanation
- **Stage 1: Checkout Code:** Pulls repository files.
- **Stage 2: Install Dependencies:** Runs npm package manager installs.
- **Stage 3: Run Tests:** Mocks quality checks.
- **Stage 4: Build Application:** Generates optimized React distributions.
- **Stage 5: Build Docker Images:** Compiles application binaries into docker containers.
- **Stage 6: Push Images:** Pushes tags to Docker Hub repository targets.
- **Stage 7: Deploy To Kubernetes:** Executes `kubectl apply` resources deployment.
