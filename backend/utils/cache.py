import functools
import time
from typing import Any, Callable, Dict, Tuple, Optional

class InMemoryCache:
    """
    A simple in-memory cache with optional TTL.
    """
    def __init__(self, default_ttl: int = 300):  # Default TTL of 5 minutes
        self._cache: Dict[Tuple, Dict[str, Any]] = {}
        self.default_ttl = default_ttl

    def get(self, key: Tuple) -> Any:
        """
        Retrieves an item from the cache. Returns None if not found or expired.
        """
        entry = self._cache.get(key)
        if entry is None:
            return None
        
        if entry.get("expires_at") is None or entry["expires_at"] > time.time():
            return entry["value"]
        
        # Item expired, remove it
        self.delete(key)
        return None

    def set(self, key: Tuple, value: Any, ttl: Optional[int] = None):
        """
        Sets an item in the cache with an optional TTL.
        """
        expires_at = time.time() + (ttl if ttl is not None else self.default_ttl)
        self._cache[key] = {"value": value, "expires_at": expires_at}

    def delete(self, key: Tuple):
        """
        Deletes an item from the cache.
        """
        self._cache.pop(key, None)

    def clear(self):
        """
        Clears the entire cache.
        """
        self._cache.clear()

    def cache_decorator(self, ttl: Optional[int] = None):
        """
        Decorator to cache function results.
        The cache key is generated from the function's arguments.
        """
        def decorator(func: Callable) -> Callable:
            @functools.wraps(func)
            async def wrapper(*args, **kwargs) -> Any:
                # Create a cache key from function name, args, and kwargs
                cache_key = (func.__name__, args, frozenset(kwargs.items()))
                
                cached_result = self.get(cache_key)
                if cached_result is not None:
                    # print(f"Cache hit for {func.__name__}") # For debugging
                    return cached_result
                
                # print(f"Cache miss for {func.__name__}") # For debugging
                result = await func(*args, **kwargs)
                self.set(cache_key, result, ttl)
                return result
            return wrapper
        return decorator

# Global cache instance for the application
app_cache = InMemoryCache()

