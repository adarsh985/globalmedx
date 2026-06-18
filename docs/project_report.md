# DevOps Course Project Report

## Project Title: GlobalMedX – Worldwide Pandemic Surveillance & Response Platform
**Course Name:** DevOps Engineering & Practice (Semester 4)

---

## 1. Executive Summary / Abstract
GlobalMedX is a cloud-native worldwide pandemic surveillance, response, and analytics dashboard designed to monitor disease cases, track border entry clearances, and audit medical bed workloads. The platform is built using a modern full-stack architecture (React, Node.js, Express, MongoDB) integrated with enterprise DevOps patterns: containerization (Docker), orchestration (Kubernetes), infrastructure as code (Terraform), secrets storage (HashiCorp Vault), centralized logs (ELK Stack), and monitoring metrics (Prometheus & Grafana).

---

## 2. Project Goal and Objectives
The objective of this project is to build a reliable, secure, and auto-scaling health surveillance portal that demonstrates:
- **Agility:** Declarative Jenkins CI/CD pipelines to build, test, and release code changes.
- **Observability:** Centralized JSON logging via ELK stack, and request-response latency charts in Grafana.
- **Infrastructure Automation:** Single-command workspace setups via Docker Compose and Terraform VPC/EKS setups.
- **Platform Resilience:** Autoscaling pod groups based on traffic simulations.
- **Security Compliance:** Secrets isolation inside Vault and Role-Based Access Control policies.

---

## 3. Tech Stack & Architecture Details
The system utilizes a monolithic backend API connected to MongoDB.

```
+--------------------------------------------------------------+
|                         React Frontend                       |
+--------------------------------------------------------------+
                                |  HTTP Calls
                                v
+--------------------------------------------------------------+
|                        Express Backend                       |
+--------------------------------------------------------------+
      |                   |                  |             |
      v Fetch Secrets      v Read/Write       v Send Logs   v Scrape Metrics
+------------+     +------------+     +------------+  +-------------+
|   Vault    |     |  MongoDB   |     | Logstash   |  | Prometheus  |
+------------+     +------------+     +------------+  +-------------+
                                             |             |
                                             v Ingest      v Query
                                      +------------+  +-------------+
                                      |    ES/     |  |   Grafana   |
                                      |   Kibana   |  +-------------+
                                      +------------+
```

---

## 4. Key Functional Modules
The dashboard is split into nine fully interactive visual modules:
1. **Global Dashboard:** Aggregates cases, active patients, deaths, and system warnings.
2. **Surveillance Module:** Supports query filters and CRUD operations for disease reports.
3. **Hospital Management:** Registers facilities and tracks bed capacity limits.
4. **Laboratory Portal:** Logs viral positive/negative diagnostics work.
5. **Airports & Borders:** Audits incoming traveler checks and quarantine rates.
6. **Analytics Board:** Projects Chart.js graphs showing monthly growth vectors.
7. **Emergency Response:** Stockpile inventory controls and incident ticket logs.
8. **Outbreak Simulator:** Mutates database parameters to model real-world loads.
9. **Admin Portal:** Audits CPU RAM, database uptime, and operator credentials.

---

## 5. DevOps Implementation Outcomes
- **Docker Compose:** Streamlines multi-tier deployment (Frontend, Backend, DB, ELK, Vault, Prometheus, Grafana).
- **Kubernetes:** Orchestrates resource pods. Horizontal Pod Autoscalers (HPAs) scale replicas dynamically.
- **Terraform:** Configures VPC public/private network boundaries and manages nodes.
- **Jenkins Pipeline:** Eliminates manual delivery overheads.
- **Prometheus & Grafana:** Collects system-level throughput and average latencies.
- **ELK Centralized Logging:** Structured JSON log outputs processed by Logstash filters for Elasticsearch storage.
- **HashiCorp Vault:** Protects databases, passwords, and JWT credentials.
