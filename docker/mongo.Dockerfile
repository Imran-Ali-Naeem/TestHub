# MongoDB Dockerfile (optional - can use official mongo image)
FROM mongo:7

# Copy initialization script
COPY ../database/mongo/init.js /docker-entrypoint-initdb.d/

EXPOSE 27017

CMD ["mongod"]
