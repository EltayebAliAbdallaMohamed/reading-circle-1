# Reading Circle discussion deck

A reusable, slide-style discussion guide for English-teacher reading circles. The sample session is seeded with discussion material for *“Bridging Barriers”* by Badri, Graham, and Zhang. Edit `data.json` to prepare a future session; the presentation layout and controls are data-driven.

## Run the deck

Because the page loads `data.json` with `fetch`, open it through a local web server rather than directly as a `file://` page. From this directory, for example:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000` in a browser. Use the on-screen buttons or keyboard: **← / →** to navigate, **N** to show/hide facilitator notes, **F** for fullscreen, **Home / End** to jump, and **Print** to print or save as PDF.

## Edit the session

In `data.json`, update the session `title`, `sessionLabel`, and `slides` array. Each slide can contain:

- `section` — small section label above the title.
- `title` and optional `subtitle`.
- `articleDetails` — optional `authors`, `publication`, and `context` fields, shown on the opening slide.
- `blocks` — an ordered array of content blocks.
- `images` — an array of image objects (can be empty).
- `notes` — facilitator-only notes, toggled with the Presenter notes button.

Supported block types are `paragraph` (`text`), `list` (`items`), `questions` (`items`), `cards` (`items` with `title` and `text`), and `callout` (`text`). Example image entry:

```json
"images": [
  {
    "src": "images/application-screenshot.png",
    "alt": "Screenshot showing the vocabulary activity interface",
    "caption": "Vocabulary activity used in the discussion"
  }
]
```

Place image files in the repository (for example, in an `images/` folder) and keep `src` as a relative path from `index.html`. Use descriptive alt text and captions; describe important visual details aloud during the session. Keep JSON valid: use double quotes, commas between entries, and no trailing commas.

The deck is responsive, keyboard accessible, and includes print styles that print all slides. Presenter notes are included in print output.
