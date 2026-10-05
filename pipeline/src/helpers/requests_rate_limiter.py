import time

import requests


class RateLimitedSession:
    def __init__(self, requests_per_second=4, max_retries=6):
        self.interval = 1.0 / requests_per_second
        self.max_retries = max_retries
        self.next_request = 0.0
        self.session = requests.Session()
        self.logger = None

    def get(self, url, **kwargs):
        for attempt in range(self.max_retries + 1):
            # Rate limiting
            now = time.monotonic()
            wait = self.next_request - now

            if wait > 0:
                time.sleep(wait)

            self.next_request = time.monotonic() + self.interval

            response = self.session.get(url, **kwargs)

            if response.status_code != 429:  # Too many requests error
                return response

            # Retry-After, if the API ever provides it
            retry_after = response.headers.get("Retry-After")

            if retry_after:
                delay = float(retry_after)
            else:
                # Exponential backoff
                delay = min(60, 2**attempt)

            if self.logger:
                self.logger.info(
                    f"Too many requests error - retrying in {delay:.2f} seconds"
                )
            time.sleep(delay)

        raise RuntimeError(f"API still returning 429 after {self.max_retries} retries")
