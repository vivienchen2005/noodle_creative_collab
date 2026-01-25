import { Gemini } from 'RemoteServiceGateway.lspkg/HostedExternal/Gemini';
import { GeminiTypes } from 'RemoteServiceGateway.lspkg/HostedExternal/GoogleGenAITypes';

@component
export class NanoBananaImageGenerator extends BaseScriptComponent {
  @input
  @hint('The image component that will display the generated image')
  imageComponent: Image;

  @input
  @hint('The prompt for image generation')
  prompt: string = 'a tiny nano banana floating in space, highly detailed, 4k';

  @input
  @hint('Generate image on start')
  generateOnStart: boolean = true;

  onStart() {
    if (this.generateOnStart) {
      this.generateNanoBanana();
    }
  }

  generateNanoBanana() {
    if (!this.imageComponent) {
      print('Error: Image component not assigned');
      return;
    }

    print('Generating nano banana image...');

    const request: GeminiTypes.Models.GenerateContentRequest = {
      model: 'gemini-2.0-flash-preview-image-generation',
      type: 'generateContent',
      body: {
        contents: [
          {
            parts: [
              {
                text: this.prompt,
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
        print('Image generation response received');
        
        // Find the image data in the response
        for (const part of response.candidates[0].content.parts) {
          if (part?.inlineData) {
            const base64Data = part.inlineData.data;
            
            // Decode the base64 image data to a texture
            Base64.decodeTextureAsync(
              base64Data,
              (texture) => {
                // Clone the material to avoid modifying the original
                const imageMaterial = this.imageComponent.mainMaterial.clone();
                this.imageComponent.mainMaterial = imageMaterial;
                
                // Apply the generated texture to the image component
                this.imageComponent.mainPass.baseTex = texture;
                this.imageComponent.sceneObject.enabled = true;
                
                print('Nano banana image generated and displayed!');
              },
              (error) => {
                print('Failed to decode texture: ' + error);
              }
            );
            return; // Exit after finding the first image
          }
        }
        
        print('No image data found in response');
      })
      .catch((error) => {
        print('Error generating image: ' + error);
      });
  }
}
