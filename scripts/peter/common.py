from __future__ import annotations

import math
import re
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data" / "peter" / "raw"
DERIVED_DIR = ROOT / "data" / "peter" / "derived"
SAMPLES_DIR = ROOT / "data" / "peter" / "samples"
REPORTS_DIR = ROOT / "data" / "peter" / "reports"


def ensure_dirs() -> None:
    for directory in (DERIVED_DIR, SAMPLES_DIR, REPORTS_DIR):
        directory.mkdir(parents=True, exist_ok=True)


def read_csv(path: Path, **kwargs) -> pd.DataFrame:
    return pd.read_csv(path, low_memory=False, **kwargs)


def clean_text(value) -> str:
    if pd.isna(value):
        return ""
    return str(value).strip()


def slugify(value) -> str:
    value = clean_text(value).lower()
    value = re.sub(r"&", " and ", value)
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def normalize_city_key(city, state) -> str:
    return f"{slugify(city)}|{clean_text(state).upper()}"


def boolish_series(series: pd.Series) -> pd.Series:
    return series.fillna(0).astype(str).str.lower().isin(["1", "true", "yes"])


def numeric_series(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce").fillna(0)


def haversine_miles(lat1, lng1, lat2, lng2) -> float:
    if not all(pd.notna(v) for v in [lat1, lng1, lat2, lng2]):
        return math.inf
    if float(lat1) == 0 or float(lng1) == 0 or float(lat2) == 0 or float(lng2) == 0:
        return math.inf

    radius = 3958.8
    phi1 = math.radians(float(lat1))
    phi2 = math.radians(float(lat2))
    delta_phi = math.radians(float(lat2) - float(lat1))
    delta_lambda = math.radians(float(lng2) - float(lng1))

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    return radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def parse_sql_values(sql_text: str, table_name: str) -> list[list]:
    rows = []
    pattern = re.compile(rf"INSERT\s+INTO\s+`?{re.escape(table_name)}`?\s+VALUES\s+", re.IGNORECASE)
    pos = 0

    while True:
        match = pattern.search(sql_text, pos)
        if not match:
            break
        index = match.end()
        statement_end = find_statement_end(sql_text, index)
        rows.extend(parse_values_blob(sql_text[index:statement_end]))
        pos = statement_end + 1

    return rows


def find_statement_end(text: str, start: int) -> int:
    in_quote = False
    escaped = False

    for index in range(start, len(text)):
        char = text[index]
        if escaped:
            escaped = False
            continue
        if in_quote and char == "\\":
            escaped = True
            continue
        if char == "'":
            in_quote = not in_quote
            continue
        if char == ";" and not in_quote:
            return index

    return len(text)


def parse_values_blob(blob: str) -> list[list]:
    rows = []
    row = None
    token = ""
    in_quote = False
    escaped = False

    for char in blob:
        if row is None:
            if char == "(":
                row = []
                token = ""
            continue

        if escaped:
            token += decode_escape(char)
            escaped = False
            continue

        if in_quote and char == "\\":
            escaped = True
            continue

        if char == "'":
            in_quote = not in_quote
            continue

        if char == "," and not in_quote:
            row.append(convert_sql_value(token))
            token = ""
            continue

        if char == ")" and not in_quote:
            row.append(convert_sql_value(token))
            rows.append(row)
            row = None
            token = ""
            continue

        token += char

    return rows


def decode_escape(char: str) -> str:
    return {
        "n": "\n",
        "r": "\r",
        "t": "\t",
        "0": "\0",
        "\\": "\\",
        "'": "'",
        '"': '"',
    }.get(char, char)


def convert_sql_value(token: str):
    value = token.strip()
    if value.upper() == "NULL":
        return None
    if value == "":
        return ""
    if re.fullmatch(r"-?\d+", value):
        try:
            return int(value)
        except ValueError:
            return value
    if re.fullmatch(r"-?\d+\.\d+", value):
        try:
            return float(value)
        except ValueError:
            return value
    return value
