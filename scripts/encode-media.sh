#!/usr/bin/env bash
# Re-encode research source clips and figures into web-ready assets under public/.
#
# Sources live in the research workspace, not in this repo. Re-run this script
# when a source is re-rendered; commit the outputs.
set -euo pipefail

SRC_ROOT="${SRC_ROOT:-$HOME/Desktop/postdoc/projects}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/media"
FIGS="$ROOT/public/assets/images/research"
REPO_IMG="$ROOT/public/assets/images"
mkdir -p "$OUT" "$FIGS"

# ------------------------------------------------------------------ clips --
# name | source path | speed-up factor
CLIPS=(
  "handwriting-surprise|$SRC_ROOT/dysgraphia/trajectory-viz/output/comparisons/diagramo_dictation_speed__speed.mp4|9"
)

for spec in "${CLIPS[@]}"; do
  IFS='|' read -r name src speed <<< "$spec"

  if [[ ! -f "$src" ]]; then
    echo "missing source for $name: $src" >&2
    exit 1
  fi

  echo "encoding $name (${speed}x)"

  ffmpeg -v error -y -i "$src" \
    -filter:v "setpts=PTS/${speed},fps=25" -an \
    -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p \
    -movflags +faststart "$OUT/$name.mp4"

  ffmpeg -v error -y -i "$src" \
    -filter:v "setpts=PTS/${speed},fps=25" -an \
    -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 \
    "$OUT/$name.webm"

  # Poster: the last frame, so the still shows the completed writing.
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/$name.mp4")
  seek=$(awk -v d="$dur" 'BEGIN { printf "%.2f", (d > 0.2 ? d - 0.2 : 0) }')
  ffmpeg -v error -y -ss "$seek" -i "$OUT/$name.mp4" -frames:v 1 -q:v 4 "$OUT/$name.jpg"

  for f in "$OUT/$name.mp4" "$OUT/$name.webm" "$OUT/$name.jpg"; do
    bytes=$(wc -c < "$f")
    printf '  %-40s %6s KB\n' "$(basename "$f")" "$((bytes / 1024))"
    if (( bytes > 2097152 )); then
      echo "  ERROR: $(basename "$f") exceeds the 2 MB budget" >&2
      exit 1
    fi
  done
done

# ---------------------------------------------------------------- figures --
# Card figures are downscaled to a single web width. Re-rendering them properly
# (bigger tick labels, tighter axes, dark-mode-aware SVG) is follow-up work;
# this step only makes them the right size to ship.

# Width is per-figure: dense plots need a narrower raster to stay under the
# 300 KB ceiling, line diagrams survive a wider one. The crop filter runs first
# and is "-" when the source needs no trimming; it exists to remove baked-in
# paper titles that the web caption already carries.
#
# lm-adaptation is not here: its source figure is 1760x202, too extreme a strip
# to sit in any card, so it is hand-drawn as theme-aware SVG instead.
#
# name | source path | max width | crop filter
FIGURES=(
  "profile-radar|$SRC_ROOT/dysgraphia/motor-domain-profiling/paper/figures/figure_group_profile.png|980|crop=iw:ih-190:0:190"
  "systems|$SRC_ROOT/dysgraphia/motor-domain-profiling/paper/figures/system_architecture.png|1200|-"
  "ckd-spectrogram|$REPO_IMG/2025_interspeech_ckd.png|1200|-"
  "asd-pipeline|$REPO_IMG/asd_model_final.png|1000|-"
)

echo "encoding figures"
for spec in "${FIGURES[@]}"; do
  IFS='|' read -r name src width crop <<< "$spec"

  if [[ ! -f "$src" ]]; then
    echo "missing figure source for $name: $src" >&2
    exit 1
  fi

  filter="scale='min(${width},iw)':-2:flags=lanczos"
  [[ "$crop" != "-" ]] && filter="${crop},${filter}"

  ffmpeg -v error -y -i "$src" -vf "$filter" \
    -compression_level 100 "$FIGS/$name.png"

  bytes=$(wc -c < "$FIGS/$name.png")
  printf '  %-40s %6s KB\n' "$name.png" "$((bytes / 1024))"
  if (( bytes > 307200 )); then
    echo "  ERROR: $name.png is over 300 KB; lower its width in FIGURES" >&2
    exit 1
  fi
done

echo "done"
