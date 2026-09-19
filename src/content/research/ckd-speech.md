---
title: "Speech-based detection and staging of chronic kidney disease"
order: 4
featured: false
venues: ["Interspeech 2023", "Interspeech 2025", "Phonetics and Speech Sciences 2022", "O-COCOSDA 2022"]
status: published
dek: "A purpose-built CKD speech corpus, glottal-source analysis of what the disease does to the voice, and transformer fusion of glottal and spectrogram features with explanations clinicians can read."
media:
  type: image
  src: /assets/images/research/ckd-gradcam.png
  alt: "Four Grad-CAM++ heatmaps over the input spectrogram, averaged across true negatives, false positives, false negatives and true positives. Attention concentrates in low and mid frequency bands early in the utterance."
  ratio: "948 / 688"
  caption: "Grad-CAM++ attention over the spectrogram, averaged separately for each cell of the confusion matrix. No patient audio is published."
---

Chronic kidney disease changes the voice, and the changes are measurable before they are
audible. The work started by building the corpus that did not exist — the first speech
corpus for CKD — then characterised what the disease does to the glottal source, and used
those features for automatic detection and severity estimation.

The later model fuses glottal and spectrogram representations in a transformer and carries
explanation with it, because a screening tool that cannot say which acoustic property drove
its output is not usable in a renal clinic.

The explanation is read back with **Grad-CAM++** over the input spectrogram, and averaged
separately for each cell of the confusion matrix. That last part matters more than the
heatmap itself: seeing where the model attends when it is right next to where it drifts
when it is wrong is what tells you whether it learned the disease or learned the recording
session. Attention concentrates in the low and mid frequency bands early in the utterance,
which is consistent with the glottal-source changes the acoustic analysis found first.

Recordings were collected with Seoul National University Bundang Hospital. Patient audio is
not published.
