---
title: "Evaluation and reliability of clinical machine learning"
order: 6
featured: false
venues: ["IEEE TCDS", "NeurIPS Datasets & Benchmarks (target)"]
status: submitted
dek: "An explainable dysgraphia-detection pipeline built around unbiased evaluation and feature attribution — and a follow-up asking how much of a reported clinical result is the protocol rather than the model."
media:
  type: image
  src: /assets/images/research/protocol-spread.svg
  alt: "A schematic in which one fixed dataset fans out through four protocol choices and the reported scores land at scattered positions on an unlabelled axis."
  caption: "Schematic, not results: one cohort, several individually defensible protocols, and the spread in what gets reported. No values are shown — the measurements belong to work still under review."
---

Small clinical datasets give the analyst a great deal of freedom, and the freedom is mostly
invisible in the write-up. The submitted work builds a dysgraphia-detection pipeline whose
first commitment is unbiased evaluation, with feature attribution and exploratory subgroup
characterisation on top of it.

The follow-up takes the question directly: hold the data and the label fixed, vary only
choices a reviewer would wave through — the split scheme, the feature set, how
normalisation and hyperparameter selection are arranged — and measure how far the reported
number moves. Where it moves further than the improvements papers claim, the improvement
was never the finding.
