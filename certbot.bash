#!/bin/bash

# Path to the YAML file
YAML_FILE="domains.yml"
WEBROOT_PATH="/opt/remix-wildcard/public/"

# Function to parse YAML and extract domains
parse_yaml() {
   grep -oP '^\s*-\s*\K.*' "$YAML_FILE"
}

# Read domains from YAML
domains=$(parse_yaml)

# Build the certbot command with all domains
certbot_command="certbot certonly --webroot -w $WEBROOT_PATH"

for domain in $domains; do
    certbot_command+=" -d $domain"
done

# Display the command and ask for confirmation
echo "The following command will be run:"
echo "$certbot_command"

read -p "Do you want to proceed? (y/n): " confirm

# Check the user's input
if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
    # Run the certbot command
    echo "Running command..."
    $certbot_command
else
    echo "Command aborted."
    exit 1
fi
