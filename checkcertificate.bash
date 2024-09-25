#!/bin/bash

# Path to the YAML file
YAML_FILE="domains.yml"

# Function to parse YAML and extract domains
parse_yaml() {
   grep -oP '^\s*-\s*\K.*' "$YAML_FILE"
}

# Read domains from YAML
yaml_domains=$(parse_yaml)

# Get the domains from the current certificate using certbot
cert_domains=$(certbot certificates 2>/dev/null | grep -oP '(?<=Domains: ).*')

# Convert to arrays for easier comparison
yaml_domains_array=($yaml_domains)
cert_domains_array=($cert_domains)

# Function to compare two arrays and output differences
compare_domains() {
    local yaml_list=("$@")
    local missing_in_cert=()
    
    # Check each domain in the YAML list
    for yaml_domain in "${yaml_list[@]}"; do
        if [[ ! " ${cert_domains_array[@]} " =~ " ${yaml_domain} " ]]; then
            missing_in_cert+=("$yaml_domain")
        fi
    done

    if [ ${#missing_in_cert[@]} -eq 0 ]; then
        echo "All domains in the YAML file are registered in the certificate."
    else
        echo "The following domains are in the YAML file but missing from the certificate:"
        for domain in "${missing_in_cert[@]}"; do
            echo "- $domain"
        done
    fi
}

# Compare the YAML domains with the registered certificate domains
echo "Comparing domains from YAML and certificate..."
compare_domains "${yaml_domains_array[@]}"

# Compare the registered domains with the YAML file domains
missing_in_yaml=()
for cert_domain in "${cert_domains_array[@]}"; do
    if [[ ! " ${yaml_domains_array[@]} " =~ " ${cert_domain} " ]]; then
        missing_in_yaml+=("$cert_domain")
    fi
done

if [ ${#missing_in_yaml[@]} -eq 0 ]; then
    echo "All domains registered in the certificate are listed in the YAML file."
else
    echo "The following domains are registered in the certificate but missing from the YAML file:"
    for domain in "${missing_in_yaml[@]}"; do
        echo "- $domain"
    done
fi
