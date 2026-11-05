# Reel videos

Drop your reels here as reel-01.mp4 ... reel-05.mp4 (+ reel-01.jpg ... poster images).
main.js already points at these names.

## Export one reel (fast-start, phone-sized, ~3-8 MB)

    ffmpeg -i original.mp4 \
      -vf "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280" \
      -c:v libx264 -profile:v main -crf 24 -preset slow -r 30 \
      -c:a aac -b:a 128k -movflags +faststart reel-01.mp4

`-movflags +faststart` is the important one: it lets the video start
playing before it has fully downloaded.

## Poster image (shown instantly while the video loads)

    ffmpeg -i reel-01.mp4 -frames:v 1 -q:v 3 reel-01.jpg
