# Redis Dockerfile (optional - can use official redis image)
FROM redis:7-alpine

# Copy custom redis configuration if needed
# COPY redis.conf /usr/local/etc/redis/redis.conf

EXPOSE 6379

# CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
CMD ["redis-server"]
