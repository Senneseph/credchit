variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "droplet_ip" {
  description = "IP address of the existing droplet"
  type        = string
  default     = "167.71.191.234"
}

variable "manage_dns" {
  description = "Whether to manage DNS records"
  type        = bool
  default     = true
}

variable "domain_root" {
  description = "Root domain (e.g., iffuso.com)"
  type        = string
  default     = "iffuso.com"
}

variable "subdomain" {
  description = "Subdomain for the service"
  type        = string
  default     = "credchit"
}

