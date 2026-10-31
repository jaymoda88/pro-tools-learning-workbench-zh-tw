"""Compatibility entry point: rebuild both public-safe website editions."""
from pathlib import Path
import runpy

runpy.run_path(str(Path(__file__).with_name("build_site.py")), run_name="__main__")
