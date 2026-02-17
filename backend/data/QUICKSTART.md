# Quick Start: Repository Pattern Setup

## Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install `cachetools` which is needed for the caching layer.

## Step 2: Run Import Test

```bash
python data/test_imports.py
```

This verifies that all repository components are correctly installed without requiring Firebase.

**Expected output:**
```
Testing Repository Pattern Installation
✅ Models imported successfully
✅ Repository interface imported successfully
✅ Firestore repository imported successfully
✅ Cached repository imported successfully
✅ cachetools working correctly
✅ Model creation and serialization working
✅ Search filters working correctly
✅ ALL TESTS PASSED!
```

## Step 3: Run Full Example (Requires Firebase)

```bash
python data/example_usage.py
```

**Prerequisites:**
- Firebase project created
- `serviceAccountKey.json` in `backend/config/`
- Firestore database initialized

## Troubleshooting

### Error: "ModuleNotFoundError: No module named 'cachetools'"
**Solution:**
```bash
pip install cachetools
```

### Error: "ModuleNotFoundError: No module named 'config'"
**Solution:** Run from backend directory:
```bash
cd backend
python data/test_imports.py
```

### Error: "Firebase credentials not found"
**Solution:**
1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Generate new private key
4. Save as `backend/config/serviceAccountKey.json`

## Next Steps

After successful testing:

1. **Integrate with service layer:**
   - Update `travel_assistant_service.py`
   - Inject `DataRepository` dependency

2. **Update API endpoints:**
   - Initialize repository at startup
   - Pass to service layer

3. **Test with real queries:**
   - Run eval set
   - Measure accuracy improvement

## Files Created

```
backend/data/
├── __init__.py                 # Package exports
├── models.py                   # Data models (Listing, etc.)
├── repository.py               # Abstract interface
├── firestore_repository.py     # Real-time Firestore implementation
├── cached_repository.py        # Caching wrapper
├── test_imports.py            # Installation test (start here!)
├── example_usage.py           # Full demo (needs Firebase)
└── README.py                  # Complete documentation
```

## Quick Test Without Firebase

If you don't have Firebase configured yet, you can still test the structure:

```python
# test_structure.py
from data.models import Listing, SearchFilters

# Create a test listing
listing = Listing(
    id="1",
    title="Test Hotel",
    location="Galle",
    price=100,
    category="Accommodation",
    partner_id="partner_1"
)

# Create search filters
filters = SearchFilters(
    location="Galle",
    max_price=150,
    available_only=True
)

print(f"✅ Created listing: {listing.title}")
print(f"✅ Created filters: {filters.to_dict()}")
```

Run: `python test_structure.py`

## Support

If you encounter issues:
1. Check Python version (3.8+ required)
2. Verify virtual environment is activated
3. Run `pip list` to confirm installations
4. Check Firebase configuration
