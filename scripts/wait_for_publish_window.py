#!/usr/bin/env python3
"""Keep an early GitHub Actions wake-up from publishing before 07:30 Taipei."""

from __future__ import annotations

import argparse
import time
from datetime import datetime, timedelta, timezone


TAIPEI = timezone(timedelta(hours=8))
TARGET_HOUR = 7
TARGET_MINUTE = 30
MAX_WAIT_SECONDS = 20 * 60


def wait_seconds(now: datetime) -> int:
    local_now = now.astimezone(TAIPEI)
    target = local_now.replace(
        hour=TARGET_HOUR,
        minute=TARGET_MINUTE,
        second=0,
        microsecond=0,
    )
    if local_now >= target:
        return 0
    seconds = int((target - local_now).total_seconds())
    if seconds > MAX_WAIT_SECONDS:
        raise RuntimeError(
            f"Refusing to wait {seconds} seconds; scheduled wake-up is unexpectedly early"
        )
    return seconds


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--now", help="ISO timestamp used for deterministic tests")
    parser.add_argument("--no-sleep", action="store_true")
    args = parser.parse_args()

    now = datetime.fromisoformat(args.now) if args.now else datetime.now(timezone.utc)
    seconds = wait_seconds(now)
    print(f"Seconds until 07:30 Asia/Taipei: {seconds}")
    if seconds and not args.no_sleep:
        time.sleep(seconds)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
