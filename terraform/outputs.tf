output "vpc_id" {
  value       = aws_vpc.globalmedx_vpc.id
  description = "ID of the created VPC"
}

output "eks_cluster_name" {
  value       = aws_eks_cluster.globalmedx_eks.name
  description = "Name of the EKS cluster"
}

output "eks_cluster_endpoint" {
  value       = aws_eks_cluster.globalmedx_eks.endpoint
  description = "EKS control plane endpoint URL"
}

output "subnet_ids" {
  value       = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id]
  description = "IDs of the public subnets"
}
