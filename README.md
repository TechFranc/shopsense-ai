# ShopSense AI 🛍️🤖

An AI-powered shopping behavior tracker that helps you understand your spending patterns and make smarter financial decisions.

![ShopSense AI Banner](https://via.placeholder.com/1200x400/6366f1/ffffff?text=ShopSense+AI)

## 🌟 Features

- **📸 Smart Receipt Scanning**: Upload receipt images and let AI extract all data automatically
- **📊 Visual Analytics**: Beautiful glassmorphism UI with interactive charts and insights
- **🤖 AI-Powered Insights**: Get personalized recommendations based on your shopping behavior
- **💰 Budget Tracking**: Set budgets by category and track your spending
- **📈 Trend Analysis**: Identify impulse purchases and spending patterns
- **🎯 Product Recommendations**: AI suggests ways to save money and shop smarter

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **Gemini AI** - Google's AI for vision and text processing
- **OpenAI GPT-4** - Alternative AI provider
- **Pillow** - Image processing
- **PyPDF2** - PDF parsing

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling with glassmorphism design
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Axios** - API requests

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Gemini API Key (free at https://makersuite.google.com/app/apikey)
- OR OpenAI API Key

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment**:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key
# OR
OPENAI_API_KEY=your_openai_api_key

AI_PROVIDER=gemini  # or "openai"
```

5. **Run the server**:
```bash
python -m app.main
```

Backend will run at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run development server**:
```bash
npm run dev
```

Frontend will run at `http://localhost:3000`

## 📖 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Receipts
- `POST /api/receipts/upload` - Upload receipt image
- `GET /api/receipts/` - Get all receipts
- `GET /api/receipts/{id}` - Get specific receipt
- `DELETE /api/receipts/{id}` - Delete receipt

#### Analytics
- `GET /api/analytics/spending` - Get spending analytics
- `GET /api/analytics/categories` - Get category breakdown
- `GET /api/analytics/budgets` - Get budgets
- `POST /api/analytics/budgets` - Create/update budget

#### Insights
- `POST /api/insights/generate` - Generate AI insights
- `GET /api/insights/` - Get all insights
- `GET /api/insights/recommendations` - Get recommendations

## 🎨 UI Design

The app features a stunning **glassmorphism design** with:
- Gradient backgrounds (purple → blue → indigo)
- Frosted glass effect cards
- Smooth animations with Framer Motion
- Responsive layout for all devices
- Interactive charts and data visualizations

## 🧠 AI Capabilities

### Receipt Processing
- Extracts store name, date, items, prices, and categories
- Categorizes purchases automatically
- Handles various receipt formats

### Behavior Analysis
- Identifies impulse purchases
- Detects spending trends
- Finds peak shopping times
- Analyzes category preferences

### Smart Recommendations
- Suggests money-saving alternatives
- Identifies bulk-buying opportunities
- Recommends budget adjustments
- Provides category-specific tips

## 📁 Project Structure

```
shopsense-ai/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app
│   │   ├── database.py             # Database setup
│   │   ├── models/
│   │   │   ├── database.py         # SQLAlchemy models
│   │   │   └── schemas.py          # Pydantic schemas
│   │   ├── routers/
│   │   │   ├── receipts.py         # Receipt endpoints
│   │   │   ├── analytics.py        # Analytics endpoints
│   │   │   └── insights.py         # Insights endpoints
│   │   └── services/
│   │       ├── ai_service.py       # AI integration
│   │       └── analytics_service.py # Analytics logic
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.jsx      # Nav bar
│   │   │   ├── Upload.jsx          # Upload interface
│   │   │   ├── Dashboard.jsx       # Analytics dashboard
│   │   │   ├── Insights.jsx        # AI insights
│   │   │   └── Receipts.jsx        # Receipts list
│   │   ├── pages/
│   │   │   └── Home.jsx            # Landing page
│   │   ├── services/
│   │   │   └── api.js              # API client
│   │   ├── App.jsx                 # Main app
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── docs/
    └── README.md
```

## 🔧 Configuration

### Switching AI Providers

In `backend/.env`:
```env
# Use Gemini (recommended - free tier available)
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key

# OR use OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=your_key
```

### Database Configuration

By default, SQLite is used. For production, use PostgreSQL:

```env
DATABASE_URL=postgresql://user:password@localhost/shopsense
```

## 🎯 Usage Guide

1. **Upload Receipts**: Click "Upload" and drag/drop receipt images
2. **View Dashboard**: See spending analytics, charts, and category breakdowns
3. **Generate Insights**: Get AI analysis of your shopping behavior
4. **Set Budgets**: Create category budgets and track progress
5. **Get Recommendations**: Receive personalized money-saving tips

## 🚧 Future Enhancements

- [ ] Price tracking and alerts
- [ ] Email parsing for e-receipts
- [ ] Multi-user support with authentication
- [ ] Mobile app (React Native)
- [ ] Export reports (PDF/Excel)
- [ ] Integration with banking APIs
- [ ] Barcode scanning
- [ ] Shopping list suggestions

## 🐛 Known Issues

- Large images (>10MB) may take longer to process
- Some handwritten receipts may have lower accuracy
- Chart animations may lag on older devices

## 📝 License

MIT License - feel free to use this project for your portfolio or learning!

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Moringa School for the learning opportunity
- Google Gemini AI for the free API tier
- Anthropic Claude for assistance in development
- The React and FastAPI communities

## 📧 Support

For issues or questions:
1. Open an issue on GitHub
2. Email: your.email@example.com
3. Discord: YourUsername#1234

---

**Built with ❤️ for the Moringa School Generative AI Course**

⭐ Star this repo if you found it helpful!
