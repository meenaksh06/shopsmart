variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "shopsmart"
}

variable "s3_bucket_name" {
  description = "Unique name for the S3 bucket"
  type        = string
}

variable "container_image" {
  description = "Docker image URI"
  type        = string
  default     = ""
}
