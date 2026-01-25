import { Gemini } from 'RemoteServiceGateway.lspkg/HostedExternal/Gemini';
import { GeminiTypes } from 'RemoteServiceGateway.lspkg/HostedExternal/GoogleGenAITypes';

@component
export class NanoBananaSimple extends BaseScriptComponent {
  @input
  imageDisplay: Image;

  onStart() {
    this.generateNanoBanana();
  }

  private generateNanoBanana() {
    const request: GeminiTypes.Models.GenerateContentRequest = {
      model: 'gemini-2.0-flash-preview-image-generation',
      type: 'generateContent',
      body: {
        contents: [
          {
            parts: [
              {
                text: 'a tiny nano banana floating in space, highly detailed, 4k',
              },
            ],
            role: 'user',
          },
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      },
    };

    Gemini.models(request)
      .then((response) => {
        for (const part of response.candidates[0].content.parts) {
          if (part?.inlineData) {
            const base64Data = part.inlineData.data;
            Base64.decodeTextureAsync(
              base64Data,
              (texture) => {
                const imageMaterial = this.imageDisplay.mainMaterial.clone();
                this.imageDisplay.mainMaterial = imageMaterial;
                this.imageDisplay.mainPass.baseTex = texture;
                this.imageDisplay.sceneObject.enabled = true;
              },
              (error) => {
                print('Error decoding texture: ' + error);
              }
            );
          }
        }
      })
      .catch((error) => {
        print('Error: ' + error);
      });
  }
}
