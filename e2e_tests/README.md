# e2e_tests — TypeScript serialization → Python deserialization

Proves that artifacts serialized by `@modaic/modaic-ts` are deserialized
correctly by the Python Modaic SDK (the same path the hub uses).

## How it works

[`generate.ts`](./generate.ts) (run via `bun`) builds a `Signature` and writes the
hub artifacts — `config.json` (schema) + `program.json` (prompt/state) — into a
temp dir, using the package's real `serializeSignatureToConfig` / `buildProgramJson`.
[`test_roundtrip.py`](./test_roundtrip.py) then deserializes them with the real SDK.

Signatures come from two sources:

- [`specs.json`](./specs.json) — simple specs (`string` / `number` / `boolean` fields).
- [`rich_signatures.ts`](./rich_signatures.ts) — special types (`Image`/`Audio`/`Scale`/
  `Enum`), defaults, nullables, arrays.

## Checks

- `test_program_json_load_state` (simple) — TS `program.json` loads into a Python
  signature via `load_state`; verifies instructions + field descriptions.
- `test_full_from_precompiled` (simple) — `config.json` + `program.json` load via
  `modaic.Predict.from_precompiled`; verifies field names, types, descriptions, kind.
- `test_config_roundtrips_through_python` (**all** signatures) — asserts the TS
  schema is a *fixed point* of Python's deserialize→reserialize
  (`serialize_signature(_deserialize_dspy_signatures(cfg)) == cfg`). Covers
  arrays/enums/optionals/defaults/`$defs`/special types generically.
- `test_rich_types_deserialize` (rich) — asserts the exact reconstructed Python
  annotations (`dspy.Image`/`dspy.Audio`, `Literal[...]`, `Optional[str]`,
  `list[str]`, …) and the `required` set.

## Known gap (xfail)

`python_default_gaps` is **xfail**: Python's `_deserialize_dspy_signatures` derives
`required` only from a default's presence and uses `if default := field.get("default")`,
so a **falsy default** (`0` / `""` / `false`) is dropped and a plain `.optional()`
(no default) is treated as required. The TS serialization is correct — this xfail
tracks the Python-side bug and will **xpass** (alert) once it's fixed
(`if (default := field.get("default")) is not None:` + honor the `required` array).

## Run

```bash
./e2e_tests/run.sh            # or: ./e2e_tests/run.sh -q -v
```

Requires `bun` on PATH and a Python with the modaic SDK installed. Defaults to the
sibling repo's venv (`../modaic/.venv/bin/python`); override with
`MODAIC_PYTHON=/path/to/python` (or `BUN=/path/to/bun`).

## Adding a case

- Simple field types → add an entry to `specs.json` (`type` ∈ `string`/`number`/`boolean`).
- Special types / defaults / arrays / nullables → add a `Signature` to
  `rich_signatures.ts`, and (optionally) its expected annotations to
  `RICH_EXPECTED` in `test_roundtrip.py`.

Both the generator and the fixed-point test pick up new names automatically (the
generator's `list` command is the single source of truth for the matrix).
