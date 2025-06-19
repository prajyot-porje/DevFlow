import WebContainerService from '@/services/webcontainer-service';
import { WebContainer } from '@webcontainer/api';
import { useState, useEffect } from 'react';

export const useWebContainer = () => {
  const [webContainer, setWebContainer] = useState<WebContainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initContainer = async () => {
      try {
        const service = WebContainerService.getInstance();
        const container = await service.getContainer();
        setWebContainer(container);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize WebContainer');
        console.error('WebContainer initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initContainer();
  }, []);

  return { webContainer, isLoading, error };
};