# Terraform Infrastructure Provisioning Guide

This document defines the automated orchestration rules to stand up the EKS cluster and VPC network stack on AWS using HashiCorp Terraform.

---

## 1. Prerequisites
- Install **Terraform CLI** version `1.5.0` or higher.
- Install the **AWS CLI** and configure authentication keys:
  ```bash
  aws configure
  ```
- Ensure the user credentials have permissions to manage IAM roles, EKS, VPCs, and EC2 node groups.

---

## 2. Setup Variables
Review configuration parameters inside [variables.tf](file:///Users/adarshsingh/Sem%204%20/Devops/globalmedx/terraform/variables.tf).
You can modify AWS regions or node sizes:
- AWS Region: Default `us-east-1`
- Instance Types: Default `t3.medium`

---

## 3. Provision Infrastructure

1. **Initialize Terraform working workspace:**
   Installs AWS provider plugins:
   ```bash
   cd terraform
   terraform init
   ```
2. **Compile configuration dry-run plan:**
   Audits cloud changes:
   ```bash
   terraform plan -out=tfplan
   ```
3. **Execute provision application:**
   Applies VPC mappings, route policies, EKS control plane, and instances:
   ```bash
   terraform apply tfplan
   ```

*Note: EKS cluster initialization typically takes 10 to 15 minutes.*

---

## 4. Bind Kubectl to EKS Cluster
Once Terraform completes, update your local kubeconfig context:
```bash
aws eks update-kubeconfig --region us-east-1 --name globalmedx-eks
```
Verify nodes are operational:
```bash
kubectl get nodes
```

---

## 5. Teardown Cloud Infrastructure
To remove all cloud resources and avoid accidental billing:
```bash
terraform destroy --auto-approve
```
