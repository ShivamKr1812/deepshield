import redis
import logging
from app.core.config import settings

logger = logging.getLogger("cache")

class InMemoryCache:
    def __init__(self):
        self._store = {}
    
    def get(self, key: str):
        return self._store.get(key)
    
    def set(self, key: str, value: str, ex: int = None):
        self._store[key] = value
        # Simple expiration bypass for local run
        return True
        
    def delete(self, key: str):
        if key in self._store:
            del self._store[key]
        return True
        
    def ping(self):
        return True

try:
    cache = redis.Redis.from_url(
        settings.REDIS_URL, 
        socket_connect_timeout=2, 
        decode_responses=True
    )
    cache.ping()
    logger.info("Connected to Redis cache successfully.")
except Exception:
    logger.warning("Redis is not available. Falling back to in-memory Cache.")
    cache = InMemoryCache()
