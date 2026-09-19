---
title: "When the pen surprises the model: forecasting handwriting as a graphomotor biomarker"
order: 1
featured: true
venues: ["In preparation, 2026"]
status: in-preparation
dek: "A forecaster trained on typical children's pen trajectories encodes normative dynamics. Its per-timestep surprise stays a time-aligned signal instead of collapsing into a score, so the model can point at when automaticity breaks down — not just whether it did."
media:
  type: video
  src: /media/handwriting-surprise.mp4
  webm: /media/handwriting-surprise.webm
  poster: /media/handwriting-surprise.jpg
  ratio: "1086 / 748"
  alt: "Two handwriting trajectories drawn side by side from the same dictation task. The control writer's trace stays almost uniformly blue; the dysgraphia trace breaks into red, orange and green."
  caption: "DiaGraMo TSK4 dictation, played at 9× speed. Stroke colour is pen speed, 0–70 mm/s. Top: control writer. Bottom: a child with developmental dysgraphia. Data: Zvončáková et al. 2026 (Zenodo 10.5281/zenodo.18299327, CC-BY-4.0)."
---

Handwriting is a time series, and the loss of graphomotor automaticity in developmental
dysgraphia shows up as online motor corrections at particular moments. A forecaster trained
on typical trajectories learns normative dynamics: smooth ballistic motion is highly
predictable, feedback-corrected motion is not.

The design choice that matters is what happens to the forecast error. Collapsing it into a
single score throws away the thing clinicians would actually act on. Keeping it as a
time-aligned signal lets the model say *when* the writing stopped being automatic, which is
a statement a clinician can check against the page.

The trajectories above are from the DiaGraMo dataset — Zvončáková et al. 2026, Zenodo
10.5281/zenodo.18299327, CC-BY-4.0. They are played at nine times speed, and stroke colour
is pen speed from 0 to 70 mm/s. The upper writer is a control; the lower is a child with
developmental dysgraphia.
