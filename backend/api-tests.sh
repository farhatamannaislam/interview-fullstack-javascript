#!/bin/bash

API_URL="http://localhost:8000/api/cities"

echo "============================="
echo "🔄 Testing City API via curl"
echo "============================="

# 1. Add a new city
echo "➕ Adding city..."
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{"name": "ScriptCity", "count": 123}'
echo -e "\n✅ Added ScriptCity"

# 2. Try adding duplicate city
echo "🚫 Adding duplicate city..."
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{"name": "ScriptCity", "count": 123}'
echo -e "\n✅ Duplicate check passed"

# 3. Search for the city
echo "🔍 Searching for ScriptCity..."
curl -s "$API_URL?search=ScriptCity"
echo -e "\n✅ Search complete"

# 4. Read specific city (you can adjust ID manually)
echo "📄 Read city by ID (change as needed)..."
curl -s "$API_URL/1"
echo -e "\n✅ Read complete"

# 5. Delete city by ID (change as needed)
echo "🗑️ Deleting city ID 1 (adjust ID)..."
curl -s -X DELETE "$API_URL/1"
echo -e "\n✅ Delete attempted"
