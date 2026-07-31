/** Mirrors app/api/v1/linkedin/schemas.py exactly. */

export interface LinkedInPostRequest {
  text: string;
  image_url?: string;
}

export interface LinkedInProfileResponse {
  linkedin_id: string;
  name: string;
  email?: string;
  profile_picture?: string;
}

export interface LinkedInPostResponse {
  success: boolean;
  post_id?: string;
  message: string;
}

export interface LinkedInDisconnectResponse {
  success: boolean;
  message: string;
}
