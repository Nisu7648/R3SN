# R3SN - Revolutionary Self-Sustaining Network

**The most advanced AI automation platform with 170+ integrations, all FREE when you sign in!**

## 🚀 Quick Start

### Deploy to Render (Recommended)

1. Fork this repository
2. Connect to Render
3. Deploy automatically with `render.yaml`
4. Set environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Auto-generated
   - `ENCRYPTION_KEY` - Auto-generated

### Local Development

```bash
# Install dependencies
npm install

# Start server
npm start

# Development mode
npm run dev
```

## 📦 Integrations (170+)

### 🆕 NEW: 7 Premium FREE Apps (Sign in to R3SN = Everything FREE!)

1. **Hugging Face Inference FREE** 🤗
   - 100,000+ AI models
   - 12 actions: Text gen, image gen, translation, summarization, Q&A, sentiment, classification, embeddings, TTS, ASR, object detection
   - Location: `backend/integrations/huggingface-inference-free/`

2. **Stability AI FREE** 🎨
   - Stable Diffusion image generation
   - 4 actions: Text-to-image, image-to-image, upscale, list engines
   - Location: `backend/integrations/stability-ai-free/`

3. **ElevenLabs FREE** 🎙️
   - Voice synthesis & cloning
   - 5 actions: Text-to-speech, get voices, get voice, user info, history
   - Location: `backend/integrations/elevenlabs-free/`

4. **Mistral AI FREE** 🌊
   - Open-source LLM
   - 3 actions: Chat completion, embeddings, list models
   - Location: `backend/integrations/mistral-ai-free/`

5. **Cohere AI FREE** 🧠
   - NLP & LLM platform
   - 7 actions: Generate, chat, embed, classify, summarize, rerank, detect language
   - Location: `backend/integrations/cohere-ai-free/`

6. **Perplexity AI FREE** 🔍
   - AI-powered search with citations
   - 2 actions: Chat, search
   - Location: `backend/integrations/perplexity-ai-free/`

7. **Dify AI FREE** 🚀
   - LLM application platform
   - 6 actions: Chat messages, completions, feedback, conversations, messages, upload files
   - Location: `backend/integrations/dify-ai-free/`

### Other Premium Integrations

- **Groq AI FREE** ⚡ - Ultra-fast LLM inference
- **AWS Free Tier** ☁️ - Cloud services
- **Azure Free Tier** 🔷 - Microsoft cloud
- **GCP Free Tier** 🌐 - Google cloud
- **Cloudflare Workers FREE** 🔥 - Edge computing
- **Vercel Hosting FREE** ▲ - Frontend hosting
- **Railway Deploy FREE** 🚂 - Backend hosting
- **Neon Database FREE** 🐘 - Serverless Postgres
- **Upstash Redis FREE** 📦 - Serverless Redis
- **Clerk Auth FREE** 🔐 - Authentication
- **Resend Email FREE** 📧 - Email API
- **Trigger.dev FREE** ⚡ - Background jobs

And 150+ more integrations including:
- Stripe, PayPal, Square (Payments)
- Slack, Discord, Telegram (Communication)
- GitHub, GitLab, Bitbucket (Development)
- Google Workspace, Microsoft 365 (Productivity)
- Shopify, WooCommerce, BigCommerce (E-commerce)
- And many more...

## 🏗️ Architecture

```
R3SN/
├── backend/
│   ├── integrations/          # 170+ integrations
│   │   ├── huggingface-inference-free/
│   │   ├── stability-ai-free/
│   │   ├── elevenlabs-free/
│   │   ├── mistral-ai-free/
│   │   ├── cohere-ai-free/
│   │   ├── perplexity-ai-free/
│   │   ├── dify-ai-free/
│   │   └── ... (163 more)
│   ├── routes/                # API routes
│   │   └── index.js          # Master routes
│   └── server.js             # Main server
├── frontend/                  # Web interface
├── package.json              # Dependencies
└── render.yaml               # Deployment config
```

## 🔌 API Endpoints

### Health Check
```
GET /health
GET /api/health
```

### Integrations
```
GET  /api/integrations              # List all integrations
GET  /api/integrations/:id          # Get integration details
POST /api/integrations/:id/execute  # Execute integration action
```

### Example Request
```bash
curl -X POST http://localhost:10000/api/integrations/huggingface-inference-free/execute \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "apiKey": "your-api-key"
    },
    "action": "textGeneration",
    "params": {
      "text": "Hello, world!",
      "maxLength": 100
    }
  }'
```

## 🌟 Features

- ✅ **170+ Integrations** - All major platforms
- ✅ **7 NEW Premium FREE Apps** - Sign in = Everything FREE
- ✅ **Dynamic Integration Loader** - Auto-discovers integrations
- ✅ **Production Ready** - Optimized for deployment
- ✅ **Health Monitoring** - Built-in health checks
- ✅ **Error Handling** - Graceful error management
- ✅ **Scalable** - Designed for growth
- ✅ **Well Documented** - Clear API documentation

## 🔧 Environment Variables

```env
# Required
MONGODB_URI=mongodb+srv://...
PORT=10000

# Auto-generated
JWT_SECRET=auto-generated
ENCRYPTION_KEY=auto-generated

# Optional
NODE_ENV=production
```

## 📝 Adding New Integrations

1. Create integration folder: `backend/integrations/your-integration/`
2. Add `index.js` with integration class
3. Add `metadata.json` with integration details
4. Create route file: `backend/routes/your-integration.js`
5. Integration auto-loads on server start!

## 🚀 Deployment

### Render
- Automatic deployment with `render.yaml`
- Free tier available
- Auto-scaling enabled

### Docker
```bash
docker build -t r3sn .
docker run -p 10000:10000 r3sn
```

### Manual
```bash
npm install
npm start
```

## 📊 Status

- **Version**: 2.0.0
- **Status**: ✅ Production Ready
- **Integrations**: 170+
- **New Today**: 7 Premium FREE Apps
- **Deployment**: ✅ Fixed & Optimized

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License - See LICENSE file

## 🆘 Support

- Issues: GitHub Issues
- Email: support@r3sn.com
- Docs: https://docs.r3sn.com

---

**Built with ❤️ by R3SN Team**
