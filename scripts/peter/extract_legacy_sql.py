from __future__ import annotations

import pandas as pd

from common import DERIVED_DIR, RAW_DIR, ensure_dirs, parse_sql_values


CITY_COLUMNS = [
    "c_id",
    "p_id",
    "region_id",
    "state_code",
    "c_name",
    "c_description",
    "c_use_description",
    "c_craigslist_url",
    "c_glat",
    "c_glng",
    "c_featured",
    "modify_time",
]

NEIGHBORHOOD_COLUMNS = [
    "n_id",
    "c_id",
    "p_id",
    "n_name",
    "n_description",
    "n_glat",
    "n_glng",
    "n_gpoints",
    "n_gradius",
    "n_gzoom",
    "n_allowed",
    "n_summary",
]


def extract_sql_dump(input_path, table_name, columns, output_path) -> pd.DataFrame:
    sql_text = input_path.read_text(encoding="utf-8", errors="replace")
    rows = parse_sql_values(sql_text, table_name)
    df = pd.DataFrame(rows, columns=columns)
    df.to_csv(output_path, index=False)
    return df


def main() -> None:
    ensure_dirs()

    cities = extract_sql_dump(
        RAW_DIR / "cities" / "cities_v01a.sql",
        "cities",
        CITY_COLUMNS,
        DERIVED_DIR / "cities_from_legacy.csv",
    )
    neighborhoods = extract_sql_dump(
        RAW_DIR / "neighbourhoods" / "neighbourhoods_v01a.sql",
        "neighbourhoods",
        NEIGHBORHOOD_COLUMNS,
        DERIVED_DIR / "neighborhoods_from_legacy.csv",
    )

    print(f"Extracted {len(cities):,} legacy city rows.")
    print(f"Extracted {len(neighborhoods):,} legacy neighborhood rows.")


if __name__ == "__main__":
    main()
