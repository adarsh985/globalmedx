variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "Target AWS Region for Deployment"
}

variable "cluster_name" {
  type        = string
  default     = "globalmedx-eks"
  description = "Name of the Elastic Kubernetes Service Cluster"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "VPC CIDR Block"
}

variable "node_instance_type" {
  type        = string
  default     = "t3.medium"
  description = "Instance type for EKS worker nodes"
}

variable "db_storage_size" {
  type        = number
  default     = 20
  description = "S3 backup bucket or EBS storage size in GB"
}
