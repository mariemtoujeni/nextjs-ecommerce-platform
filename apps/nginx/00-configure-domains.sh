#!/bin/sh

if [ "$ENV" = "prod" ]; then
    echo "Using prod urls"
    DOMAINS="admin.nataquashop.com;http://mlcn-admin:3000 \
            nataquashop.com;http://mlcn-nataquashop:3000 \
            db.nataquashop.com;http://supabase-kong:8000 \
            bi.nataquashop.com;http://mlcn-metabase:3000"
else
    echo "Using dev urls"
    DOMAINS="dev.admin.nataquashop.com;http://mlcn-admin:3000 \
            dev.nataquashop.com;http://mlcn-nataquashop:3000 \
            dev.db.nataquashop.com;http://supabase-kong:8000 \
            dev.bi.nataquashop.com;http://mlcn-metabase:3000"
fi

cp /tmp/nginx/conf.d/* /etc/nginx/conf.d/


for domain in $DOMAINS; do
    echo "Processing domain: $domain"
    
    export url=$(echo $domain | cut -d ';' -f 1)
    export service=$(echo $domain | cut -d ';' -f 2)

    if [ ! -d "/etc/letsencrypt/live/$url" ]; then
        echo "No certificate found for $url, generating..."
        certbot certonly --standalone \
            --non-interactive \
            --agree-tos \
            --email technataqua@gmail.com \
            -d $url
    else
        echo "Certificate already exists for $url"
    fi

    envsubst '$url $service' < /tmp/nginx/site.conf.template > "/etc/nginx/conf.d/$url.conf"
done

