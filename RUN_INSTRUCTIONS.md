# 🚀 R3SN - Complete Run Instructions

## ✅ Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js >= 18.0.0 installed
- ✅ npm >= 9.0.0 installed
- ✅ Git installed
- ✅ Android Studio (for Android app)

Check versions:
```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Clone Repository
```bash
git clone https://github.com/Nisu7648/R3SN.git
cd R3SN
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Environment
```bash
cp .env.example .env
# Edit .env if needed (optional)
```

### Step 4: Start Server
```bash
npm start
```

Server will start at: **http://localhost:3000**

### Step 5: Test the Server
```bash
# In a new terminal
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "R3SN Workflow Engine is running",
  "version": "1.0.0"
}
```

---

## 🧪 Run Tests

### Comprehensive Test Suite
```bash
npm test
```

This will test:
- ✅ Health check
- ✅ All 10 core nodes
- ✅ Complex workflows
- ✅ Plugin system
- ✅ API designer
- ✅ ML insights

---

## 📦 Available Nodes

The system includes **10 core nodes**:

1. **HTTP Request Node** (`http.request`)
   - Make API calls
   - All HTTP methods
   - Headers, query params, body

2. **Data Transform Node** (`data.transform`)
   - Transform data with JavaScript
   - Full code execution

3. **Filter Node** (`data.filter`)
   - Filter data with conditions
   - AND/OR logic

4. **Web Search Node** (`web.search`) 🌐
   - **Unrestricted web search**
   - Google, Bing, DuckDuckGo
   - Full web scraping
   - **No content restrictions**

5. **AI Agent Node** (`ai.agent`) 🤖
   - **Unrestricted AI conversations**
   - **No content filtering**
   - Multiple AI models
   - **Can discuss any topic**

6. **Code Executor Node** (`code.executor`) ⚡
   - **Execute any code**
   - JavaScript, Python, Shell, Bash
   - **Full file system access**
   - **Full network access**

7. **Database Node** (`database.query`) 🗄️
   - SQL queries
   - MySQL, PostgreSQL, MongoDB, SQLite
   - Full CRUD operations

8. **Email Node** (`email.send`) 📧
   - Send emails via SMTP
   - Attachments support
   - HTML emails

9. **File Operations Node** (`file.operations`) 📁
   - Read, write, delete files
   - **Full file system access**
   - Directory operations

10. **Example Plugin Nodes**
    - Hello World
    - Math Operations

---

## 🎯 Example Workflows

### 1. Simple HTTP Request
```bash
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": {
      "nodes": [{
        "id": "1",
        "type": "http.request",
        "parameters": {
          "method": "GET",
          "url": "https://api.github.com/users/octocat"
        }
      }]
    }
  }'
```

### 2. Web Search (Unrestricted)
```bash
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": {
      "nodes": [{
        "id": "1",
        "type": "web.search",
        "parameters": {
          "searchEngine": "google",
          "query": "artificial intelligence",
          "maxResults": 10,
          "scrapeContent": true
        }
      }]
    }
  }'
```

### 3. Code Execution
```bash
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": {
      "nodes": [{
        "id": "1",
        "type": "code.executor",
        "parameters": {
          "language": "javascript",
          "code": "return { result: 10 + 20, message: \"Calculated!\" };",
          "allowFileSystem": true
        }
      }]
    }
  }'
```

### 4. Complex Multi-Node Workflow
```bash
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": {
      "nodes": [
        {
          "id": "1",
          "type": "http.request",
          "parameters": {
            "method": "GET",
            "url": "https://jsonplaceholder.typicode.com/users"
          }
        },
        {
          "id": "2",
          "type": "data.filter",
          "parameters": {
            "conditions": [{"field": "id", "operator": "lessThan", "value": 5}]
          }
        },
        {
          "id": "3",
          "type": "data.transform",
          "parameters": {
            "code": "return data.matched.map(u => ({name: u.name, email: u.email}));"
          }
        }
      ],
      "connections": [
        {"source": "1", "target": "2"},
        {"source": "2", "target": "3"}
      ]
    }
  }'
```

---

## 📱 Android App

### Open in Android Studio
1. Launch Android Studio
2. File → Open
3. Navigate to `R3SN/android/`
4. Click OK
5. Wait for Gradle sync

### Build & Run
1. Click Run button (▶️)
2. Select device/emulator
3. App installs and launches

### Configure API Endpoint
Edit `android/app/src/main/res/values/strings.xml`:
```xml
<string name="api_base_url">http://YOUR_COMPUTER_IP:3000</string>
```

Replace `YOUR_COMPUTER_IP` with your actual IP address (not localhost).

---

## 🔧 Development Mode

### With Auto-Reload
```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=3001
```

### Dependencies Installation Failed
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Node Version Issues
```bash
# Use nvm to install correct version
nvm install 18
nvm use 18
```

### Android Build Failed
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### Cannot Connect from Android
1. Use your computer's IP address (not localhost)
2. Find your IP:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` or `ip addr`
3. Update `strings.xml` with your IP
4. Ensure firewall allows port 3000

---

## 📊 API Endpoints

### Health Check
```bash
GET /health
```

### Get All Nodes
```bash
GET /api/workflows/nodes
```

### Execute Workflow
```bash
POST /api/workflows/execute
Body: { workflow, inputData }
```

### Get Execution Status
```bash
GET /api/workflows/executions/:executionId
```

### Get Execution History
```bash
GET /api/workflows/history
```

### Get Plugins
```bash
GET /api/plugins
```

### Create API
```bash
POST /api/designer/apis
Body: { name, baseUrl, endpoints }
```

### Get ML Analytics
```bash
GET /api/ml/analytics/daily
```

---

## 🎯 Features Verification

### ✅ Verify All Nodes Loaded
```bash
curl http://localhost:3000/api/workflows/nodes | jq '.data | length'
# Should return 10 or more
```

### ✅ Verify Plugin System
```bash
curl http://localhost:3000/api/plugins
# Should show example-plugin
```

### ✅ Verify ML Insights
```bash
curl http://localhost:3000/api/ml/analytics/daily
# Should return analytics data
```

---

## 🚀 Production Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start backend/src/server.js --name r3sn-engine
pm2 save
pm2 startup
```

### Using Docker
```bash
docker build -t r3sn-engine .
docker run -p 3000:3000 r3sn-engine
```

### Using Docker Compose
```bash
docker-compose up -d
```

---

## 📚 Additional Resources

- [Complete Guide](WORKFLOW_ENGINE_GUIDE.md)
- [Android Setup](ANDROID_STUDIO_READY.md)
- [Plugin Development](plugins/example-plugin/README.md)
- [API Reference](WORKFLOW_ENGINE_GUIDE.md#-rest-api)

---

## 🎉 Success Checklist

- [ ] Server starts without errors
- [ ] Health check returns success
- [ ] All 10 nodes are loaded
- [ ] Test workflow executes successfully
- [ ] Plugin system works
- [ ] Android app opens in Android Studio
- [ ] Android app builds successfully

---

## 💡 Tips

1. **Use Development Mode**: `npm run dev` for auto-reload
2. **Check Logs**: Server logs show all operations
3. **Test Incrementally**: Test each node individually first
4. **Use Postman**: Import API endpoints for easier testing
5. **Monitor Performance**: Check execution times in responses

---

## 🆘 Get Help

- **GitHub Issues**: Report bugs
- **Documentation**: Read complete guides
- **Test Script**: Run `npm test` to verify everything works

---

<div align="center">

**🎊 You're Ready to Build Amazing Workflows! 🎊**

Start with simple workflows and gradually build more complex automations.

</div>
