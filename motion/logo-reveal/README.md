# MOONA logo reveal · Eclipse

חשיפת הלוגו הרשמית של MOONA: הירח עובר מול השמש, האור רץ סביב הטבעת ומשאיר אחריו שובל לוהט שמתקרר לזהב, הבזק טבעת יהלום, ואז השם. 5.3 שניות, עם מוזיקה ואפקטים.

The approved MOONA sting. Use it as an intro or an end card on anything that carries the Moona name.

## Files

| File | Use |
|---|---|
| `MOONA_logo_reveal_16x9_4K.mp4` | Horizontal master, 3840x2160 |
| `MOONA_logo_reveal_9x16_4K.mp4` | Vertical master, 2160x3840 |
| `MOONA_logo_reveal_16x9_1080.mp4` | Horizontal for web, YouTube, decks |
| `MOONA_logo_reveal_9x16_1080.mp4` | Vertical for Reels, TikTok, Stories, WhatsApp |
| `source/MOONA_logo_reveal.aep` | After Effects project (AE 2027, 16 bpc). Final comps: `MOONA_reveal_v05b_heat_16x9`, `MOONA_reveal_v05b_heat_9x16` |
| `source/build_moona_logo_reveal.jsx` | Rebuilds the whole project from scratch in After Effects |
| `source/MOONA-symbol-transparent.png` | The symbol as used in the animation |
| `source/sound/MOONA_logo_reveal_sound.wav` | Final mix, 48 kHz stereo, 5.3 s, about -13.6 LUFS |
| `source/sound/stem_*` | The parts of the mix, to remix it |

All videos: 30 fps, H.264 with AAC audio, 5.3 s.

## Timeline

| Time | Picture | Sound |
|---|---|---|
| 0.0 | Bright sun, the dark moon enters from the left | Music opens low, riser starts |
| 1.1 | The moon covers the sun, stars appear | Music builds |
| 1.1 to 1.5 | Light runs around the rim; the lit rim burns white, then orange, then cools to gold | Rising whoosh |
| 1.49 | | 10 ms of silence |
| 1.50 | Diamond ring flash | Hit, sub boom, music opens to a major chord |
| 1.6 to 2.7 | Corona rays open; MOONA enters letter by letter, the two O's appear as a crescent and a full moon | Shimmer tail |
| 2.9 to 3.5 | Tagline under the name | |
| 3.5 to 5.3 | Hold, slow push in, the rim breathes | Music fades out |

## Rebuild or change it

1. Open After Effects and run `source/build_moona_logo_reveal.jsx` (File > Scripts > Run Script File). It builds both ring-fill variants and saves `MOONA_logo_reveal_rebuilt.aep` next to the script. `v05b_heat` is the approved one; `v05a_comets` (two comets that meet at the flash) is the runner up.
2. Every spatial value is scaled by `S` at the top of the script (2 = 4K, 1 = 1080). Timing for the shorter intro is in `T()`.
3. Render with `aerender` or the Render Queue, then mux `source/sound/MOONA_logo_reveal_sound.wav` onto the picture.

Notes:
- The wordmark is set in Helvetica Neue. The site uses SF Mono, which After Effects cannot load on macOS.
- The tagline reads "AI VIDEO STUDIO". The brand book above lists "AI video" under words to avoid; change the tagline in `buildWordmark()` if a page needs to follow the book strictly.
