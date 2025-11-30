#!/bin/bash
set -e

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "🌐 Setting up DNS for Credchit..."

# Check if terraform is available
if ! command -v terraform &> /dev/null; then
    echo "Terraform not found. Using DigitalOcean API directly..."

    # Use curl to create DNS record
    curl -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${DIGITALOCEAN_ACCESS_TOKEN}" \
        -d '{"type":"A","name":"credchit","data":"'"${DEPLOY_SERVER_IP:-167.71.191.234}"'","ttl":300}' \
        "https://api.digitalocean.com/v2/domains/iffuso.com/records"

    echo ""
    echo "✅ DNS configured via API!"
else
    cd terraform

    # Create tfvars file
    cat > terraform.tfvars << EOF
do_token    = "${DIGITALOCEAN_ACCESS_TOKEN}"
droplet_ip  = "${DEPLOY_SERVER_IP:-167.71.191.234}"
manage_dns  = true
domain_root = "iffuso.com"
subdomain   = "credchit"
EOF

    # Initialize and apply
    terraform init
    terraform plan
    terraform apply -auto-approve

    echo "✅ DNS configured via Terraform!"
fi

echo "🕐 DNS propagation may take a few minutes..."

