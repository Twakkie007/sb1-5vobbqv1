interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private startTimes: Map<string, number> = new Map();

  startTimer(name: string) {
    this.startTimes.set(name, Date.now());
  }

  endTimer(name: string) {
    const startTime = this.startTimes.get(name);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.recordMetric(name, duration);
      this.startTimes.delete(name);
      return duration;
    }
    return 0;
  }

  recordMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
    };
    
    this.metrics.push(metric);
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log slow operations
    if (value > 1000) {
      console.warn(`Slow operation detected: ${name} took ${value}ms`);
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  getAverageTime(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + m.value, 0);
    return total / metrics.length;
  }

  clearMetrics() {
    this.metrics = [];
    this.startTimes.clear();
  }
}

export const performance = new PerformanceMonitor();

// Helper function for measuring async operations
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  performance.startTimer(name);
  try {
    const result = await operation();
    return result;
  } finally {
    performance.endTimer(name);
  }
}

// Helper function for measuring sync operations
export function measureSync<T>(
  name: string,
  operation: () => T
): T {
  performance.startTimer(name);
  try {
    const result = operation();
    return result;
  } finally {
    performance.endTimer(name);
  }
}