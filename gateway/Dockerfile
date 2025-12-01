FROM nginx:alpine

# Remove default nginx configuration
RUN rm /etc/nginx/nginx.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create directories for static files
RUN mkdir -p /app/results /app/videos /app/screenshots

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
