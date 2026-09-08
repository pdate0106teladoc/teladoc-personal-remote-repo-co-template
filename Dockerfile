FROM docker.artifactory.intouchhealth.io/tdh/nodejs-22:0.0.1 AS build
USER root
WORKDIR /app
COPY --chown=node:node . .
COPY --chown=node:node fe-ucc-remote/.npmrc .
ARG VITE_MODE=prod
ENV VITE_MODE=${VITE_MODE}

RUN echo "Building with VITE_MODE=$VITE_MODE" \
    && npm ci \
    && npm install -D typescript@5.3.3 \
    && npm run build -- --mode $VITE_MODE

FROM docker.artifactory.intouchhealth.io/tdh/almalinux-9-minimal:0.0.9

# FIX: Update all OS packages to patch libxml2, sqlite, expat, etc.
RUN microdnf update -y \
    && microdnf install -y nginx \
    && microdnf clean all \
    && mkdir -p /usr/share/nginx/html \
    && chown nginx /var/log/nginx

# React creates /app/build — not /app/dist/public
COPY --from=build /app/dist /usr/share/nginx/html
COPY /config/nginx/nginx.conf /etc/nginx/nginx.conf

USER nginx
EXPOSE 9000
ENTRYPOINT ["nginx", "-g", "daemon off;"]
