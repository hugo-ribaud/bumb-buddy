import { useCallback, useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import networkService from "./networkService";

// Queue storage key
const QUEUE_STORAGE_KEY = "bumpbuddy:syncQueue";

// Operation types
export enum OperationType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

// Entity types for sync operations
export enum EntityType {
  FOOD_ITEM = "FOOD_ITEM",
  HEALTH_LOG = "HEALTH_LOG",
  USER_PROFILE = "USER_PROFILE",
  TIMELINE = "TIMELINE",
  CONTRACTION = "CONTRACTION",
  BLOOD_PRESSURE = "BLOOD_PRESSURE",
  MOOD = "MOOD",
  SLEEP = "SLEEP",
  EXERCISE = "EXERCISE",
}

// Structure of a pending operation
export interface SyncOperation {
  id: string;
  entityType: EntityType;
  operationType: OperationType;
  entityId?: string;
  data: any;
  timestamp: string;
  retryCount: number;
  lastRetry?: string;
}

// Service for managing the sync queue
export class SyncQueueService {
  private static instance: SyncQueueService;
  private queue: SyncOperation[] = [];
  private isProcessing = false;
  private handlers: Map<EntityType, (op: SyncOperation) => Promise<boolean>> =
    new Map();
  private maxRetries = 3;
  private listeners: Set<(queue: SyncOperation[]) => void> = new Set();

  private constructor() {
    this.initialize();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SyncQueueService {
    if (!SyncQueueService.instance) {
      SyncQueueService.instance = new SyncQueueService();
    }
    return SyncQueueService.instance;
  }

  /**
   * Initialize the service
   */
  private async initialize(): Promise<void> {
    try {
      // Load queue from storage
      const storedQueue = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (storedQueue) {
        this.queue = JSON.parse(storedQueue);
        this.notifyListeners();
      }

      // Set up network status listener
      networkService.addListener(this.handleNetworkChange.bind(this));
    } catch (error) {
      console.error("Failed to initialize sync queue:", error);
    }
  }

  /**
   * Handle network status changes
   */
  private handleNetworkChange(isConnected: boolean): void {
    if (isConnected && this.queue.length > 0) {
      this.processQueue();
    }
  }

  /**
   * Register a handler for a specific entity type
   */
  public registerHandler(
    entityType: EntityType,
    handler: (op: SyncOperation) => Promise<boolean>
  ): void {
    this.handlers.set(entityType, handler);
  }

  /**
   * Add an operation to the queue
   */
  public async enqueue(
    entityType: EntityType,
    operationType: OperationType,
    data: any,
    entityId?: string
  ): Promise<string> {
    const operation: SyncOperation = {
      id: uuidv4(),
      entityType,
      operationType,
      entityId,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    // Add to queue
    this.queue.push(operation);

    // Save to storage
    await this.persistQueue();

    // Process if online
    if (networkService.isConnected()) {
      this.processQueue();
    }

    // Notify listeners
    this.notifyListeners();

    return operation.id;
  }

  /**
   * Remove an operation from the queue
   */
  public async removeFromQueue(operationId: string): Promise<void> {
    this.queue = this.queue.filter((op) => op.id !== operationId);
    await this.persistQueue();
    this.notifyListeners();
  }

  /**
   * Get the current queue
   */
  public getQueue(): SyncOperation[] {
    return [...this.queue];
  }

  /**
   * Save the queue to storage
   */
  private async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error("Failed to persist sync queue:", error);
    }
  }

  /**
   * Process all operations in the queue
   */
  public async processQueue(): Promise<void> {
    // Prevent concurrent processing
    if (this.isProcessing || !networkService.isConnected()) return;

    this.isProcessing = true;

    try {
      // Create a copy of the queue to process
      const queueToProcess = [...this.queue];

      for (const operation of queueToProcess) {
        const handler = this.handlers.get(operation.entityType);

        if (handler) {
          try {
            // Increment retry count
            operation.retryCount++;
            operation.lastRetry = new Date().toISOString();

            // Try to process the operation
            const success = await handler(operation);

            if (success) {
              // Remove from queue if successful
              this.queue = this.queue.filter((op) => op.id !== operation.id);
            } else if (operation.retryCount >= this.maxRetries) {
              // Remove from queue if max retries reached
              console.warn(
                `Operation ${operation.id} reached max retries and will be dropped`
              );
              this.queue = this.queue.filter((op) => op.id !== operation.id);
            }
          } catch (error) {
            console.error(`Error processing operation ${operation.id}:`, error);
            // Operation will remain in queue for retry
          }
        } else {
          console.warn(
            `No handler found for entity type ${operation.entityType}`
          );
          // Remove unhandled operations
          this.queue = this.queue.filter((op) => op.id !== operation.id);
        }
      }

      // Save the updated queue
      await this.persistQueue();
      this.notifyListeners();
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Add a listener for queue changes
   */
  public addListener(listener: (queue: SyncOperation[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of queue changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.queue]));
  }

  /**
   * Set maximum number of retries
   */
  public setMaxRetries(count: number): void {
    this.maxRetries = count;
  }

  /**
   * Get queue statistics
   */
  public getQueueStats(): {
    total: number;
    byEntity: Record<EntityType, number>;
  } {
    const stats = {
      total: this.queue.length,
      byEntity: Object.values(EntityType).reduce((acc, entity) => {
        acc[entity] = 0;
        return acc;
      }, {} as Record<EntityType, number>),
    };

    this.queue.forEach((op) => {
      stats.byEntity[op.entityType]++;
    });

    return stats;
  }

  /**
   * Clear all operations from the queue
   */
  public async clearQueue(): Promise<void> {
    this.queue = [];
    await this.persistQueue();
    this.notifyListeners();
  }
}

// React hook for using sync queue in components
export function useSyncQueue() {
  const [queue, setQueue] = useState<SyncOperation[]>([]);

  useEffect(() => {
    const syncQueueService = SyncQueueService.getInstance();

    // Set initial queue
    setQueue(syncQueueService.getQueue());

    // Listen for changes
    const unsubscribe = syncQueueService.addListener((updatedQueue) => {
      setQueue(updatedQueue);
    });

    return unsubscribe;
  }, []);

  return {
    queue,
    queueCount: queue.length,
    enqueue: useCallback(
      (
        entityType: EntityType,
        operationType: OperationType,
        data: any,
        entityId?: string
      ) =>
        SyncQueueService.getInstance().enqueue(
          entityType,
          operationType,
          data,
          entityId
        ),
      []
    ),
    processQueue: useCallback(
      () => SyncQueueService.getInstance().processQueue(),
      []
    ),
    getQueueStats: useCallback(
      () => SyncQueueService.getInstance().getQueueStats(),
      []
    ),
  };
}

export default SyncQueueService.getInstance();
