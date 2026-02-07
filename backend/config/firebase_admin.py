"""
Firebase Admin SDK Configuration
Initializes Firebase Admin for server-side operations
"""

import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK
def initialize_firebase():
    """
    Initialize Firebase Admin SDK with service account credentials
    Only initializes once (singleton pattern)
    """
    if not firebase_admin._apps:
        try:
            # Get credentials path from environment variable
            cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', './config/serviceAccountKey.json')
            
            # Check if file exists
            if not os.path.exists(cred_path):
                raise FileNotFoundError(
                    f"Firebase service account key not found at: {cred_path}\n"
                    f"Please download it from Firebase Console and place it in the config folder."
                )
            
            # Initialize with service account
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            
            print("✅ Firebase Admin SDK initialized successfully")
            
        except Exception as e:
            print(f"❌ Error initializing Firebase Admin SDK: {e}")
            raise
    
    return firebase_admin.get_app()

# Initialize Firestore client
def get_firestore_client():
    """
    Get Firestore database client
    """
    initialize_firebase()
    return firestore.client()

# Initialize Auth client
def get_auth_client():
    """
    Get Firebase Auth client for token verification
    """
    initialize_firebase()
    return auth

# Verify Firebase ID token (for securing API endpoints)
async def verify_token(id_token: str):
    """
    Verify Firebase ID token from client
    Returns decoded token if valid, raises exception if invalid
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid authentication token: {e}")

# Get Firestore database instance
db = None

def init_db():
    """Initialize the database connection"""
    global db
    if db is None:
        db = get_firestore_client()
    return db
