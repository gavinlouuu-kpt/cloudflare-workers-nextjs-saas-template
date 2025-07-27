# SAM Droplet Segmentation Integration

This page integrates the SAM (Segment Anything Model) droplet segmentation functionality from the Flask application into the Next.js dashboard.

## Features

- **File Upload**: Drag and drop or click to upload images for segmentation
- **Interactive Filtering**: 
  - Pixel intensity filters (mean, min/max thresholds, texture variation)
  - Geometry filters (area, edge distance, edge-touching exclusion)
  - Real-time image analysis for optimal filter suggestions
- **Interactive Mask Display**: 
  - Hover over image to preview masks
  - Click masks to filter out false positives
  - Toggle between single-color and rainbow color modes
  - Show/hide filtered masks
- **Detailed Statistics**: 
  - Pixel statistics for each mask
  - Edge proximity analysis
  - Bounding box information
  - Stability scores

## API Configuration

The integration connects to an external SAM backend service hosted at `sam.gavinlou.com`. Configure the following:

- `NEXT_PUBLIC_SAM_API_URL`: URL of the SAM backend service (default: https://sam.gavinlou.com)
- `SAM_API_KEY`: API key for authentication (set as Cloudflare secret for security)

### Setting up the API Key

For production, set the SAM API key as a Cloudflare secret:

```bash
# Set the secret for production
wrangler secret put SAM_API_KEY

# For development, you can set it as an environment variable
# Contact the service maintainer for the appropriate API key
export SAM_API_KEY="your-sam-api-key"
```

The API key is kept secure on the server side and never exposed to the client.

### External Service

The SAM droplet segmentation service is hosted externally at `https://sam.gavinlou.com` and provides the same Flask API endpoints as the original local service.

## Backend Requirements

This frontend connects to an externally hosted SAM Flask backend service at `sam.gavinlou.com`. The Next.js API routes act as a secure proxy to the backend:

**SAM Flask Backend Endpoints:**
- `POST /segment_file`: Process uploaded files and generate masks
- `POST /analyze_image`: Analyze image statistics for filter optimization
- `GET /health`: Health check endpoint

**Next.js API Routes (Secure Proxy):**
- `POST /api/sam/segment`: Proxies to SAM `/segment_file` with secure API key
- `POST /api/sam/analyze`: Proxies to SAM `/analyze_image` with secure API key  
- `GET /api/sam/health`: Proxies to SAM `/health` endpoint

## Components

- `page.tsx`: Server component with page header and metadata
- `sam-droplet-client.tsx`: Main client component with all functionality
- `/api/sam/segment/route.ts`: API route for secure image segmentation
- `/api/sam/analyze/route.ts`: API route for secure image analysis
- `/api/sam/health/route.ts`: API route for health checks
- Interactive canvas overlay system for mask visualization
- Comprehensive filter panel with tabs for different filter types

## Usage

The SAM service is hosted externally at `sam.gavinlou.com`, so no local setup is required. Simply:

1. Navigate to `/dashboard/sam-droplet` in your Next.js app
2. Upload an image using drag-and-drop or file selection
3. Optionally run image analysis to get filter suggestions
4. Configure filters as needed
5. Click "Generate Masks" to process the image
6. Interact with the results:
   - Hover over the image to preview individual masks
   - Click masks to filter them out
   - Toggle overlay visibility and color modes
   - View detailed statistics for each mask

## Technologies Used

- React with TypeScript
- Shadcn UI components
- HTML5 Canvas for interactive overlays
- Sonner for toast notifications
- Lucide React icons 