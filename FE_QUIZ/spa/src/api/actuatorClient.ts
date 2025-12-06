const API_BASE_URL = 'https://api.duongtech.me/api/v1/admin'

export interface HealthStatus {
  status: 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN'
  components: {
    [key: string]: {
      status: 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN'
      details?: any
      description?: string
    }
  }
}

export interface MetricInfo {
  name: string
  description: string
  baseUnit?: string
  measurements: Array<{
    statistic: string
    value: number
  }>
}

export interface EnvironmentInfo {
  activeProfiles: string[]
  propertySources: Array<{
    name: string
    properties: {
      [key: string]: {
        value: any
        origin?: string
      }
    }
  }>
}

export interface LoggerInfo {
  levels: string[]
  loggers: {
    [key: string]: {
      configuredLevel?: string
      effectiveLevel: string
    }
  }
  groups: {
    [key: string]: {
      members: string[]
    }
  }
}

// Health endpoint
export const getHealthStatus = async (): Promise<HealthStatus> => {
  const response = await fetch(`${API_BASE_URL}/actuator/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return await response.json()
}

// Metrics endpoint
export const getMetrics = async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/actuator/metrics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const data = await response.json()
  return data.names || []
}

// Get specific metric
export const getMetricDetails = async (metricName: string): Promise<MetricInfo> => {
  const response = await fetch(`${API_BASE_URL}/actuator/metrics/${metricName}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return await response.json()
}

// Environment endpoint
export const getEnvironmentInfo = async (): Promise<EnvironmentInfo> => {
  const response = await fetch(`${API_BASE_URL}/actuator/env`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return await response.json()
}

// Loggers endpoint
export const getLoggersInfo = async (): Promise<LoggerInfo> => {
  const response = await fetch(`${API_BASE_URL}/actuator/loggers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return await response.json()
}

// Update logger level
export const updateLoggerLevel = async (loggerName: string, level: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/actuator/loggers/${loggerName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ configuredLevel: level }),
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}

// Get system info
export const getSystemInfo = async () => {
  try {
    const [health, metrics, env, loggers] = await Promise.allSettled([
      getHealthStatus(),
      getMetrics(),
      getEnvironmentInfo(),
      getLoggersInfo()
    ])
    
    return {
      health: health.status === 'fulfilled' ? health.value : null,
      metrics: metrics.status === 'fulfilled' ? metrics.value : [],
      environment: env.status === 'fulfilled' ? env.value : null,
      loggers: loggers.status === 'fulfilled' ? loggers.value : null
    }
  } catch (error) {
    console.error('Error fetching system info:', error)
    throw error
  }
}
