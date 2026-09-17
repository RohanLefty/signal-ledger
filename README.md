# signal-ledger

A daily, append-only log of a model's theme detections and its paper-portfolio
trades, published so the dates cannot be changed afterwards.

## What is in here

| Path | Contents |
|---|---|
| `chain/<region>.jsonl` | One line per day: counts, the SHA-256 of that day's detection record, and a chain hash over every earlier day. |
| `picks/<region>/<date>.json` | Every paper trade executed that day and each book's end-of-day holdings. |
| `manifests/<date>.json` | SHA-256 of each file above for that day, chained to the previous manifest. |
| `proofs/<date>.<calendar>.ots` | OpenTimestamps proof of the manifest, anchored in Bitcoin. |

Books: `etf-core`, `single-stocks`, `suppliers`, `long-hold`, `insider-buys`.
All trades are paper trades.

## Verifying

```
node verify.mjs                 # recompute every manifest and the chain links
pip install opentimestamps-client
ots upgrade proofs/<date>.*.ots  # fetch the Bitcoin attestation once it exists (a few hours)
ots verify -d $(sha256sum manifests/<date>.json | cut -d' ' -f1) proofs/<date>.<calendar>.ots
```

A day is published once it has ended. Days before the first commit were published
retroactively; their timestamps prove existence from the first commit onward, not
from the day itself.
