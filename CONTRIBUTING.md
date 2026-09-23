# Contributing

Install dependencies and run the checks:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm pack --dry-run
```

New endpoint methods need mocked request-shape coverage. Runtime code must use
only the HTTP API and must not invoke Git, subprocesses, or filesystem APIs.
