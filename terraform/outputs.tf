output "full_url" {
  description = "Full URL for the Credchit service"
  value       = "https://${var.subdomain}.${var.domain_root}"
}

output "api_url" {
  description = "API URL for the Credchit service"
  value       = "https://${var.subdomain}.${var.domain_root}/api"
}

