/**
 * Performance monitoring utilities for React Native
 * Tracks app performance metrics and memory usage
 */

import React from 'react';
import { logger } from './logger';

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  timestamp: number;
}

export interface TimingData {
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private timers: Map<string, TimingData> = new Map();
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 100; // Keep last 100 metrics

  /**
   * Start timing an operation
   */
  startTimer(operationName: string): void {
    this.timers.set(operationName, {
      startTime: Date.now(),
    });
  }

  /**
   * End timing an operation and return duration
   */
  endTimer(operationName: string): number | null {
    const timer = this.timers.get(operationName);
    if (!timer) {
      logger.warn(`Timer ${operationName} not found`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - timer.startTime;
    
    timer.endTime = endTime;
    timer.duration = duration;

    // Log slow operations (> 1000ms)
    if (duration > 1000) {
      logger.warn(`Slow operation detected: ${operationName} took ${duration}ms`);
    }

    return duration;
  }

  /**
   * Measure the performance of a function
   */
  async measureAsync<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    this.startTimer(operationName);
    try {
      const result = await operation();
      const duration = this.endTimer(operationName);
      logger.debug(`Operation ${operationName} completed in ${duration}ms`);
      return result;
    } catch (error) {
      this.endTimer(operationName);
      logger.error(`Operation ${operationName} failed`, error);
      throw error;
    }
  }

  /**
   * Measure the performance of a synchronous function
   */
  measure<T>(operationName: string, operation: () => T): T {
    this.startTimer(operationName);
    try {
      const result = operation();
      const duration = this.endTimer(operationName);
      logger.debug(`Operation ${operationName} completed in ${duration}ms`);
      return result;
    } catch (error) {
      this.endTimer(operationName);
      logger.error(`Operation ${operationName} failed`, error);
      throw error;
    }
  }

  /**
   * Record render performance metrics
   */
  recordRenderMetrics(componentName: string, renderTime: number): void {
    const metric: PerformanceMetrics = {
      renderTime,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);

    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow renders (> 16ms = below 60fps)
    if (renderTime > 16) {
      logger.warn(`Slow render detected: ${componentName} took ${renderTime}ms`);
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageRenderTime: number;
    slowRenders: number;
    totalMetrics: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averageRenderTime: 0,
        slowRenders: 0,
        totalMetrics: 0,
      };
    }

    const totalRenderTime = this.metrics.reduce(
      (sum, metric) => sum + metric.renderTime,
      0
    );
    const averageRenderTime = totalRenderTime / this.metrics.length;
    const slowRenders = this.metrics.filter(metric => metric.renderTime > 16).length;

    return {
      averageRenderTime: Math.round(averageRenderTime * 100) / 100,
      slowRenders,
      totalMetrics: this.metrics.length,
    };
  }

  /**
   * Clear all metrics and timers
   */
  clear(): void {
    this.timers.clear();
    this.metrics = [];
  }

  /**
   * Memory usage tracking (simplified for React Native)
   */
  trackMemoryUsage(): void {
    if (__DEV__) {
      // In development, log memory warnings if available
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        logger.debug('Memory usage:', {
          used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
          total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
          limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
        });
      }
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for measuring component render performance
 */
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = Date.now();

  React.useEffect(() => {
    const renderTime = Date.now() - startTime;
    performanceMonitor.recordRenderMetrics(componentName, renderTime);
  });

  return {
    startTimer: (operationName: string) => 
      performanceMonitor.startTimer(`${componentName}.${operationName}`),
    endTimer: (operationName: string) => 
      performanceMonitor.endTimer(`${componentName}.${operationName}`),
    measure: performanceMonitor.measure.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
  };
};

export default performanceMonitor;