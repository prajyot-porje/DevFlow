// webcontainer-service.ts
import { WebContainer } from '@webcontainer/api';

class WebContainerService {
  private static instance: WebContainerService;
  private container: WebContainer | null = null;
  private isBooting: boolean = false;
  private bootPromise: Promise<WebContainer> | null = null;

  private constructor() {}

  public static getInstance(): WebContainerService {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService();
    }
    return WebContainerService.instance;
  }

  public async getContainer(): Promise<WebContainer> {
    // If already booted, return existing container
    if (this.container) {
      return this.container;
    }

    // If currently booting, return the existing promise
    if (this.isBooting && this.bootPromise) {
      return this.bootPromise;
    }

    // Boot new container
    this.isBooting = true;
    this.bootPromise = this.bootContainer();
    
    try {
      this.container = await this.bootPromise;
      this.isBooting = false;
      return this.container;
    } catch (error) {
      this.isBooting = false;
      this.bootPromise = null;
      throw error;
    }
  }

  private async bootContainer(): Promise<WebContainer> {
    return await WebContainer.boot();
  }

  public getContainerSync(): WebContainer | null {
    return this.container;
  }

  public isReady(): boolean {
    return this.container !== null && !this.isBooting;
  }

  // Helper method to sanitize file paths for WebContainer

    
   
}

export default WebContainerService;