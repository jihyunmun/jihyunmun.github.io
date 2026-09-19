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
  alt: "A diagram in which an ASR transcript is fed to a language model and used to predict a social communication severity score."
  ratio: "640 / 300"
  caption: "Predicting clinician severity scores from ASR transcripts. Figure from the Interspeech 2024 paper."
---

Once a child's speech has been transcribed, predicting a clinician's severity score is a
language problem, and the interesting question is how much adaptation a language model
actually needs. Full fine-tuning, prompt tuning, and parameter-efficient methods were
compared on the same transcripts, which makes the cost of each regime legible rather than
assumed.

The work rests on a corpus built for the purpose: the first Korean speech corpus of
children with autism spectrum disorder, with acoustic and linguistic analysis of
pronunciation and communication traits.
