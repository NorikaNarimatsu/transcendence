FROM nginx:bullseye

# Remove default Nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy our static files
COPY ../frontend /usr/share/nginx/html
