# app/services/ai.py
import json
import logging
from typing import List, Dict, Any
from google import genai
from google.genai import types

from app.core.config import settings
from app.repositories.ai import AIRepository
from app.schemas.ai import BrandVoiceCreate, BrandVoiceResponse, GenerateRequest, GenerateResponse

logger = logging.getLogger("scale_social.services.ai")

class AIService:
    def __init__(self, repo: AIRepository):
        self.repo = repo
        # Initialize Google GenAI Client with settings keys
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = settings.GEMINI_MODEL

    async def create_brand_voice(self, user_id: str, voice_in: BrandVoiceCreate) -> BrandVoiceResponse:
        """
        Creates a brand voice profile for a user.
        """
        voice_data = voice_in.model_dump()
        voice_data["user_id"] = user_id
        db_record = self.repo.create_voice_profile(voice_data)
        return BrandVoiceResponse.model_validate(db_record)

    async def get_user_voices(self, user_id: str) -> List[BrandVoiceResponse]:
        """
        Retrieves all brand voice profiles cataloged under a user.
        """
        records = self.repo.list_voice_profiles(user_id)
        return [BrandVoiceResponse.model_validate(r) for r in records]

    async def execute_content_generation(self, user_id: str, payload: GenerateRequest) -> GenerateResponse:
        """
        Generates tailored content variants optimized against target platform networks.
        """
        # Fetch brand voice if profile ID is passed
        brand_context = ""
        if payload.brand_voice_id:
            voice_profile = self.repo.get_voice_profile(payload.brand_voice_id)
            if voice_profile and voice_profile.get("user_id") == user_id:
                brand_context = (
                    f"Brand Voice Name: {voice_profile.get('name')}\n"
                    f"Tone Characteristics: {voice_profile.get('tone_attributes')}\n"
                    f"Writing Constraints: {voice_profile.get('constraints')}\n"
                )

        system_instruction = (
            "You are an elite enterprise social media content generator. "
            f"Your job is to generate optimized copy variants for the platform: '{payload.platform}'.\n"
            f"Adhere to the following brand context if provided:\n{brand_context}\n"
            "You must return a valid JSON payload that accurately reflects the structural fields "
            "requested by the application engine parameters."
        )

        user_content_prompt = (
            f"Topic/Core Idea: {payload.topic}\n"
            f"Target Tone Guideline: {payload.tone}\n"
            f"Length Constraints: {payload.length}\n"
            f"Contextual Instructions: {payload.context_instructions or 'None'}\n"
        )

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=user_content_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                temperature=0.7
            )
        )

        try:
            parsed_json = json.loads(response.text)
            # Ensure safe payload alignment for fallback matching
            return GenerateResponse(
                primary_copy=parsed_json.get("primary_copy", response.text),
                alternative_variants=parsed_json.get("alternative_variants", []),
                hashtags=parsed_json.get("hashtags", []),
                meta_suggestions=parsed_json.get("meta_suggestions", {})
            )
        except Exception as e:
            logger.error(f"Failed parsing Gemini structural output signature: {e}")
            return GenerateResponse(
                primary_copy=response.text,
                alternative_variants=[],
                hashtags=[],
                meta_suggestions={"parsing_error": "Fallback execution engaged"}
            )

    async def refine_generated_content(self, draft: str, instruction: str) -> Dict[str, Any]:
        """
        Applies precise iterative refinements to generated copy matrices 
        using contextual formatting rules requested by the user workspace.
        """
        refine_system_instruction = (
            "You are an expert social media copy editor. Your task is to refine the provided "
            "content draft based strictly on the user's modifications or instructional critique. "
            "Maintain the exact platform tone guidelines while injecting changes. "
            "Return the output inside a valid JSON container matching the signature footprint."
        )
        
        user_prompt = f"Original Content Draft:\n{draft}\n\nRefinement Instruction:\n{instruction}"
        
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=refine_system_instruction,
                response_mime_type="application/json",
                temperature=0.3
            )
        )
        
        try:
            refined_data = json.loads(response.text)
            return refined_data
        except json.JSONDecodeError:
            return {"refined_draft": response.text.strip()}