# 🏛️ Centaur SRE

A modern Next.js application for Site Reliability Engineering operations, featuring an AI-powered chat interface with Llama-4-Maverick-17B-128E-Instruct-FP8 API integration, supporting both text and image analysis for comprehensive system monitoring and incident response.

## Features

- 🎨 Modern, responsive chat UI built with Tailwind CSS
- 🔄 Real-time conversation with Llama API for SRE tasks
- 🖼️ **Image upload and analysis** - Drag & drop or click to upload system diagrams, charts, and screenshots
- 👁️ **Vision capabilities** - Ask questions about uploaded system visualizations and monitoring dashboards
- 📊 Display API metrics (tokens used, etc.)
- ⚡ Fast API responses with proper error handling for critical SRE operations
- 🛡️ Environment variable security for API keys
- 📱 Mobile-friendly responsive design for on-call engineers
- 🔍 **AI Investigation** - Intelligent analysis for incident response
- 📈 **Datadog Integration** - Monitor system health and performance
- ⚙️ **System Integrations** - Connect with various SRE tools and platforms

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your environment variables:**
   The `.env.local` file should already contain your API key:
   ```
   LLAMA_API_KEY=????
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Text Messages
1. Type your message in the text area at the bottom
2. Press Enter or click "Send" to send your message
3. Watch Llama respond in real-time

### Image Analysis
1. Drag and drop an image into the upload area, or click to select a file
2. Add an optional text question about the image
3. Click "Send" to get Llama's analysis of the image
4. View API metrics (token usage, etc.) below each response

### Supported Image Formats
- PNG, JPG, JPEG, GIF
- Maximum file size: 10MB
- Images are automatically converted to base64 format

## API Endpoints

### POST `/api/chat`

Send a message and/or image to the Llama API.

**Request Body (Text only):**
```json
{
  "message": "Your message to Llama"
}
```

**Request Body (Image only):**
```json
{
  "image": "base64-encoded-image-data"
}
```

**Request Body (Text + Image):**
```json
{
  "message": "What does this image show?",
  "image": "base64-encoded-image-data"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Llama's response",
  "metrics": [
    {
      "metric": "num_completion_tokens",
      "value": 50,
      "unit": "tokens"
    }
  ],
  "id": "response-id"
}
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Llama API endpoint (text + vision)
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main chat interface with image upload
└── types/
    └── llama.ts                  # TypeScript types for Llama API
```

## Environment Variables

- `LLAMA_API_KEY`: Your Llama API key (required)

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **API:** Llama-4-Maverick-17B-128E-Instruct-FP8 (Vision Model)

## API Configuration

The app is configured to use:
- **API Endpoint:** `https://api.llama.com/v1/chat/completions`
- **Model:** `Llama-4-Maverick-17B-128E-Instruct-FP8`
- **Authentication:** Bearer token
- **Vision Support:** Base64 image encoding with data URLs

## Image Processing

Images are processed as follows:
1. Client-side conversion to base64 format
2. Automatic data URL formatting (`data:image/jpeg;base64,{base64data}`)
3. Content array structure with both text and image content types
4. Server-side validation and API forwarding

## Error Handling

The application includes comprehensive error handling for:
- Network connectivity issues
- API authentication errors
- Invalid image formats
- File size limitations (10MB max)
- Invalid responses
- Rate limiting
- Server errors

## Development

To extend the application:

1. **Add new API endpoints:** Create files in `src/app/api/`
2. **Modify the UI:** Edit `src/app/page.tsx`
3. **Add types:** Update `src/types/llama.ts`
4. **Style changes:** Use Tailwind classes or modify `src/app/globals.css`

### Image Upload Features
- Drag and drop support
- File type validation
- Size limitations
- Base64 conversion
- Preview functionality
- Remove/cancel options

## Deployment

This is a standard Next.js application that can be deployed to:
- Vercel (recommended)
- Netlify
- Railway
- Any Node.js hosting platform

Remember to set your environment variables in your deployment platform.

## Example Use Cases

- **Image Description:** Upload an image and ask "What does this image contain?"
- **Object Detection:** "What objects can you see in this picture?"
- **Text Recognition:** "Can you read any text in this image?"
- **Scene Analysis:** "Describe the setting and mood of this photo"
- **Technical Analysis:** Upload diagrams, charts, or screenshots for analysis

## License

MIT License
