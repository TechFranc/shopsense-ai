# ShopSense AI - Quick Setup Guide 🚀

## ⚡ 5-Minute Setup

### Prerequisites
✅ Python 3.10+ installed
✅ Node.js 18+ installed
✅ Gemini API key (get free at: https://makersuite.google.com/app/apikey)

---

## Step 1: Get the Code
```bash
git clone https://github.com/yourusername/shopsense-ai.git
cd shopsense-ai
```

## Step 2: Backend Setup (2 minutes)
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Run server
python -m app.main
```

✅ Backend running at http://localhost:8000

## Step 3: Frontend Setup (2 minutes)
```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

✅ Frontend running at http://localhost:3000

## Step 4: Test It! (1 minute)
1. Open http://localhost:3000
2. Click "Upload Receipt"
3. Drag and drop a receipt image
4. Watch the magic happen! ✨

---

## 🔑 Getting API Keys

### Gemini API (Free - Recommended)
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Paste in `backend/.env`:
```env
GEMINI_API_KEY=your_key_here
AI_PROVIDER=gemini
```

### OpenAI API (Alternative)
1. Go to https://platform.openai.com/api-keys
2. Create new key
3. Add to `backend/.env`:
```env
OPENAI_API_KEY=your_key_here
AI_PROVIDER=openai
```

---

## 📸 Test Receipt Samples

Don't have a receipt? Use these test images:
- [Sample Receipt 1](https://example.com/receipt1.jpg)
- [Sample Receipt 2](https://example.com/receipt2.jpg)

Or just take a photo of any receipt!

---

## ❗ Troubleshooting

### "Module not found" error?
```bash
# Backend:
pip install -r requirements.txt

# Frontend:
npm install
```

### "Port already in use"?
```bash
# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### AI not working?
1. Check your API key in `.env`
2. Make sure you have internet connection
3. Check API quota (free tier limits)

---

## 🎉 You're All Set!

Now you can:
- Upload receipts 📸
- View analytics 📊
- Get AI insights 🤖
- Track budgets 💰

**Need help?** Check the full documentation in `docs/DOCUMENTATION.md`

---

## 📦 Project Structure Quick Reference

```
shopsense-ai/
├── backend/          # Python FastAPI
│   ├── app/         # Application code
│   ├── .env         # ⚠️ Add your API keys here
│   └── requirements.txt
│
└── frontend/        # React app
    ├── src/         # Components & pages
    └── package.json
```

---

**Happy tracking! 🛍️💰**
