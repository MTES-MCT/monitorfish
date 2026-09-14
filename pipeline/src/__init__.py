import pandas as pd

# Opt in to pandas' future behavior now: `.fillna`/`.ffill`/`.bfill` stop silently
# downcasting object-dtype columns. Call sites that rely on the downcast (e.g.
# `.fillna(False)` on a boolean-ish object column) must cast explicitly afterwards.
pd.set_option("future.no_silent_downcasting", True)
