import Redis from "ioredis";

type MemoryCounter = {
  count: number;
  expiresAt: number;
};

const memoryCounters = new Map<string, MemoryCounter>();
let warnedRedisFallback = false;
let redisClient: Redis | null = null;
let redisEnabled = false;

function warnRedisFallback(reason: string) {
  if (warnedRedisFallback) return;
  warnedRedisFallback = true;
  console.warn(`[redis] ${reason}. Falling back to in-memory store.`);
}

function cleanupMemoryCounter(key: string) {
  const current = memoryCounters.get(key);
  if (!current) return;
  if (current.expiresAt <= Date.now()) {
    memoryCounters.delete(key);
  }
}

export function initRedis(): Redis {
  if (redisClient) return redisClient;
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    warnRedisFallback("REDIS_URL is missing");
    redisEnabled = false;
    redisClient = new Redis({
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    return redisClient;
  }

  redisClient = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });

  redisClient.on("error", (error: unknown) => {
    redisEnabled = false;
    const message = error instanceof Error ? error.message : "Unknown Redis error";
    warnRedisFallback(`Redis connection error: ${message}`);
  });

  return redisClient;
}

async function ensureRedis(): Promise<Redis | null> {
  const client = initRedis();
  try {
    if (client.status !== "ready") {
      await client.connect();
    }
    redisEnabled = true;
    return client;
  } catch (error) {
    redisEnabled = false;
    const message = error instanceof Error ? error.message : "Unknown Redis error";
    warnRedisFallback(message);
    return null;
  }
}

export const redis = initRedis();

export async function incrementCounter(
  key: string,
  ttlSeconds: number,
): Promise<{ count: number; ttlSeconds: number }> {
  const client = await ensureRedis();
  if (client && redisEnabled) {
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, ttlSeconds);
    }
    const ttl = await client.ttl(key);
    return {
      count,
      ttlSeconds: ttl > 0 ? ttl : ttlSeconds,
    };
  }

  cleanupMemoryCounter(key);
  const existing = memoryCounters.get(key);
  const now = Date.now();
  if (!existing) {
    memoryCounters.set(key, {
      count: 1,
      expiresAt: now + ttlSeconds * 1000,
    });
    return { count: 1, ttlSeconds };
  }
  existing.count += 1;
  memoryCounters.set(key, existing);
  const remaining = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000));
  return { count: existing.count, ttlSeconds: remaining };
}

export async function getCounter(key: string): Promise<number> {
  const client = await ensureRedis();
  if (client && redisEnabled) {
    const value = await client.get(key);
    return value ? Number.parseInt(value, 10) : 0;
  }
  cleanupMemoryCounter(key);
  return memoryCounters.get(key)?.count ?? 0;
}

export async function resetCounter(key: string): Promise<void> {
  const client = await ensureRedis();
  if (client && redisEnabled) {
    await client.del(key);
    return;
  }
  memoryCounters.delete(key);
}
