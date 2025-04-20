import axios from 'axios';

const LEAP_API_URL = process.env.NEXT_PUBLIC_LEAP_API_URL || 'http://localhost:8000';
const VIDEO_API_URL = process.env.NEXT_PUBLIC_VIDEO_API_URL || 'https://backend-intellect-1.onrender.com';

export interface AnimationRequest {
  topic: string;
  level?: string;
  email?: string;
}

export interface AnimationResponse {
  job_id: string;
  status: string;
  created_at: string;
}

export interface StatusResponse {
  job_id: string;
  status: string;
  video_url?: string;
  created_at: string;
  completed_at?: string;
  error?: string;
  stage?: string;
  current_stage?: string;
  progress?: number;
}

export async function createAnimation(request: AnimationRequest): Promise<AnimationResponse> {
  try {
    console.log(`Making request to ${VIDEO_API_URL}/api/animations/generate with topic: ${request.topic}`);

    // First, try to wake up the service
    try {
      console.log('Attempting to wake up the backend service...');
      await axios.get(`${VIDEO_API_URL}/api/system/health`, {
        timeout: 5000 // Short timeout for health check
      });
      console.log('Wake-up request sent');
    } catch (wakeupError) {
      console.log('Wake-up request failed, but continuing with video generation');
      // Continue anyway, as the main request might still work
    }

    // Try different endpoint formats to handle potential API changes
    let response;
    try {
      // First try the animations/generate endpoint
      response = await axios.post(`${VIDEO_API_URL}/api/animations/generate`, {
      prompt: request.topic,
      level: request.level || 'normal',
      email: request.email || 'anonymous@example.com' // Add a default email if not provided
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Add a long timeout to handle Render free tier cold starts
      timeout: 180000 // 180 seconds (3 minutes)
    });
    } catch (firstEndpointError) {
      console.log('First endpoint attempt failed, trying alternative endpoint format...');
      try {
        // Try the animation endpoint (without 's')
        response = await axios.post(`${VIDEO_API_URL}/api/animation/generate`, {
          prompt: request.topic,
          level: request.level || 'normal',
          email: request.email || 'anonymous@example.com'
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 180000
        });
      } catch (secondEndpointError) {
        console.log('Second endpoint attempt failed, trying direct animation endpoint...');
        // Try the direct animation endpoint
        response = await axios.post(`${VIDEO_API_URL}/api/animation`, {
          topic: request.topic,
          email: request.email || 'anonymous@example.com'
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 180000
        });
      }
    }

    console.log('Animation API response status:', response.status);
    console.log('Animation API response data:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error generating animation:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });

      // Provide more specific error information
      if (error.response?.status === 500) {
        throw new Error('The video generation service encountered an internal error. This might be because the service is still starting up. Please try again in a few minutes.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('The request to the video generation service timed out. The free tier service might be taking longer than expected to start up. Please try again in a few minutes.');
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error('Could not connect to the video generation service. The service might be offline or still starting up. Please try again in a few minutes.');
      }
    }
    throw error;
  }
}

export async function getAnimationStatus(jobId: string): Promise<StatusResponse> {
  // Maximum number of retries for 500 errors
  const maxRetries = 3;
  let retryCount = 0;
  let lastError: any = null;

  while (retryCount < maxRetries) {
    try {
      console.log(`Checking status for job ${jobId} at ${VIDEO_API_URL}/api/animations/status/${jobId} (Attempt ${retryCount + 1}/${maxRetries})`);

      // First, try to wake up the service if this isn't the first attempt
      if (retryCount > 0) {
        try {
          console.log('Attempting to wake up the backend service before status check...');
          await axios.get(`${VIDEO_API_URL}/api/system/health`, {
            timeout: 5000 // Short timeout for health check
          });
          console.log('Wake-up request sent before status check');
          // Add a small delay to allow the service to stabilize
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (wakeupError) {
          console.log('Wake-up request failed, but continuing with status check');
        }
      }

      // Try different endpoint formats to handle potential API changes
      let response;
      try {
        // First try the animations/status endpoint
        response = await axios.get(`${VIDEO_API_URL}/api/animations/status/${jobId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          // Add a reasonable timeout for status checks
          timeout: 30000 // 30 seconds for status check
        });
      } catch (firstEndpointError) {
        console.log('First status endpoint attempt failed, trying alternative endpoint format...');
        try {
          // Try the animation/status endpoint (without 's')
          response = await axios.get(`${VIDEO_API_URL}/api/animation/status/${jobId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 30000
          });
        } catch (secondEndpointError) {
          console.log('Second status endpoint attempt failed, trying direct status endpoint...');
          // Try the direct status endpoint
          response = await axios.get(`${VIDEO_API_URL}/api/animation?jobId=${jobId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 30000
          });
        }
      }

      console.log('Status API response status:', response.status);
      console.log('Status API response data:', response.data);

      // If we get here, the request was successful
      return response.data;
    } catch (error) {
      lastError = error;
      console.error(`Error getting animation status for job ${jobId} (Attempt ${retryCount + 1}/${maxRetries}):`, error);

      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });

        // Only retry on 500 errors or network errors
        if (error.response?.status === 500 || error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          retryCount++;
          console.log(`Retrying status check in 3 seconds... (Attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retrying
          continue;
        }
      }

      // If we get here, it's not a retryable error or we've exhausted retries
      break;
    }
  }

  // If we've exhausted all retries or encountered a non-retryable error
  if (axios.isAxiosError(lastError)) {
    if (lastError.response?.status === 500) {
      throw new Error('The backend service encountered an internal error when checking job status. This might be because the service is still starting up. Please try again in a few minutes.');
    } else if (lastError.code === 'ECONNABORTED') {
      throw new Error('The request to check job status timed out. The free tier service might be taking longer than expected to respond. Please try again in a few minutes.');
    } else if (lastError.code === 'ECONNREFUSED' || lastError.message.includes('Network Error')) {
      throw new Error('Could not connect to the backend service to check job status. The service might be offline or still starting up. Please try again in a few minutes.');
    }
  }

  // For any other errors
  throw lastError;
}

export function getVideoUrl(videoUrl: string): string {
  // If the URL is already absolute, return it
  if (videoUrl.startsWith('http')) {
    return videoUrl;
  }

  // Otherwise, prepend the API URL
  return `${VIDEO_API_URL}${videoUrl}`;
}

// Export the function for use in other files
export { getVideoUrl };
