from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from app.services.whisper_service import get_openai_whisper_service

router = APIRouter(prefix="/api/tts", tags=["tts"])


class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "coral"
    instructions: Optional[str] = None
    response_format: Optional[str] = "mp3"


@router.post("/speech")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech using OpenAI TTS API"""
    try:
        if not request.text.strip():
            raise HTTPException(
                status_code=400,
                detail="Text cannot be empty"
            )
        
        whisper_service = get_openai_whisper_service()
        
        try:
            audio_bytes = whisper_service.text_to_speech(
                text=request.text,
                voice=request.voice or "coral",
                instructions=request.instructions,
                response_format=request.response_format or "mp3"
            )
        except Exception as e:
            # Log the full error for debugging
            import traceback
            error_details = traceback.format_exc()
            print(f"TTS Error details: {error_details}")
            raise HTTPException(
                status_code=500,
                detail=f"TTS conversion failed: {str(e)}"
            )
        
        # Determine content type based on format
        content_type_map = {
            "mp3": "audio/mpeg",
            "opus": "audio/opus",
            "aac": "audio/aac",
            "flac": "audio/flac",
            "wav": "audio/wav",
            "pcm": "audio/pcm"
        }
        content_type = content_type_map.get(request.response_format or "mp3", "audio/mpeg")
        
        return StreamingResponse(
            iter([audio_bytes]),
            media_type=content_type,
            headers={
                "Content-Disposition": f'inline; filename="speech.{request.response_format or "mp3"}"'
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Unexpected TTS Error: {error_details}")
        raise HTTPException(
            status_code=500,
            detail=f"TTS conversion failed: {str(e)}"
        )

