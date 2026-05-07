from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCRIPTS = [
    "scripts/peter/extract_legacy_sql.py",
    "scripts/peter/create_samples.py",
    "scripts/peter/build_intelligence.py",
    "scripts/peter/generate_reports.py",
]


def main() -> None:
    for script in SCRIPTS:
        print(f"\n== {script} ==")
        subprocess.run([sys.executable, script], cwd=ROOT, check=True)


if __name__ == "__main__":
    main()
