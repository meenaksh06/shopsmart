resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_ecr_repository" "app" {
  name                 = "${var.project_name}-repo-${random_id.suffix.hex}"
  force_delete         = true
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster-${random_id.suffix.hex}"
}

# Use the pre-existing LabRole provided by AWS Academy/Vocareum
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${var.project_name}-${random_id.suffix.hex}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = data.aws_iam_role.lab_role.arn
  task_role_arn            = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([
    {
      name      = var.project_name
      image     = var.container_image != "" ? var.container_image : "${aws_ecr_repository.app.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 5001
          hostPort      = 5001
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.project_name}"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "5001" },
        { name = "DATABASE_URL", value = "file:./dev.db" },
        { name = "JWT_SECRET", value = "prod_secret_do_not_use_in_real_life" }
      ]
    }
  ])
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project_name}-logs-${random_id.suffix.hex}"
  retention_in_days = 7
  skip_destroy      = false
}

resource "aws_ecs_service" "app" {
  name            = "${var.project_name}-service-${random_id.suffix.hex}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "shopsmart"
    container_port   = 5001
  }

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }

  lifecycle {
    ignore_changes = [task_definition]
  }
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_security_group" "ecs_tasks" {
  name        = "${var.project_name}-sg-${random_id.suffix.hex}"
  description = "Allow inbound access on port 5001"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    protocol        = "tcp"
    from_port       = 5001
    to_port         = 5001
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "ecs_service_name" {
  value = aws_ecs_service.app.name
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "task_definition_family" {
  value = aws_ecs_task_definition.app.family
}
