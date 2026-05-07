from __future__ import annotations

from pathlib import Path

import pandas as pd

from common import DERIVED_DIR, RAW_DIR, SAMPLES_DIR, ensure_dirs, read_csv


SAMPLE_SPECS = [
    (RAW_DIR / "rofo_buildings.csv", "rofo_buildings_random_100.csv", 101),
    (RAW_DIR / "rofo_listings.csv", "rofo_listings_random_100.csv", 102),
    (RAW_DIR / "rofo_leads.csv", "rofo_leads_random_100.csv", 103),
    (DERIVED_DIR / "neighborhoods_from_legacy.csv", "neighborhoods_random_100.csv", 104),
    (DERIVED_DIR / "cities_from_legacy.csv", "cities_random_100.csv", 105),
]


def write_sample(input_path: Path, output_name: str, random_state: int) -> int:
    df = read_csv(input_path)
    sample_size = min(100, len(df))
    sampled = df.sample(n=sample_size, random_state=random_state) if sample_size else df
    sampled.to_csv(SAMPLES_DIR / output_name, index=False)
    return sample_size


def main() -> None:
    ensure_dirs()

    for input_path, output_name, random_state in SAMPLE_SPECS:
        count = write_sample(input_path, output_name, random_state)
        print(f"Wrote {count:,} rows to data/peter/samples/{output_name}.")


if __name__ == "__main__":
    main()
