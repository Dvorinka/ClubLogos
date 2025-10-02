# 📡 API Usage Examples

Complete examples for using the Czech Clubs Logos API.

## 🔍 Search Clubs

### Basic Search

```bash
curl "http://localhost:8080/clubs/search?q=sparta"
```

**Response:**
```json
[
  {
    "id": "22222222-3333-4444-5555-666666666666",
    "name": "AC Sparta Praha",
    "city": "Praha",
    "type": "football"
  }
]
```

### JavaScript (Fetch)

```javascript
async function searchClubs(query) {
  const response = await fetch(`http://localhost:8080/clubs/search?q=${query}`)
  const clubs = await response.json()
  console.log(clubs)
  return clubs
}

searchClubs('slavia')
```

### Python

```python
import requests

def search_clubs(query):
    response = requests.get(f"http://localhost:8080/clubs/search?q={query}")
    return response.json()

clubs = search_clubs('sparta')
print(clubs)
```

## 🏆 Get Club Details

### cURL

```bash
curl "http://localhost:8080/clubs/22222222-3333-4444-5555-666666666666"
```

### JavaScript

```javascript
async function getClub(clubId) {
  const response = await fetch(`http://localhost:8080/clubs/${clubId}`)
  const club = await response.json()
  return club
}
```

### Python

```python
def get_club(club_id):
    response = requests.get(f"http://localhost:8080/clubs/{club_id}")
    return response.json()
```

## ⬆️ Upload Logo

### cURL

```bash
curl -X POST \
  http://localhost:8080/logos/22222222-3333-4444-5555-666666666666 \
  -F "file=@sparta.svg"
```

**Response:**
```json
{
  "success": true,
  "id": "22222222-3333-4444-5555-666666666666",
  "filename": "22222222-3333-4444-5555-666666666666.svg",
  "size": 12345,
  "message": "logo uploaded successfully"
}
```

### JavaScript (FormData)

```javascript
async function uploadLogo(clubId, file) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(`http://localhost:8080/logos/${clubId}`, {
    method: 'POST',
    body: formData
  })
  
  return await response.json()
}

// Usage with file input
const fileInput = document.getElementById('fileInput')
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0]
  const clubId = '22222222-3333-4444-5555-666666666666'
  const result = await uploadLogo(clubId, file)
  console.log(result)
})
```

### Python

```python
def upload_logo(club_id, file_path):
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(
            f"http://localhost:8080/logos/{club_id}",
            files=files
        )
    return response.json()

result = upload_logo(
    '22222222-3333-4444-5555-666666666666',
    'sparta.svg'
)
print(result)
```

### PowerShell

```powershell
$clubId = "22222222-3333-4444-5555-666666666666"
$filePath = "C:\logos\sparta.svg"

$form = @{
    file = Get-Item -Path $filePath
}

Invoke-RestMethod -Uri "http://localhost:8080/logos/$clubId" `
    -Method Post `
    -Form $form
```

## 🖼️ Get Logo

### Download Logo

```bash
curl http://localhost:8080/logos/22222222-3333-4444-5555-666666666666 \
  -o sparta.svg
```

### Display in HTML

```html
<img 
  src="http://localhost:8080/logos/22222222-3333-4444-5555-666666666666" 
  alt="AC Sparta Praha"
  style="width: 100px; height: 100px;"
/>
```

### React Component

```jsx
function ClubLogo({ clubId, clubName }) {
  const logoUrl = `http://localhost:8080/logos/${clubId}`
  
  return (
    <img 
      src={logoUrl}
      alt={clubName}
      className="club-logo"
      onError={(e) => {
        e.target.src = '/fallback-logo.svg'
      }}
    />
  )
}
```

### Vue Component

```vue
<template>
  <img 
    :src="logoUrl" 
    :alt="clubName"
    class="club-logo"
    @error="handleError"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['clubId', 'clubName'])

const logoUrl = computed(() => 
  `http://localhost:8080/logos/${props.clubId}`
)

function handleError(e) {
  e.target.src = '/fallback-logo.svg'
}
</script>
```

## 📋 Get Logo with Metadata

### cURL

```bash
curl http://localhost:8080/logos/22222222-3333-4444-5555-666666666666/json
```

**Response:**
```json
{
  "id": "22222222-3333-4444-5555-666666666666",
  "club_name": "AC Sparta Praha",
  "club_city": "Praha",
  "club_type": "football",
  "logo_url": "http://localhost:8080/logos/22222222-3333-4444-5555-666666666666",
  "file_size": 12345,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

### JavaScript

```javascript
async function getLogoMetadata(clubId) {
  const response = await fetch(`http://localhost:8080/logos/${clubId}/json`)
  const metadata = await response.json()
  return metadata
}
```

## 🔄 Complete Workflow Example

### JavaScript Full Example

```javascript
class CzechClubsAPI {
  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl
  }
  
  async searchClubs(query) {
    const response = await fetch(`${this.baseUrl}/clubs/search?q=${query}`)
    return await response.json()
  }
  
  async getClub(clubId) {
    const response = await fetch(`${this.baseUrl}/clubs/${clubId}`)
    return await response.json()
  }
  
  async uploadLogo(clubId, file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${this.baseUrl}/logos/${clubId}`, {
      method: 'POST',
      body: formData
    })
    
    return await response.json()
  }
  
  getLogoUrl(clubId) {
    return `${this.baseUrl}/logos/${clubId}`
  }
  
  async getLogoMetadata(clubId) {
    const response = await fetch(`${this.baseUrl}/logos/${clubId}/json`)
    return await response.json()
  }
}

// Usage
const api = new CzechClubsAPI()

// Search and upload
async function uploadClubLogo() {
  // 1. Search for club
  const clubs = await api.searchClubs('sparta')
  const spartaClub = clubs[0]
  
  console.log('Found club:', spartaClub)
  
  // 2. Get file from user
  const fileInput = document.querySelector('input[type="file"]')
  const file = fileInput.files[0]
  
  // 3. Upload logo
  const result = await api.uploadLogo(spartaClub.id, file)
  console.log('Upload result:', result)
  
  // 4. Get logo URL
  const logoUrl = api.getLogoUrl(spartaClub.id)
  console.log('Logo URL:', logoUrl)
  
  // 5. Display logo
  document.querySelector('img').src = logoUrl
}
```

### Python Full Example

```python
import requests
from typing import List, Dict, Optional

class CzechClubsAPI:
    def __init__(self, base_url: str = "http://localhost:8080"):
        self.base_url = base_url
    
    def search_clubs(self, query: str) -> List[Dict]:
        response = requests.get(f"{self.base_url}/clubs/search?q={query}")
        response.raise_for_status()
        return response.json()
    
    def get_club(self, club_id: str) -> Dict:
        response = requests.get(f"{self.base_url}/clubs/{club_id}")
        response.raise_for_status()
        return response.json()
    
    def upload_logo(self, club_id: str, file_path: str) -> Dict:
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(
                f"{self.base_url}/logos/{club_id}",
                files=files
            )
        response.raise_for_status()
        return response.json()
    
    def get_logo_url(self, club_id: str) -> str:
        return f"{self.base_url}/logos/{club_id}"
    
    def get_logo_metadata(self, club_id: str) -> Dict:
        response = requests.get(f"{self.base_url}/logos/{club_id}/json")
        response.raise_for_status()
        return response.json()
    
    def download_logo(self, club_id: str, output_path: str):
        response = requests.get(self.get_logo_url(club_id))
        response.raise_for_status()
        
        with open(output_path, 'wb') as f:
            f.write(response.content)

# Usage
api = CzechClubsAPI()

# Search for clubs
clubs = api.search_clubs("sparta")
print(f"Found {len(clubs)} clubs")

# Get first club
sparta = clubs[0]
print(f"Club: {sparta['name']}")

# Upload logo
result = api.upload_logo(sparta['id'], 'sparta.svg')
print(f"Upload: {result['message']}")

# Download logo
api.download_logo(sparta['id'], 'downloaded_sparta.svg')
print("Logo downloaded!")

# Get metadata
metadata = api.get_logo_metadata(sparta['id'])
print(f"File size: {metadata['file_size']} bytes")
```

## 🌐 CORS Configuration

The API has CORS enabled. You can make requests from any origin in development.

For production, configure allowed origins in `backend/main.go`:

```go
r.Use(cors.New(cors.Config{
    AllowOrigins: []string{"https://yourdomain.com"},
    AllowMethods: []string{"GET", "POST", "PUT", "DELETE"},
}))
```

## 🔒 Error Handling

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request completed |
| 400 | Bad Request | Invalid UUID format |
| 404 | Not Found | Logo doesn't exist |
| 500 | Server Error | Database issue |

### Error Response Format

```json
{
  "error": "error message description"
}
```

### JavaScript Error Handling

```javascript
async function safeGetLogo(clubId) {
  try {
    const response = await fetch(`http://localhost:8080/logos/${clubId}/json`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Request failed')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to get logo:', error.message)
    return null
  }
}
```

---

**Need more examples?** Check out the [backend/README.md](backend/README.md) for additional details!
