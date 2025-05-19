import NetInfo, {
  NetInfoState,
  NetInfoSubscription,
} from "@react-native-community/netinfo";
import { useCallback, useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

// Constants for storage
const CONNECTIVITY_KEY = "bumpbuddy:connectivity:status";
const LAST_ONLINE_KEY = "bumpbuddy:connectivity:lastOnline";

// Network service for managing connectivity state
export class NetworkService {
  private static instance: NetworkService;
  private unsubscribe: NetInfoSubscription | null = null;
  private currentNetState: NetInfoState | null = null;
  private listeners: Set<(isConnected: boolean) => void> = new Set();

  private constructor() {
    this.initialize();
  }

  /**
   * Initialize the network service
   */
  private async initialize() {
    // Get initial state
    const initialState = await NetInfo.fetch();
    this.currentNetState = initialState;
    this.updateConnectionStatus(initialState.isConnected ?? false);

    // Subscribe to network status changes
    this.unsubscribe = NetInfo.addEventListener((state) => {
      this.currentNetState = state;
      this.updateConnectionStatus(state.isConnected ?? false);

      // Notify all listeners about the change
      this.listeners.forEach((listener) =>
        listener(state.isConnected ?? false)
      );
    });
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  /**
   * Clean up network listeners
   */
  public cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
  }

  /**
   * Update connection status and store last online timestamp
   */
  private async updateConnectionStatus(isConnected: boolean): Promise<void> {
    try {
      // Save current connectivity status
      await AsyncStorage.setItem(CONNECTIVITY_KEY, String(isConnected));

      // If connected, update last online timestamp
      if (isConnected) {
        const now = new Date().toISOString();
        await AsyncStorage.setItem(LAST_ONLINE_KEY, now);
      }
    } catch (error) {
      console.error("Failed to update network status in storage:", error);
    }
  }

  /**
   * Check if the device is currently connected
   */
  public isConnected(): boolean {
    return this.currentNetState?.isConnected ?? false;
  }

  /**
   * Check if the connection is WiFi
   */
  public isWifi(): boolean {
    return this.currentNetState?.type === "wifi";
  }

  /**
   * Get connection details
   */
  public getConnectionInfo(): NetInfoState | null {
    return this.currentNetState;
  }

  /**
   * Register a listener for network changes
   */
  public addListener(listener: (isConnected: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get the timestamp when the device was last online
   */
  public async getLastOnlineTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(LAST_ONLINE_KEY);
    } catch (error) {
      console.error("Failed to get last online time:", error);
      return null;
    }
  }
}

// React hook for using network status in components
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and check connection
  useEffect(() => {
    const networkService = NetworkService.getInstance();

    // Set initial state
    setIsConnected(networkService.isConnected());
    setIsLoading(false);

    // Set up listener for changes
    const unsubscribe = networkService.addListener((connected) => {
      setIsConnected(connected);
    });

    // Clean up
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected,
    isWifi: useCallback(() => NetworkService.getInstance().isWifi(), []),
    isLoading,
    getLastOnlineTime: useCallback(
      () => NetworkService.getInstance().getLastOnlineTime(),
      []
    ),
  };
}

export default NetworkService.getInstance();
