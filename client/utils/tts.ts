/**
 * Text-to-Speech utility using OpenAI TTS API
 */

interface TTSOptions {
  voice?: string;
  instructions?: string;
  responseFormat?: string;
}

export async function speakText(
  text: string,
  options: TTSOptions = {}
): Promise<void> {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://my-service-prod-84243174586.us-west1.run.app";

  try {
    const response = await fetch(`${backendUrl}/api/tts/speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voice: options.voice || "coral",
        instructions: options.instructions,
        response_format: options.responseFormat || "mp3",
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS request failed: ${response.statusText}`);
    }

    // Get audio blob
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    // Play audio
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      audio.play().catch(reject);
    });
  } catch (error) {
    console.error("Error playing TTS audio:", error);
    throw error;
  }
}

export function stopSpeaking(): void {
  // Stop all audio elements
  const audioElements = document.querySelectorAll("audio");
  audioElements.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

