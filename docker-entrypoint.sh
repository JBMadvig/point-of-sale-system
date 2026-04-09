#!/bin/bash
set -e

(
  echo "⏳ Waiting for Mongo to be ready..."
  until mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
    sleep 1
  done

  echo "✅ Mongo is up and running!"
  if ! mongosh --quiet --eval "rs.status().ok" | grep -q 1 > /dev/null 2>&1; then
    echo "❗ Replica set not initialized"
    echo "🚀 Initiating replica set..."
    mongosh --eval 'rs.initiate({_id: "rs0", members: [{ _id: 0, host: "mongodb:27017" }]})' > /dev/null 2>&1

    echo "🗂️ Creating collections..."
    # mongosh --eval 'db.getSiblingDB("mfan").createCollection("tmps")' > /dev/null 2>&1
    mongosh --eval 'db.getSiblingDB("mfan").createCollection("users")' > /dev/null 2>&1
  fi
) &

if [ "$SILENT" != "true" ]; then
    echo "Starting MongoDB..."
    exec mongod --replSet rs0 --bind_ip_all --port 27017
else 
    echo "Starting MongoDB in silent mode..."
    exec mongod --replSet rs0 --bind_ip_all --port 27017 > /dev/null 2>&1
fi
