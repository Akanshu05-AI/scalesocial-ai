# app/api/v1/ai.py
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field

from app.api.deps import get_ai_service, get_scheduler_repository, get_current_user, PermissionChecker
from app.core.security import JWTUserPayload
from app.schemas.ai import BrandVoiceCreate, BrandVoiceResponse, GenerateRequest, GenerateResponse
from app.repositories.scheduler import SchedulerRepository
from app.services.ai import AIService
from app.workers.scheduler import publish_post_task

router = APIRouter()

# --- VALIDATION SCHEMAS ---

class SchedulePostRequest(BaseModel):
    platform: str = Field(..., example="x", description="Target social platform channel")
    draft: str = Field(..., example="Developing vision AI workflows at scale!", description="The main post text copy")
    scheduled_time: datetime = Field(..., description="Target ISO 8601 execution timestamp")

class QueueResponse(BaseModel):
    status: str
    post_id: str
    celery_task_id: str
    execution_delay_seconds: int

class RefineContentRequest(BaseModel):
    draft: str = Field(..., example="The original post text content goes here.", description="The current asset content draft")
    instruction: str = Field(..., example="Make it shorter, bolder, and append 3 trending hashtags.", description="Refinement critique parameters")

# --- BRAND VOICE & GENERATION ROUTES ---

@router.post("/voices", response_model=BrandVoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_voice_profile(
    payload: BrandVoiceCreate,
    current_user: JWTUserPayload = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Registers a permanent brand tone structure signature profile for generative writing contexts.
    """
    return await ai_service.create_brand_voice(user_id=current_user.sub, voice_in=payload)

@router.get("/voices", response_model=List[BrandVoiceResponse])
async def list_voice_profiles(
    current_user: JWTUserPayload = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Returns an array containing all defined brand styles cataloged under the authenticated account framework.
    """
    return await ai_service.get_user_voices(user_id=current_user.sub)

@router.post("/generate", response_model=GenerateResponse, dependencies=[Depends(PermissionChecker("ai:generate"))])
async def generate_social_post(
    payload: GenerateRequest,
    current_user: JWTUserPayload = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Generates tailored, high-performance copy assets mapped directly 
    against specific platform algorithms and user permissions.
    """
    return await ai_service.execute_content_generation(user_id=current_user.sub, payload=payload)

@router.post("/refine", status_code=status.HTTP_200_OK)
async def refine_social_copy(
    payload: RefineContentRequest,
    current_user: JWTUserPayload = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Iteratively improves and re-shapes content post models based on 
    conversational editing directives or custom tone alignments.
    """
    refined_output = await ai_service.refine_generated_content(
        draft=payload.draft, 
        instruction=payload.instruction
    )
    return {
        "status": "success",
        "refined_content": refined_output
    }

# --- BACKGROUND TASK SCHEDULING ROUTES ---

@router.post("/schedule", response_model=QueueResponse, status_code=status.HTTP_201_CREATED)
async def schedule_social_post(
    payload: SchedulePostRequest,
    current_user: JWTUserPayload = Depends(get_current_user),
    schedule_repo: SchedulerRepository = Depends(get_scheduler_repository)
):
    """
    Enqueues a social post content draft inside the database registry 
    and offloads delayed processing tasks down to Celery.
    """
    # 1. Commit metadata parameters securely to Supabase table footprints
    post_record = schedule_repo.create_scheduled_post({
        "user_id": current_user.sub,
        "platform": payload.platform,
        "draft": payload.draft,
        "scheduled_time": payload.scheduled_time.isoformat(),
        "status": "scheduled"
    })
    
    # 2. Compute timeline delay parameters relative to the execution window
    now = datetime.utcnow()
    eta_target = payload.scheduled_time.replace(tzinfo=None)
    delay_seconds = max(0, (eta_target - now).total_seconds())
    
    # 3. Disconnect process from request loop by delegating execution context down to the worker mesh
    celery_task = publish_post_task.apply_async(
        kwargs={
            "post_id": post_record["id"],
            "platform": payload.platform,
            "draft": payload.draft,
            "user_id": current_user.sub
        },
        countdown=int(delay_seconds)
    )
    
    return {
        "status": "queued",
        "post_id": post_record["id"],
        "celery_task_id": celery_task.id,
        "execution_delay_seconds": int(delay_seconds)
    }

@router.get("/schedule")
async def list_user_scheduled_queue(
    current_user: JWTUserPayload = Depends(get_current_user),
    schedule_repo: SchedulerRepository = Depends(get_scheduler_repository)
):
    """
    Returns complete chronological collection sequences for all pending/processed 
    queue timelines registered to the applicant account workspace.
    """
    return schedule_repo.list_scheduled_posts(user_id=current_user.sub)