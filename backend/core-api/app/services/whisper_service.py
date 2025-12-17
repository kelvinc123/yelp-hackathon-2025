import os
import tempfile
import logging
from openai import OpenAI
from typing import Optional, Tuple, Any

logger = logging.getLogger(__name__)


class WhisperService:
    def __init__(
        self,
        model_name: str = "base",
        device: str = "cpu",
        compute_type: str = "int8"
    ):
        self.model_name = model_name
        self.device = device
        self.compute_type = compute_type
        self._model = None
    
    def _get_model(self) -> Any:
        if self._model is None:
            logger.info(f"Loading Whisper model '{self.model_name}' on {self.device}")
            self._model = WhisperModel(
                self.model_name,
                device=self.device,
                compute_type=self.compute_type
            )
        return self._model
    
    async def transcribe_audio(
        self,
        audio_bytes: bytes,
        language: Optional[str] = None,
        task: str = "transcribe"
    ) -> Tuple[str, str]:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(audio_bytes)
            tmp.flush()
            temp_path = tmp.name
        
        try:
            model = self._get_model()
            
            segments, info = model.transcribe(
                temp_path,
                beam_size=5,
                language=language,
                task=task
            )
            
            text = " ".join(seg.text.strip() for seg in segments)
            
            logger.info(f"Transcription completed: {len(text)} characters, language: {info.language}")
            
            return text, info.language
            
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise
            
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)


class OpenAIWhisperService:
    def __init__(self, model_name: str = "gpt-4o-mini-transcribe"):
        self.model_name = model_name
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        self.client = OpenAI(api_key=api_key)
    
    async def transcribe_audio(
        self,
        audio_bytes: bytes,
        language: Optional[str] = None,
        response_format: str = "json"
    ) -> Tuple[str, str]:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(audio_bytes)
            tmp.flush()
            temp_path = tmp.name
        
        try:
            with open(temp_path, "rb") as audio_file:
                transcription = self.client.audio.transcriptions.create(
                    model=self.model_name,
                    file=audio_file,
                    response_format=response_format,
                    language=language
                )
            
            if response_format == "json":
                text = transcription.text
                detected_language = language or "en"
            else:
                text = str(transcription)
                detected_language = language or "en"
            
            logger.info(f"OpenAI Whisper transcription completed: {len(text)} characters")
            
            return text, detected_language
            
        except Exception as e:
            logger.error(f"OpenAI Whisper transcription failed: {e}")
            raise
            
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)


_whisper_service: Optional[WhisperService] = None
_openai_whisper_service: Optional[OpenAIWhisperService] = None


def get_whisper_service() -> WhisperService:
    global _whisper_service
    if _whisper_service is None:
        _whisper_service = WhisperService()
    return _whisper_service


def get_openai_whisper_service() -> OpenAIWhisperService:
    global _openai_whisper_service
    if _openai_whisper_service is None:
        _openai_whisper_service = OpenAIWhisperService()
    return _openai_whisper_service
