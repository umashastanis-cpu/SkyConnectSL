"""
Training Script for SkyConnect AI Knowledge Base
Run this to embed all data into ChromaDB
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.ai.embeddings import KnowledgeBaseTrainer


async def main():
    """Main training function"""
    print("🤖 SkyConnect AI Knowledge Base Training")
    print("=" * 60)
    print()
    
    # Initialize trainer
    print("📦 Initializing knowledge base trainer...")
    trainer = KnowledgeBaseTrainer()
    print()
    
    # Train all data
    print("🚀 Starting embeddings training...")
    print()
    
    results = await trainer.train_all()
    
    print()
    print("=" * 60)
    print("🎉 Training Complete!")
    print()
    print("📊 Summary:")
    print(f"   - Listings embedded: {results['listings']}")
    print(f"   - Partners embedded: {results['partners']}")
    print(f"   - Travel guide sections: {results['travel_guide']}")
    print(f"   - Total documents: {sum(results.values())}")
    print()
    print("✅ Knowledge base is ready for AI agent!")
    print()
    print("Next steps:")
    print("1. Start the backend server: python main.py")
    print("2. Test AI chat: POST http://localhost:8000/api/chat")
    print()


if __name__ == "__main__":
    asyncio.run(main())
