resource "aws_vpc" "globalmedx_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "globalmedx-vpc"
    Project = "GlobalMedX"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.globalmedx_vpc.id

  tags = {
    Name = "globalmedx-igw"
  }
}

resource "aws_subnet" "public_subnet_a" {
  vpc_id            = aws_vpc.globalmedx_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "globalmedx-public-1a"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"
  }
}

resource "aws_subnet" "public_subnet_b" {
  vpc_id            = aws_vpc.globalmedx_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "globalmedx-public-1b"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.globalmedx_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "globalmedx-public-rt"
  }
}

resource "aws_route_table_association" "pub_rt_assoc_a" {
  subnet_id      = aws_subnet.public_subnet_a.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "pub_rt_assoc_b" {
  subnet_id      = aws_subnet.public_subnet_b.id
  route_table_id = aws_route_table.public_rt.id
}
