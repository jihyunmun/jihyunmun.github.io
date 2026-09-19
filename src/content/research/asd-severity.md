---
title: "Automatic social-communication severity assessment for children with ASD"
order: 5
featured: false
venues: ["Interspeech 2024", "Interspeech 2025", "ICCHP 2024", "LREC-COLING 2024"]
status: published
dek: "The first Korean corpus of children with ASD, speech recognition adapted to it, and a cascaded model that reads segmental and suprasegmental evidence to predict clinician severity scores."
media:
  type: image
  src: /assets/images/research/asd-pipeline.png
  alt: "The cascaded multimodal architecture that turns a child's speech into a predicted social communication severity score."
  ratio: "1000 / 464"
  caption: "The cascaded assessment model. Figure from the Interspeech 2025 paper. Child speech is not published; the figure shows system structure only."
---

Children with autism spectrum disorder are poorly served by speech recognisers trained on
typical adult speech, so the assessment system had to start one layer lower: a recogniser
adapted to this population, on a corpus built for it.

On top of that sits a cascaded multimodal model that predicts clinician-assigned social
communication severity from both what was said and how it was said. Keeping the stages
separate means each one can be inspected, which matters more here than an end-to-end
number would.

The severity-scoring system is the subject of a filed patent and of two registered software
works; the registrations are held by the SNU R&DB Foundation.
