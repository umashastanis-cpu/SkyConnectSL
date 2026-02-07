# SkyConnect AI Backend

Backend API for SkyConnect SL travel marketplace with AI capabilities.

## Setup Instructions

### 1. Download Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **skyconnectsl-13e92**
3. Click ⚙️ → **Project settings** → **Service accounts**
4. Click **Generate new private key**
5. Save the downloaded JSON file as `serviceAccountKey.json`
6. **Move it to**: `backend/config/serviceAccountKey.json`

### 2. Install Python Dependencies

```powershell
# Navigate to backend folder
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate  # Windows PowerShell
# OR
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment

```powershell
# Copy example env file
copy .env.example .env

# Edit .env and add your Hugging Face API key
# Get free key from: https://huggingface.co/settings/tokens
```

### 4. Run the Server

```powershell
# Start development server
python main.py

# Server will run at: http://localhost:8000
```

### 5. Test Firebase Connection

Open browser and go to:
```
http://localhost:8000/api/test/firebase
```

You should see:
```json
{
  "status": "success",
  "message": "Firebase Admin SDK is working",
  "listings_count": 0
}
```

## API Endpoints

### Current (Phase 1)
- `GET /` - Health check
- `GET /api/test/firebase` - Test Firebase connection
- `GET /api/listings` - Get all listings
- `GET /api/listings/{id}` - Get single listing

### Coming Soon (Phase 3 - AI)
- `POST /api/chat` - AI conversation
- `POST /api/search` - Semantic search
- `POST /api/recommend` - Personalized recommendations

## Folder Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (create from .env.example)
├── .env.example           # Example environment configuration
├── .gitignore             # Git ignore rules
├── config/
│   ├── firebase_admin.py  # Firebase Admin SDK initialization
│   └── serviceAccountKey.json  # ⚠️ NEVER COMMIT THIS!
├── services/
│   └── firestore_service.py  # Firestore database operations
└── routes/                # API route handlers (future)
```

## Development

- **Hot reload**: Server automatically restarts on file changes
- **Logs**: Check terminal for errors and request logs
- **CORS**: Configured to allow React Native app connections

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `serviceAccountKey.json` to Git
- Keep your `.env` file private
- The `.gitignore` is configured to exclude sensitive files

## Next Steps

After backend is running:
1. Test endpoints with Postman or browser
2. Proceed to Phase 2: ChromaDB setup
3. Phase 3: Add Hugging Face AI integration
