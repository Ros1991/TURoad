import * as Updates from 'expo-updates';
import { Platform } from 'react-native';

export interface UpdateInfo {
  isAvailable: boolean;
  manifest?: any;
  createdAt?: Date;
  runtimeVersion?: string;
}

export interface UpdateServiceConfig {
  updateUrl?: string;
  storageUrl?: string;
  checkInterval?: number;
  enableAutoUpdate?: boolean;
}

class UpdateService {
  private config: UpdateServiceConfig;
  private updateCheckTimer?: NodeJS.Timeout;

  constructor(config: UpdateServiceConfig = {}) {
    this.config = {
      checkInterval: 30000, // 30 segundos
      enableAutoUpdate: true,
      ...config,
    };
  }

  /**
   * Inicializa o serviço de updates
   */
  async initialize(): Promise<void> {
    if (__DEV__ || !Updates.isEnabled) {
      console.log('Updates disabled in development mode');
      return;
    }

    try {
      // Verificar update na inicialização
      await this.checkForUpdate();

      // Configurar verificação periódica se habilitada
      if (this.config.enableAutoUpdate && this.config.checkInterval) {
        this.startPeriodicCheck();
      }
    } catch (error) {
      console.error('Failed to initialize UpdateService:', error);
    }
  }

  /**
   * Verifica se há updates disponíveis
   */
  async checkForUpdate(): Promise<UpdateInfo> {
    try {
      if (!Updates.isEnabled || __DEV__) {
        return { isAvailable: false };
      }

      console.log('Checking for updates...');
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        console.log('Update available:', update.manifest);
        return {
          isAvailable: true,
          manifest: update.manifest,
          createdAt: update.manifest?.createdAt ? new Date(update.manifest.createdAt) : undefined,
          runtimeVersion: update.manifest?.runtimeVersion,
        };
      }

      return { isAvailable: false };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return { isAvailable: false };
    }
  }

  /**
   * Baixa e aplica o update
   */
  async downloadAndApplyUpdate(): Promise<boolean> {
    try {
      if (!Updates.isEnabled || __DEV__) {
        return false;
      }

      console.log('Downloading update...');
      const result = await Updates.fetchUpdateAsync();

      if (result.isNew) {
        console.log('Update downloaded, reloading app...');
        await Updates.reloadAsync();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error downloading update:', error);
      return false;
    }
  }

  /**
   * Verifica e aplica update automaticamente se disponível
   */
  async checkAndApplyUpdate(): Promise<boolean> {
    const updateInfo = await this.checkForUpdate();
    
    if (updateInfo.isAvailable) {
      return await this.downloadAndApplyUpdate();
    }

    return false;
  }

  /**
   * Inicia verificação periódica de updates
   */
  startPeriodicCheck(): void {
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer);
    }

    this.updateCheckTimer = setInterval(async () => {
      await this.checkForUpdate();
    }, this.config.checkInterval);

    console.log(`Periodic update check started (interval: ${this.config.checkInterval}ms)`);
  }

  /**
   * Para a verificação periódica de updates
   */
  stopPeriodicCheck(): void {
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer);
      this.updateCheckTimer = undefined;
      console.log('Periodic update check stopped');
    }
  }

  /**
   * Obtém informações sobre o update atual
   */
  async getCurrentUpdateInfo(): Promise<any> {
    try {
      if (!Updates.isEnabled) {
        return {
          isEmbeddedLaunch: true,
          channel: 'development',
        };
      }

      return {
        isEmbeddedLaunch: Updates.isEmbeddedLaunch,
        updateId: Updates.updateId,
        channel: Updates.channel,
        runtimeVersion: Updates.runtimeVersion,
        createdAt: Updates.createdAt,
      };
    } catch (error) {
      console.error('Error getting current update info:', error);
      return null;
    }
  }

  /**
   * Configura servidor personalizado de updates
   */
  setCustomUpdateServer(updateUrl: string, storageUrl?: string): void {
    this.config.updateUrl = updateUrl;
    this.config.storageUrl = storageUrl;
    
    console.log('Custom update server configured:', {
      updateUrl: this.config.updateUrl,
      storageUrl: this.config.storageUrl,
    });
  }

  /**
   * Cleanup do serviço
   */
  destroy(): void {
    this.stopPeriodicCheck();
  }
}

// Instância singleton
export const updateService = new UpdateService({
  updateUrl: process.env.EXPO_UPDATE_URL,
  storageUrl: process.env.EXPO_STORAGE_URL,
});

export default UpdateService;
