terraform {
  required_version = ">= 1.0"

  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

# DNS Record for the subdomain
resource "digitalocean_record" "credchit" {
  count  = var.manage_dns ? 1 : 0
  domain = var.domain_root
  type   = "A"
  name   = var.subdomain
  value  = var.droplet_ip
  ttl    = 300
}

# Output the full domain
output "domain" {
  value = var.manage_dns ? "${var.subdomain}.${var.domain_root}" : "DNS not managed"
}

output "server_ip" {
  value = var.droplet_ip
}

