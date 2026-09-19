---
title: "Profiling handwriting-process deviations in developmental dysgraphia"
order: 2
featured: false
venues: ["arXiv:2609.15435", "Behavior Research Methods"]
status: under-review
dek: "A frozen 136-feature vocabulary over 12 handwriting-process domains and an age- and sex-adjusted normative reference that turns one child's writing into a 12-axis deviation profile with per-child uncertainty. Validated on 257 Czech children."
media:
  type: image
  src: /assets/images/research/profile-radar.png
  alt: "A twelve-axis radar chart showing one child's handwriting-process deviation profile against a shaded normative band."
  ratio: "980 / 918"
  caption: "Per-child deviation profile across the 12 handwriting-process domains, with the age- and sex-adjusted normative band shaded. Figure from the paper."
links:
  - label: "Preprint"
    href: "https://arxiv.org/abs/2609.15435"
  - label: "Code"
    href: "https://github.com/jihyunmun/handwriting-process-profiling"
---

The instrument has three parts: a 12-domain, 136-feature vocabulary fixed from the
literature before any analysis; an age- and sex-adjusted normative reference; and the
measurement-property evidence that the two together behave like an instrument —
structural coherence, reference calibration, known-groups validity, and individual
reliability.

It reports where a child sits relative to verified-typical peers of the same age and sex.
It does not train a classifier and it does not output a diagnosis; its outlier rate is not
a diagnostic rate. The vocabulary, the analysis code, and a reference implementation are
released openly. A hosted scoring API is in preparation.

Cohort: 257 Czech children (110 typically developing, 147 with dysgraphia) from the
DiaGraMo dataset, which is openly published by Zvončáková and colleagues under CC-BY-4.0.
