FROM nginx:alpine

VOLUME /etc/letsencrypt
VOLUME /etc/nginx/conf.d

RUN apk update
RUN apk add --no-cache certbot certbot-nginx openssl openrc

RUN mkdir -p /tmp/nginx/conf.d
COPY sites/* /tmp/nginx/conf.d/
COPY site.conf.template /tmp/nginx/site.conf.template
# Backup existing nginx config
RUN cp -f /etc/nginx/conf.d/* /tmp/nginx/conf.d/ 

COPY 00-configure-domains.sh /docker-entrypoint.d/00-configure-domains.sh
RUN chmod +x /docker-entrypoint.d/00-configure-domains.sh

RUN echo "0 3 * * 0 root certbot renew -q --post-hook 'nginx -s reload'" >> /etc/crontab
