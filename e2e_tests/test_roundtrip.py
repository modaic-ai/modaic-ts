"""End-to-end: TypeScript serialization -> Python deserialization.

The TS generator (generate.ts, via bun) emits the on-disk artifacts the Modaic
hub stores -- config.json (signature schema) + program.json (prompt/state) -- for
each named signature. These tests then deserialize them with the real Modaic SDK
and check the round-trip.

Coverage:
  - simple specs (specs.json): full pipeline + field-by-field (names/types/desc/kind)
  - all signatures: config.json is a *fixed point* of Python deserialize->reserialize
  - rich signatures (rich_signatures.ts): exact reconstructed annotations (Image/Audio/
    Scale/Enum/nullable/array/default) + required set

Run with the modaic SDK's interpreter (see run.sh):
    ../modaic/.venv/bin/python -m pytest e2e_tests -q
"""

import json
import os
import subprocess
import typing
import warnings
from pathlib import Path

import pytest

warnings.filterwarnings("ignore")

import dspy  # noqa: E402  (after warnings filter)

HERE = Path(__file__).resolve().parent
MODAIC_TS = HERE.parent  # modaic-ts repo root (where bun + src live)
SPECS = json.loads((HERE / "specs.json").read_text())

# spec "type" string -> expected reconstructed python annotation
PY_TYPE = {"string": str, "number": float, "boolean": bool, "integer": int}

SIMPLE = sorted(SPECS.keys())

# Signatures whose round-trip is currently broken *on the Python side*:
# `_deserialize_dspy_signatures` derives "required" only from a default's presence
# and uses `if default := field.get("default")`, so falsy defaults (0/""/False) are
# dropped and `.optional()` (no default) is treated as required. The TS output is
# correct; xfail tracks the gap and will xpass once the Python SDK is fixed.
XFAIL_GAPS = {"python_default_gaps"}

# Exact reconstructed signatures for the rich cases (the "check the actual object" part).
RICH_EXPECTED = {
    "rich_types": {
        "inputs": ["question", "n", "score", "flag", "photo"],
        "outputs": ["rating", "decision", "note", "tags"],
        "annotations": {
            "question": str,
            "n": int,
            "score": float,
            "flag": bool,
            "photo": dspy.Image,
            "rating": typing.Literal[1, 2, 3, 4, 5],
            "decision": typing.Literal["YES", "NO", "MAYBE"],
            "note": typing.Optional[str],
            "tags": list[str],
        },
        "required": ["question", "score", "flag", "photo", "rating", "decision", "note", "tags"],
    },
    "media_enum": {
        "inputs": ["clip", "retries"],
        "outputs": ["label"],
        "annotations": {
            "clip": dspy.Audio,
            "retries": int,
            "label": typing.Literal["ONLY"],
        },
        "required": ["clip", "label"],
    },
}


def _bun() -> str:
    return os.environ.get("BUN", "bun")


def _run_generator(name: str, out_dir: Path) -> None:
    res = subprocess.run(
        [_bun(), "run", str(HERE / "generate.ts"), name, str(out_dir)],
        cwd=MODAIC_TS,
        capture_output=True,
        text=True,
    )
    if res.returncode != 0:
        raise RuntimeError(f"generator failed for {name!r}:\nSTDOUT:\n{res.stdout}\nSTDERR:\n{res.stderr}")


def _list_names() -> list[str]:
    res = subprocess.run(
        [_bun(), "run", str(HERE / "generate.ts"), "list"],
        cwd=MODAIC_TS,
        capture_output=True,
        text=True,
    )
    if res.returncode != 0:
        raise RuntimeError(f"generator list failed:\n{res.stdout}\n{res.stderr}")
    return json.loads(res.stdout.strip().splitlines()[-1])


ALL_NAMES = _list_names()


def _config_signature(out_dir: Path) -> dict:
    return json.loads((out_dir / "config.json").read_text())["signature"]


def _all_fields(spec):
    for f in spec["inputs"]:
        yield f, "input"
    for f in spec["outputs"]:
        yield f, "output"


# --------------------------------------------------------------------------- #
# Simple specs: full pipeline + field-by-field
# --------------------------------------------------------------------------- #


@pytest.fixture(params=SIMPLE)
def simple(request, tmp_path):
    name = request.param
    out = tmp_path / name
    _run_generator(name, out)
    return name, SPECS[name], out


def test_program_json_load_state(simple):
    """TS program.json (the prompt/state) loads into a Python signature."""
    from dspy import InputField, OutputField
    from dspy.signatures import make_signature
    from modaic import Predict

    _name, spec, out = simple
    fields = {}
    for f in spec["inputs"]:
        fields[f["name"]] = (PY_TYPE[f["type"]], InputField())
    for f in spec["outputs"]:
        fields[f["name"]] = (PY_TYPE[f["type"]], OutputField())
    predict = Predict(make_signature(fields, instructions="placeholder"))

    predict.load_state(json.loads((out / "program.json").read_text()))

    assert predict.signature.instructions == spec.get("instructions")
    desc = {n: (fl.json_schema_extra or {}).get("desc") for n, fl in predict.signature.fields.items()}
    for f, _kind in _all_fields(spec):
        assert desc[f["name"]] == f.get("desc"), f["name"]


def test_full_from_precompiled(simple):
    """TS config.json + program.json deserialize via the real hub entrypoint."""
    from modaic import Predict

    _name, spec, out = simple
    sig = Predict.from_precompiled(str(out)).signature

    assert sig.instructions == spec.get("instructions")
    assert list(sig.input_fields.keys()) == [f["name"] for f in spec["inputs"]]
    assert list(sig.output_fields.keys()) == [f["name"] for f in spec["outputs"]]
    for f, kind in _all_fields(spec):
        fld = sig.fields[f["name"]]
        extra = fld.json_schema_extra or {}
        assert extra.get("desc") == f.get("desc"), f["name"]
        assert extra.get("__dspy_field_type") == kind, f["name"]
        assert fld.annotation == PY_TYPE[f["type"]], f["name"]


# --------------------------------------------------------------------------- #
# All signatures: schema is a fixed point of Python deserialize -> reserialize
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("name", ALL_NAMES)
def test_config_roundtrips_through_python(name, tmp_path, request):
    """serialize_signature(_deserialize_dspy_signatures(config)) == config.

    Proves Python fully understands the TS schema and reproduces it identically —
    covering arrays/enums/optionals/defaults/$defs/special types generically.
    """
    if name in XFAIL_GAPS:
        request.applymarker(
            pytest.mark.xfail(
                reason="Python _deserialize_dspy_signatures drops falsy defaults and "
                "ignores `required` for .optional() fields (modaic serializers.py).",
                strict=False,
            )
        )
    from modaic.serializers import _deserialize_dspy_signatures, serialize_signature

    out = tmp_path / name
    _run_generator(name, out)
    ts_sig = _config_signature(out)
    assert serialize_signature(_deserialize_dspy_signatures(ts_sig)) == ts_sig


# --------------------------------------------------------------------------- #
# Rich signatures: exact reconstructed Python objects
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("name", sorted(RICH_EXPECTED))
def test_rich_types_deserialize(name, tmp_path):
    """The TS config.json deserializes to a signature with the exact Python types."""
    from modaic import Predict
    from modaic.serializers import _deserialize_dspy_signatures

    exp = RICH_EXPECTED[name]
    out = tmp_path / name
    _run_generator(name, out)

    sig = _deserialize_dspy_signatures(_config_signature(out))

    assert list(sig.input_fields.keys()) == exp["inputs"]
    assert list(sig.output_fields.keys()) == exp["outputs"]
    ann = {n: f.annotation for n, f in sig.model_fields.items()}
    for fname, expected in exp["annotations"].items():
        assert ann[fname] == expected, f"{name}.{fname}: {ann.get(fname)} != {expected}"
    req = sorted(n for n, f in sig.model_fields.items() if f.is_required())
    assert req == sorted(exp["required"])

    # And the full hub entrypoint loads the config.json + program.json pair end-to-end.
    loaded = Predict.from_precompiled(str(out)).signature
    assert set(loaded.input_fields) | set(loaded.output_fields) == set(ann)
