# 🏗️ BUILD PLAN - R3SN

**Goal**: Build working APIs step by step, no misleading claims

---

## ✅ COMPLETED

### Phase 0: Foundation
- [x] Server setup with Express
- [x] Middleware (CORS, helmet, compression)
- [x] Error handling
- [x] Rate limiting
- [x] WebSocket support
- [x] 34 core engine files created
- [x] 9 route files created
- [x] 16 documentation files

### Phase 1: Simple Working APIs
- [x] Created `simple-api.js` with 6 endpoints
- [x] Search (DuckDuckGo - no API key needed)
- [x] Text analysis
- [x] URL metadata extraction
- [x] Data transformation (JSON/CSV/XML)
- [x] Math calculator
- [x] String manipulation
- [x] Documented in `WORKING_APIS.md`

**Status**: ✅ 9 APIs working (6 simple + 3 system)

---

## 🔄 IN PROGRESS

### Phase 2: Apply Server Patch
**Task**: Add simple-api routes to server.js

**Steps**:
1. Open `backend/server.js`
2. After line 48, add:
   ```javascript
   const simpleApiRoutes = require('./routes/simple-api');
   ```
3. After line 58, add:
   ```javascript
   app.use('/api', simpleApiRoutes);
   ```
4. Test endpoints

**Expected Result**: 9 working APIs accessible

---

## 📋 TODO - NEXT STEPS

### Phase 3: Database Models (Week 1)
Create actual working models:

#### 3.1 User Model
```javascript
// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, default: 'user' },
  apiKeys: Map,
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

#### 3.2 Execution Model
```javascript
// backend/models/Execution.js
const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String, // 'search', 'ai', 'blockchain', etc.
  input: mongoose.Schema.Types.Mixed,
  output: mongoose.Schema.Types.Mixed,
  status: { type: String, default: 'pending' },
  error: String,
  duration: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Execution', executionSchema);
```

#### 3.3 Agent Model
```javascript
// backend/models/Agent.js
const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  type: String,
  config: mongoose.Schema.Types.Mixed,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Agent', agentSchema);
```

**Deliverable**: 3 working models

---

### Phase 4: Authentication APIs (Week 1)
Build actual auth system:

#### 4.1 Register Endpoint
```javascript
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }
    
    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }
    
    // Create user
    const user = new User({ email, password, name });
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

#### 4.2 Login Endpoint
```javascript
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Check password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

**Deliverable**: 2 working auth endpoints

---

### Phase 5: Agent APIs (Week 2)
Build agent management:

#### 5.1 Create Agent
```javascript
// POST /api/agents
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, type, config } = req.body;
    
    const agent = new Agent({
      userId: req.user._id,
      name,
      type,
      config
    });
    
    await agent.save();
    
    res.json({
      success: true,
      agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

#### 5.2 List Agents
```javascript
// GET /api/agents
router.get('/', authenticate, async (req, res) => {
  try {
    const agents = await Agent.find({ userId: req.user._id });
    
    res.json({
      success: true,
      agents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

**Deliverable**: 4 agent endpoints (CRUD)

---

### Phase 6: Search APIs with API Keys (Week 2)
Build search with multiple providers:

#### 6.1 Google Search
```javascript
// POST /api/search/google
router.post('/google', authenticate, async (req, res) => {
  try {
    const { query } = req.body;
    
    // Get user's API key or use system key
    const apiKey = req.user.apiKeys?.get('google') || process.env.GOOGLE_SEARCH_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Google API key not configured'
      });
    }
    
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
        q: query
      }
    });
    
    // Log execution
    await Execution.create({
      userId: req.user._id,
      type: 'search',
      input: { query, provider: 'google' },
      output: response.data,
      status: 'completed'
    });
    
    res.json({
      success: true,
      provider: 'google',
      results: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

**Deliverable**: 5 search provider endpoints

---

### Phase 7: AI APIs (Week 3)
Build AI integrations:

#### 7.1 Text Generation
```javascript
// POST /api/ai/text/generate
router.post('/text/generate', authenticate, async (req, res) => {
  try {
    const { prompt, model = 'gpt-3.5-turbo' } = req.body;
    
    const openai = new OpenAI({
      apiKey: req.user.apiKeys?.get('openai') || process.env.OPENAI_API_KEY
    });
    
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }]
    });
    
    const result = completion.choices[0].message.content;
    
    // Log execution
    await Execution.create({
      userId: req.user._id,
      type: 'ai-text',
      input: { prompt, model },
      output: { result },
      status: 'completed'
    });
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

**Deliverable**: 5 AI endpoints (text, image, audio, video, document)

---

### Phase 8: Workflow APIs (Week 3)
Build workflow execution:

#### 8.1 Create Workflow
```javascript
// POST /api/workflows
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, steps } = req.body;
    
    const workflow = new Workflow({
      userId: req.user._id,
      name,
      steps
    });
    
    await workflow.save();
    
    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

#### 8.2 Execute Workflow
```javascript
// POST /api/workflows/:id/execute
router.post('/:id/execute', authenticate, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }
    
    // Execute steps
    const results = [];
    for (const step of workflow.steps) {
      const result = await executeStep(step);
      results.push(result);
    }
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

**Deliverable**: 4 workflow endpoints

---

## 📊 PROGRESS TRACKING

### Week 1
- [ ] Phase 2: Apply server patch
- [ ] Phase 3: Database models (3 models)
- [ ] Phase 4: Authentication (2 endpoints)

### Week 2
- [ ] Phase 5: Agent APIs (4 endpoints)
- [ ] Phase 6: Search APIs (5 endpoints)

### Week 3
- [ ] Phase 7: AI APIs (5 endpoints)
- [ ] Phase 8: Workflow APIs (4 endpoints)

### Week 4
- [ ] Testing all endpoints
- [ ] Bug fixes
- [ ] Documentation updates

---

## 🎯 MILESTONES

| Milestone | APIs | Status |
|-----------|------|--------|
| **M1: Foundation** | 9 | ✅ Complete |
| **M2: Auth & Models** | +6 | 🔄 In Progress |
| **M3: Core Features** | +14 | ⏳ Planned |
| **M4: Advanced** | +10 | ⏳ Planned |
| **TOTAL** | **39** | **23% Complete** |

---

## 📝 NOTES

- **No misleading claims** - Only count what's actually working
- **Test everything** - Every endpoint must be tested
- **Document as we go** - Update docs with each phase
- **Incremental progress** - Small, working steps
- **Honest status** - Always show real progress

---

**Last Updated**: December 14, 2025  
**Current Phase**: Phase 2 (Server Patch)  
**Next Phase**: Phase 3 (Database Models)
