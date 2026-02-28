import asyncio
import time
from collections import deque
from typing import List, Optional

class KeyRotator:
    def __init__(self, api_keys: List[str], cooldown_period: int = 60):
        self.api_keys = deque(api_keys)
        self.cooldown_period = cooldown_period  # Seconds to wait after a 429
        self.key_last_used_time = {key: 0 for key in api_keys}

    def get_key(self) -> Optional[str]:
        """
        Retrieves an available API key using a round-robin approach,
        respecting cooldown periods. Returns None if no keys are configured.
        """
        if not self.api_keys:
            return None

        for _ in range(len(self.api_keys)):
            key = self.api_keys[0]
            current_time = time.time()

            if (current_time - self.key_last_used_time[key]) > self.cooldown_period:
                # Key is available, rotate it to the back for fairness
                self.api_keys.rotate(-1)
                self.key_last_used_time[key] = current_time # Mark as used
                return key
            else:
                # Key is on cooldown, try the next one
                self.api_keys.rotate(-1)
        
        # If all keys are on cooldown, wait for the first key to become available
        # This is a simplified approach for hackathon; in production, you might raise an error or wait
        earliest_available_time = float('inf')
        for key in self.key_last_used_time:
            if self.key_last_used_time[key] + self.cooldown_period < earliest_available_time:
                earliest_available_time = self.key_last_used_time[key] + self.cooldown_period
        
        wait_time = earliest_available_time - time.time()
        if wait_time > 0:
            print(f"All keys on cooldown. Waiting for {wait_time:.2f} seconds.")
            time.sleep(wait_time) # Blocking sleep, consider async sleep in a real app
            return self.get_key() # Recursively try again after waiting
        
        raise RuntimeError("No API key available after waiting.")

    def mark_key_as_used(self, key: str):
        """
        Marks a key as used, resetting its cooldown timer.
        This is implicitly called by get_key, but can be used externally if needed.
        """
        self.key_last_used_time[key] = time.time()

    def mark_key_as_rate_limited(self, key: str):
        """
        Explicitly marks a key as rate-limited, forcing it into cooldown.
        """
        self.key_last_used_time[key] = time.time() + self.cooldown_period
        print(f"Key {key[:5]}... marked as rate-limited. Will be available after cooldown.")

# Example Usage (for testing)
if __name__ == "__main__":
    test_keys = ["key1", "key2", "key3"]
    rotator = KeyRotator(test_keys, cooldown_period=2)

    print("--- Testing basic rotation ---")
    for _ in range(5):
        current_key = rotator.get_key()
        print(f"Using key: {current_key}")
        time.sleep(0.1) # Simulate API call

    print("--- Testing rate limiting ---")
    key_to_limit = rotator.get_key()
    print(f"Using key: {key_to_limit}")
    rotator.mark_key_as_rate_limited(key_to_limit)

    print("Attempting to get key after rate limit (should rotate or wait):")
    # This might block if all keys end up on cooldown quickly in a tight loop
    for _ in range(5):
        try:
            current_key = rotator.get_key()
            print(f"Using key: {current_key}")
            time.sleep(0.5)
        except RuntimeError as e:
            print(e)
            break
