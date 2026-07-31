/** Mirrors app/models/facebook_models.py — note the ROUTER imports from
 *  models/facebook_models.py, NOT schemas/facebook.py (which exists but
 *  is unused/stale and missing page_access_token). */

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
}

export interface FacebookComment {
  id: string;
  message: string;
  from_name?: string;
}
