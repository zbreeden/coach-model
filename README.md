# Coach Model

> **The Coach is the kick in the ass**

## 🌌 Constellation Information

- **Module Key**: `coach_model`  
- **Repository**: `coach-model`
- **Orbit**: 🧪
- **Status**: 🔥
- **Emoji**: 💪

## 🚀 Quick Start

1. **Review seeds/**: Adapt seeded data for this module
2. **Configure schemas/**: Update schema definitions as needed  
3. **Generate signals/**: Create latest.json broadcast file

## 📡 Broadcasting

This module produces a `signals/latest.json` file conforming to the constellation's broadcast schema. The Signal (📡) aggregates these across all stars.  Use new-broadcast.sh within /scripts to run a new broadast.

## 🔗 CORE SYSTEM Links

- **Hub**: [FourTwenty Analytics](https://github.com/zbreeden/FourTwentyAnalytics)
- **The Archive**: Glossary, tags, and canonical definitions pulled down nightly and distributed out for constellation harmony.
- **The Signal**: Cross-constellation broadcasting and telemetry pulled and circulated nightly to foster promotion and development.
- **The Launch**: Detailed workflows pulled in nightly to assure an aligned culture of process improvement that starts from the Barycenter outwards to foster healthy architecture.
- **The Protector**: Examines workflows to assure drift is minimal fostering sustainability.
- **The Develper**: Feeds the constellation data for healthy modelling.

---

## 🛠 Recent changes (2025-10-21)

A few practical updates were implemented to make the Coach module YAML-first and to simplify how progress is computed and displayed.

- Generator: A YAML-first Python generator produces `signals/funnel_progress.json` from `seeds/funnel_spec.yml`. It no longer relies on CSV-driven logs for the funnel definitions.
- Seeds: The `elevate_session` funnel in `seeds/funnel_spec.yml` was populated with 22 steps (migrated from internal CSV). Keep seeds authoritative — edit these YAML files to change workflows.
- Control-flow target: The generator accepts `--control-flow-target <N>` (default 150) and computes `percent_complete = min(100, sum(step.counts) / N * 100)`. You can override per-coaching targets by adding `control_flow_target: <N>` to the coaching entry in the funnel spec.
- JSON output: The generated `coach-model/signals/funnel_progress.json` contains training entries with `steps_total`, `steps` (with `count`, `status`, `last_activity`), and `percent_complete`.
- UI: `index.html` was updated to:
  - Lazy-load and sanitize `README.md` (marked + DOMPurify).
  - Show a progress view that reads `signals/funnel_progress.json` and renders cards. Each card header includes the control-flow target and the computed percent; the card meta shows only the total steps (e.g., "30 • 20.0%").

## ▶️ How to regenerate the Coach funnel signal

Run the generator using absolute paths (or from repo root) to avoid CWD issues. Example:

```bash
python3 /Users/zachrybreeden/Desktop/FourTwentyAnalytics/coach-model/scripts/generate_funnel_progress.py \
  --funnel-spec /Users/zachrybreeden/Desktop/FourTwentyAnalytics/coach-model/seeds/funnel_spec.yml \
  --out /Users/zachrybreeden/Desktop/FourTwentyAnalytics/coach-model/signals/funnel_progress.json \
  --control-flow-target 150
```

Then preview the module (start server at repo root so hub-style paths resolve):

```bash
python3 -m http.server 8000
# open http://localhost:8000/coach-model/index.html
```

If you want per-coaching targets, add `control_flow_target: <N>` under a coaching entry in `seeds/funnel_spec.yml` and re-run the generator.

---

## 🧭 Generator prompts & examples

Common usage patterns for the coach generator. These examples assume you are running commands on macOS/Linux with `python3` available.

- Dry-run (prints discovered coachings, doesn't write files):

```bash
python3 coach-model/scripts/generate_funnel_progress.py --dry-run
```

- Run from repo root (shorter, relative paths):

```bash
python3 coach-model/scripts/generate_funnel_progress.py \
  --funnel-spec coach-model/seeds/funnel_spec.yml \
  --out coach-model/signals/funnel_progress.json \
  --control-flow-target 150
```

- Run using absolute paths (useful in CI or when CWD is ambiguous):

```bash
python3 /Users/zachrybreeden/Desktop/FourTwentyAnalytics/coach-model/scripts/generate_funnel_progress.py \
  --funnel-spec /Users/zachrybreeden/Desktop/FourTwentyAnalytics/coach-model/seeds/funnel_spec.yml \
  --out /Users/zachrybreeden/Desktop/FourTwentyAnalytics/coach-model/signals/funnel_progress.json \
  --control-flow-target 150
```

- CSV summary report (automatically written):

The generator now writes a CSV summary to `coach-model/data/internal/log.report.csv` with columns:
`id,title,steps_total,percent_complete,last_activity,notes`

- Tips

- Use `--dry-run` first to confirm the generator discovers the coachings you expect.
- If your YAML adds a `control_flow_target` under a specific coaching, the generator will respect that value when computing `percent_complete`.


*This star is part of the FourTwenty Analytics constellation - a modular analytics sandbox where each repository is a specialized "model" within an orbital system.*
