<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Quest 1: The Argument Pit

A brutalist, industrial-themed language-learning game set on the steppe of the
Mongol Empire (1254 AD). You are challenged by **BATZORIG**, a Khan's Guard, who
tests your command of Mongolian vocabulary. Answer correctly to build your
streak and earn his favor; fail and your spirit is ground into the dirt.

It plays like a duel, but under the hood it's a real **spaced-repetition tutor**.

## The learning design

The game is built around techniques with strong support in learning-science
research, not just random quizzing:

- **Spaced repetition (Leitner system).** Every word lives in a mastery "box"
  (1–5). A correct answer promotes the word one box; a mistake sends it back to
  box 1. Selection is weighted so the words you struggle with — and words you've
  never seen — appear far more often than words you've mastered. This expanding
  review schedule is the single most effective lever for long-term retention.

- **Retrieval practice with escalating difficulty.** Difficulty climbs the
  test-format hierarchy as you master a word, because effortful recall builds
  more durable memory than passive recognition:
  1. **Box 1–2** — multiple choice *with* a romanized pronunciation hint.
  2. **Box 3–4** — multiple choice with the hint removed.
  3. **Box 5** — *free recall*: you type the meaning from memory.

- **Immediate corrective feedback.** A wrong answer reveals the correct
  translation *and* its pronunciation, then re-queues the word for early review.

- **Persistent, visible progress.** Your mastery is saved to `localStorage` and
  survives defeats. The **War Journal** (open it from the HUD) shows every word,
  its mastery stars, and your accuracy — supporting self-directed study.

- **Motivation through gamification.** Streaks, a health/"spirit" bar, and a
  best-streak record provide the engagement loop that keeps practice going.

### Controls

- Click an option, or press **1–4** to answer multiple-choice rounds.
- In a Mastery Trial (typed recall), type the English meaning and press Enter.
- Click the **SAY: [...]** pronunciation guide (or the speaker in the War
  Journal) to hear a word read aloud via the browser's speech synthesis.

## Project structure

| Path | Purpose |
| --- | --- |
| `App.tsx` | Game state, round loop, and SRS integration |
| `srs.ts` | Spaced-repetition engine (Leitner boxes, selection, recall matching) |
| `types.ts` | Shared types (`GameState`, `Challenge`, `ReviewMode`, …) |
| `components/` | UI: `HUD`, `Arena`, `InputConsole`, `Onboarding`, `GameOverOverlay`, `Glossary` |

The vocabulary deck lives in `STATIC_CHALLENGES` in `App.tsx`. To add words,
append entries with a Cyrillic `phrase`, a `phonetic` guide, the `translation`,
and four multiple-choice `options` (one of which is the translation).

## Run locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. (Optional) Set `GEMINI_API_KEY` in [.env.local](.env.local) if you extend
   the game with generative content. The core game runs without it.
3. Run the app:
   `npm run dev`

Build for production with `npm run build`.

View the original prototype in AI Studio:
https://ai.studio/apps/drive/1-f1wNCl-vqPTJo7AbL_De7UL57axlQSI
