# CODEBREAKOUT - Docker Image
# Lightweight nginx-based container for serving the game

FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy game files (used in production, overridden by volumes in dev)
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY src/ /usr/share/nginx/html/src/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
