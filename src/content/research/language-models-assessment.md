---
title: "Language models for clinical speech assessment"
order: 3
featured: false
venues: ["Interspeech 2024", "LREC-COLING 2024"]
status: published
dek: "Comparing full fine-tuning, prompt tuning, and parameter-efficient adaptation of language models over ASR transcripts to predict clinician severity scores — alongside the corpus and the linguistic analysis it is built on."
media:
  type: image
  src: /assets/images/research/lm-adaptation.svg
  alt: "Four ways to adapt one pretrained language model, compared by what is actually trained: full fine-tuning updates every layer; prompt tuning learns only soft prompts at the input; P-tuning inserts continuous prompts at every layer; low-rank adapters train a small matrix beside each frozen layer."
  ratio: "980 / 372"
  caption: "The adaptation regimes, drawn by what each one actually trains."
---

Once a child's speech has been transcribed, predicting a clinician's severity score is a
language problem, and the interesting question is how much adaptation a language model
actually needs. Full fine-tuning, prompt tuning, and parameter-efficient methods were
compared on the same transcripts, which makes the cost of each regime legible rather than
assumed.

The regimes differ in what they are allowed to change. Full fine-tuning rewrites every
weight and leaves you a whole model per task. Prompt tuning freezes the model and learns a
few vectors at the input. P-tuning pushes those continuous prompts into every layer rather
than only the first. Low-rank adapters leave the layer alone and train a small matrix
beside it. On a clinical dataset the differences are not only about cost — the smaller the
trained surface, the less there is to overfit to a few hundred children.

The work rests on a corpus built for the purpose: the first Korean speech corpus of
children with autism spectrum disorder, with acoustic and linguistic analysis of
pronunciation and communication traits.
