import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

export class AudioDurationCalculator {
  private static readonly TEMP_DIR = path.join(__dirname, '../../temp');

  /**
   * Ensure temp directory exists
   */
  private static ensureTempDir(): void {
    if (!fs.existsSync(this.TEMP_DIR)) {
      fs.mkdirSync(this.TEMP_DIR, { recursive: true });
    }
  }

  /**
   * Download audio file from URL to temporary location
   */
  private static downloadFile(url: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      const file = fs.createWriteStream(outputPath);
      const request = client.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download file: HTTP ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      });

      request.on('error', (error) => {
        fs.unlinkSync(outputPath);
        reject(error);
      });
    });
  }

  /**
   * Get audio duration from file header (fallback method)
   * This is a simplified approach for common audio formats
   */
  private static async getAudioDuration(filePath: string): Promise<number> {
    // For now, return a default duration since ffprobe is not available
    // This is a fallback - ideally you'd use a library like 'music-metadata'
    console.warn('FFprobe not available, using estimated duration');
    
    // Try to estimate based on file size (very rough approximation)
    const stats = fs.statSync(filePath);
    const fileSizeKB = stats.size / 1024;
    
    // Rough estimate: assuming 128kbps MP3 encoding
    // 128kbps = 16KB/s, so duration ≈ fileSize / 16
    const estimatedDuration = Math.round(fileSizeKB / 16);
    
    // Return between 30-300 seconds as reasonable bounds
    return Math.max(30, Math.min(300, estimatedDuration));
  }

  /**
   * Calculate audio duration from URL
   */
  public static async calculateDurationFromUrl(audioUrl: string): Promise<number> {
    if (!audioUrl || audioUrl.trim() === '') {
      throw new Error('Audio URL is required');
    }

    this.ensureTempDir();

    const fileName = `temp_audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempFilePath = path.join(this.TEMP_DIR, fileName);

    try {
      console.log(`Downloading audio from: ${audioUrl}`);
      await this.downloadFile(audioUrl, tempFilePath);

      console.log(`Calculating duration for: ${tempFilePath}`);
      const duration = await this.getAudioDuration(tempFilePath);

      console.log(`Audio duration: ${duration} seconds`);
      return duration;
    } catch (error) {
      console.error(`Error calculating audio duration:`, error);
      throw error;
    } finally {
      // Clean up temporary file
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (cleanupError) {
        console.warn(`Failed to cleanup temp file: ${tempFilePath}`, cleanupError);
      }
    }
  }

  /**
   * Extract audio URL from localized text data (Portuguese only)
   */
  public static extractAudioUrl(storyData: any): string | null {
    // Check if audio URL is provided directly
    if (storyData.audioUrl && typeof storyData.audioUrl === 'string') {
      return storyData.audioUrl.trim();
    }

    // Check if audio URL is in translations object - Portuguese only
    if (storyData.audioUrlTranslations && storyData.audioUrlTranslations.pt) {
      const ptUrl = storyData.audioUrlTranslations.pt;
      if (typeof ptUrl === 'string' && ptUrl.trim() !== '') {
        return ptUrl.trim();
      }
    }

    return null;
  }
}
