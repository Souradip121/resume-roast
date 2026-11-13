---
name: Resume Roast
description: A vintage hot sauce label that roasts a resume. Label-red bottle, butter-yellow banner, cream paper panel, ink outlines on everything.
colors:
  red: "#D3221B"
  red-label: "#C81E19"
  red-deep: "#9E1410"
  yellow: "#FFD54A"
  yellow-deep: "#F4B321"
  yellow-pale: "#FFEFB0"
  green: "#3F8A2A"
  ink: "#2A120B"
  ink-soft: "#5B3424"
  cream: "#FFF3CC"
  card: "#FFF9E4"
  paper: "#FFFDF3"
  butter: "#F7E39B"
typography:
  display:
    fontFamily: "Ultra, 'Rockwell Extra Bold', serif"
    fontSize: "42px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0"
  score:
    fontFamily: "Ultra, 'Rockwell Extra Bold', serif"
    fontSize: "48px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  numeral:
    fontFamily: "Ultra, 'Rockwell Extra Bold', serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1
  seal:
    fontFamily: "Ultra, 'Rockwell Extra Bold', serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.5px"
  headline:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "31px"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "0.005em"
  title:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "23px"
    fontWeight: 800
    lineHeight: 1.05
  button:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "21px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.01em"
  label-ruled:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "18px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.16em"
  label:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "16px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.05em"
  quote:
    fontFamily: "'Zilla Slab', Rockwell, Georgia, serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.28
  body:
    fontFamily: "'Zilla Slab', Rockwell, Georgia, serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.45
  small:
    fontFamily: "'Zilla Slab', Rockwell, Georgia, serif"
    fontSize: "14.5px"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "ui-monospace, 'SFMono-Regular', 'Cascadia Mono', Consolas, monospace"
    fontSize: "12.5px"
    lineHeight: 1.5
rounded:
  tag: "6px"
  field: "10px"
  control: "12px"
  card: "14px"
  pill: "999px"
spacing:
  gutter: "10px"
  list: "11px"
  stack: "12px"
  card-gap: "14px"
  card-pad: "15px"
  panel-x: "16px"
components:
  button-red:
    backgroundColor: "{colors.red}"
    textColor: "{colors.cream}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    height: "50px"
    padding: "0 18px"
  button-red-hover:
    backgroundColor: "#E02A22"
  button-red-active:
    backgroundColor: "{colors.red-deep}"
  button-yellow:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    height: "50px"
    padding: "0 18px"
  button-yellow-hover:
    backgroundColor: "#FFDC63"
  button-yellow-active:
    backgroundColor: "{colors.yellow-deep}"
  button-big:
    height: "58px"
  button-done:
    backgroundColor: "{colors.green}"
    textColor: "#FFFFFF"
  button-disabled:
    backgroundColor: "#E9C9A6"
    textColor: "#7A5544"
  link:
    textColor: "{colors.red-deep}"
    padding: "4px 0"
  chip-provider:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 8px"
  chip-provider-hover:
    backgroundColor: "{colors.yellow-pale}"
  chip-provider-selected:
    backgroundColor: "{colors.red}"
    textColor: "{colors.cream}"
  input-key:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "52px"
    padding: "0 54px 0 14px"
  input-text:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
  drop-zone:
    backgroundColor: "{colors.yellow-pale}"
    rounded: "{rounded.control}"
    padding: "18px 14px"
  drop-zone-over:
    backgroundColor: "{colors.yellow}"
  file-chip:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "5px 4px 5px 12px"
  panel:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "22px"
    padding: "78px 16px 66px"
  card-route:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "15px 15px 16px"
  card-quote:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.quote}"
    rounded: "{rounded.card}"
    padding: "12px 14px 12px 11px"
  card-fix:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "12px 14px 13px 11px"
  fix-numeral:
    backgroundColor: "{colors.red}"
    textColor: "{colors.yellow}"
    typography: "{typography.numeral}"
    rounded: "50%"
    size: "44px"
  tag-before:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    rounded: "5px"
    padding: "3px 6px 2px"
  tag-after:
    backgroundColor: "{colors.red}"
    textColor: "{colors.cream}"
  ribbon:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.yellow}"
    rounded: "{rounded.tag}"
    padding: "7px 14px 6px"
  back-button:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "50%"
    size: "44px"
  sheet:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "20px"
    width: "min(420px, calc(100vw - 24px))"
---

# Design System: Resume Roast

## Overview

**Creative North Star: "The Vintage Sauce Label"**

The whole app is one hot sauce bottle label. A label-red ground runs the full height of the phone; an arched butter-yellow banner with halftone dots carries fat outlined lettering flanked by two glossy chillies; a cream paper panel hangs under it with a starburst heat badge pinned across its top edge and a row of flame tongues burning along its bottom edge. Every screen is a different panel on the same label: the route cards, the heat picker, the stamped roast lines, the score burst and the three fixes. The share card is the same label redrawn on a 1080 x 1920 canvas with the same palette object and the same banner, seal, burst, star and flame paths.

The material is printed paper and ink. Depth comes from 2.5px ink outlines and inset double keylines, not from shadows; colour comes from two sauces, red and yellow, on warm cream, with brown-black ink instead of grey. Things that are a verdict (the heat, the score, each roast line) sit on starbursts and seals and arrive with a stamp; things you operate (route cards, fields, buttons) stay square, outlined and still. Density is phone-first and generous: one 460px column, 44px minimum targets, one screen title per screen.

The category look this rejects is the grey "AI resume analyser" dashboard with a score ring. The label is cheeky and loud, but every sentence is set in a readable slab serif at 13.5px or larger, and red text below 18px moves to the deeper red so it stays legible on cream.

**Key Characteristics:**
- Label red frame, butter-yellow banner, cream paper panel, flame-tongue bottom edge.
- Ink outlines on everything: 2.5px on cards, buttons, fields and chips; 3px on the panel, sheet and desktop bottle.
- Three typefaces with fixed jobs: Ultra lettering, Barlow Condensed label caps and titles, Zilla Slab sentences.
- Starbursts and seals carry heat, score and roast lines; numbered circles carry the fixes.
- Results stamp in; controls press down 1-2px; reduced motion removes all of it.
- Warm neutrals only: no grey, no blue.

## Colors

Two sauces on cream paper: a red family for the frame and the actions, a yellow family for the banner and the highlights, warm brown-black ink for every line and sentence.

### Primary
- **Sauce Red** (#D3221B): the primary action colour and the hot half of every illustration. Red buttons, the selected provider chip, the heat badge fill, the OR seal, the score burst ring, the fix numerals, ruled labels, the "After" tag, the front row of flames, the checked opt-in box, and the browser's accent colour.
- **Label Red** (#C81E19): the bottle itself. The full-height ground behind the panel (under a faint 2px/7px vertical pinstripe of white at 2.5%), the browser theme colour, and the share card's ground.
- **Dried Chilli** (#9E1410): red that has to read small. Links, field labels, error text, the pressed state of red buttons, the scrollbar thumb, and the shadow side of the chilli gradient.

### Secondary
- **Banner Yellow** (#FFD54A): the yellow button, the file chip, the drop zone while a file is dragged over it, the focus halo, the selection highlight, the fix numerals' text and the ribbon text on ink.
- **Turmeric** (#F4B321): the deep edge of the banner and burst gradients, the back row of flames, the cooking card's keyline, and the pressed state of yellow buttons.
- **Pale Butter** (#FFEFB0): soft yellow surfaces and text on red. The drop zone at rest, the provider chip hover, and the Ultra text inside the heat badge and the OR seal.

### Tertiary
- **Stem Green** (#3F8A2A): only the chilli stems, the "Copied" button state and the small ok dot in front of a good parse note. Never a surface.

### Neutral
- **Smoked Ink** (#2A120B): every outline, every heading and body sentence, the "Before" tag and the ribbon ground, the focus outline, and the modal scrim at 66%.
- **Tamarind** (#5B3424): secondary text. Route card leads, notes and status lines, the "how" line of a fix, the struck-through "before" text, the sheet note.
- **Label Cream** (#FFF3CC): the paper panel, the share sheet, the back button, and all text on red buttons and the footer.
- **Card Stock** (#FFF9E4): one step lighter than the panel; route cards, quote cards, fix cards, the cooking and error cards.
- **Fresh Paper** (#FFFDF3): the lightest surface, for things you write in or pick: the key field, textareas, the model field, the prompt preview, provider chips at rest, the opt-in box, the error line.
- **Butter** (#F7E39B): the page behind the bottle. On phones it is only the body colour; at 560px and up it becomes a halftone backdrop with 1.2px dots of #E8A21A at 35% on a 14px grid.

Illustration gradients are fixed recipes, not tokens: the banner band runs #FFF0A6 to Banner Yellow to Turmeric, bursts run #FFF1A0 to #FFD23F to #F6B623, the chilli pod runs #F24A2C to Sauce Red to Dried Chilli with a #FFE6CF highlight, and the stem cap runs #7CC447 to Stem Green. The banner halftone is a 7px pattern of 1.15px #E8A21A dots at 55%.

### Named Rules
**The Two Sauces Rule.** Red and yellow are the only colours with jobs. Green is limited to stems and the "done" state, and the neutrals are warm browns and creams; nothing on the label is grey or blue, and an unlit chilli is desaturated to sepia, not grey.

**The Small Red Rule.** Sauce Red text appears only at 18px and up (ruled labels, the heat count, the score). Resting red text below 18px (links, field labels, errors) uses Dried Chilli, which holds 7.4:1 on cream.

**The Text On Red Rule.** Text on Sauce Red is Label Cream (4.7:1) or Pale Butter in Ultra (4.5:1). Banner Yellow on red is reserved for the Ultra fix numerals at 21px (3.7:1) and never carries a sentence.

## Typography

**Display Font:** Ultra (with 'Rockwell Extra Bold', serif)
**Body Font:** Zilla Slab (with Rockwell, Georgia, serif)
**Label/Mono Font:** Barlow Condensed for labels, titles and buttons (with 'Arial Narrow', sans-serif); the system monospace stack for the prompt preview, the pasted answer, the key and the model id

**Character:** Ultra is the fat Clarendon lettering a sauce label prints its name in; Barlow Condensed is the tall, tight sales copy around it; Zilla Slab is a friendly slab serif that keeps every sentence readable. All three are self-hosted woff2 with font-display swap, and the share card loads the same three before drawing.

### Hierarchy
- **Display** (Ultra 400, 42px, line-height 1): the "RESUME" lettering on the banner arch; "ROAST" on the lower arch is 46px. Set in SVG on a textPath, Sauce Red with a 6px round-joined ink stroke painted under the fill, plus a second ink copy 3px lower as a drop shade. Masthead only.
- **Score** (Ultra 400, 48px, line-height 1, -0.01em, tabular figures): the score on the burst, Sauce Red with a 2px ink text stroke; the "/10" drops to 22px with a 1.2px stroke.
- **Numeral** (Ultra 400, 21px): the fix numbers in red circles. The heat count line ("4 / 5 · Extra hot") uses Ultra at 19px in Sauce Red.
- **Seal** (Ultra 400, 15px, 0.5px tracking): two-word text inside starbursts, the heat badge ("EXTRA / HOT", 15.5px) and the OR divider, in Pale Butter.
- **Headline** (Barlow Condensed 800, 31px, line-height 1.05): one screen title per screen, centred between two small red stars, balanced wrap. 27px under 360px.
- **Title** (Barlow Condensed 800, 23px, line-height 1.05): route card titles; the sheet title is 25px and the drop zone title 21px.
- **Button** (Barlow Condensed 800, 21px, 0.01em): every button label; 23px on big buttons, 19-20px in two-up rows and provider chips.
- **Label, ruled** (Barlow Condensed 800, 18px, 0.16em, uppercase): a centred caps label between two 2.5px red rules, naming a control or a state ("Spice level", "Didn't cook"; "Fix these 3" on the share card).
- **Label** (Barlow Condensed 800, 16px, 0.05em, uppercase): form field labels in Dried Chilli. The same face at 12.5px and 0.1em sets the "Before" / "After" tags, at 15px the ribbon.
- **Quote** (Zilla Slab 700, 18px, line-height 1.28): roast lines on quote cards, pretty wrap, hyphenated words kept whole. The verdict (19px/1.3, balanced, 28ch) and fix titles (19px/1.2) use the same bold slab.
- **Body** (Zilla Slab 500, 16px, line-height 1.45): sentences; route card leads are 15px/1.35 in Tamarind.
- **Small** (Zilla Slab 500, 14.5px, line-height 1.4): notes, status lines, the lock line, before/after text, footer copy. Nothing in the app is smaller than 13.5px except the 12.5px prompt preview and the 12.5px tags.
- **Mono** (system monospace, 12.5px, line-height 1.5): the prompt preview; 13.5px for the pasted answer, 15px for the model id, 16px with 0.05em tracking for the key field.

### Named Rules
**The Three Voices Rule.** Ultra prints names and numbers, never a sentence. Barlow Condensed prints titles, buttons and caps labels, never a paragraph. Every sentence, including roast lines and the verdict, is Zilla Slab.

**The Outlined Lettering Rule.** The masthead lettering and the score are Sauce Red Ultra with an ink outline painted under the fill (paint-order: stroke). Ultra used for seal words, fix numerals and the heat count is flat: Pale Butter or Banner Yellow on a red seal, or Sauce Red on cream.

## Layout

One column, one label. The bottle is a single flex column capped at 460px and centred; on phones it fills the full dynamic viewport height in Label Red. The banner header sits at the top with a 2px safe-area-aware inset and 4px side margins; the cream panel follows with a negative top margin of 12.5% of the column width, so the heat badge rides across the panel's top border. The panel is inset 10px from each edge of the label, padded 78px on top (clearance for the badge), 16px at the sides and 66px at the bottom (clearance for the 50px flame strip), and grows to fill the remaining height. The footer below it is centred cream text, padded for the bottom safe area.

Inside the panel, rhythm is set by a few recurring steps: 10px gutters and two-up button gaps, 11px between stamped list cards, 12px between controls inside a card, 14px between route cards, 15px card padding, 16px panel side padding. Cards use small fixed-plus-fluid grids: a 46px illustration beside the route title, a 52px seal beside each roast line, a 44px numeral beside each fix. Two-button rows split 1fr 1fr with a 10px gap; when the native share button is hidden, the save button spans both columns. Big actions are full width.

At 560px and up the label stops being the page: the Butter halftone backdrop appears behind it, the body gets 28px of top and 40px of bottom padding, and the bottle gains a 3px ink border, 30px corners, clipped overflow and a soft amber float shadow. Under 360px the panel side padding tightens to 12px, the screen title drops to 27px, and the heat picker's chillies shrink from 58px to 50px (26px in the copy card). The page never scrolls sideways (overflow-x: clip on body and bottle).

### Named Rules
**The One Bottle Rule.** Everything lives in the 460px label column. Wider screens get the butter backdrop around the bottle, never a wider bottle or a second column.

## Elevation & Depth

The label is flat print. Depth is drawn, not cast: every surface has an ink outline, emphasis containers add an inset double keyline (a ring of the surface colour, then a thin coloured ring inside the outline), and the panel's layering over the banner is shown by overlap and outline alone. The only cast shadow in the app is the soft amber float under the bottle on wide screens; the heat picker's chillies get a 1px ink lip. Focus is a ring system of its own: a 3px ink outline offset 3px with a 7px Banner Yellow halo.

### Shadow Vocabulary
- **Bottle float** (`box-shadow: 0 30px 60px -24px rgb(110 50 0 / .45), 0 6px 14px -6px rgb(110 50 0 / .3)`): the desktop bottle on the butter backdrop, nothing else.
- **Panel keyline** (`box-shadow: inset 0 0 0 5px var(--cream), inset 0 0 0 6.5px rgb(211 34 27 / .55)`): the cream panel's inner red rule.
- **Cooking keyline** (`box-shadow: inset 0 0 0 4px var(--card), inset 0 0 0 6px var(--yellow-deep)`): the loading card.
- **Error keyline** (`box-shadow: inset 0 0 0 4px var(--card), inset 0 0 0 6px var(--red)`): the "Didn't cook" card.
- **Back button keyline** (`box-shadow: inset 0 0 0 3px var(--cream), inset 0 0 0 5px var(--red)`): the round back button.
- **Chilli lip** (`filter: drop-shadow(0 1px 0 rgb(42 18 11 / .25))`): heat picker chillies.
- **Focus halo** (`outline: 3px solid var(--ink); outline-offset: 3px; box-shadow: 0 0 0 7px var(--yellow)`): every keyboard-focused control.
- **Invalid ring** (`box-shadow: 0 0 0 3px rgb(211 34 27 / .25)`): the key field when the key is rejected, with a Sauce Red border.

### Named Rules
**The Ink Line Rule.** Every card, button, field, chip, seal and frame carries an ink outline: 2.5px on components (the `--line` value), 3px on the panel, sheet and desktop bottle, 2px on textareas, the file chip and the error line. A surface without an outline is not part of the label.

**The Double Keyline Rule.** Containers that mark a moment (the panel, the cooking card, the error card, the back button) get an inset double keyline; ordinary cards do not.

## Shapes

Soft-cornered rectangles with ink outlines, set against a small set of label silhouettes. Corners step by role: 5-6px on tags, the ribbon and the opt-in box; 10px on text fields, the file chip and icon buttons; 12px on buttons, the key field, the drop zone and the heat readout; 14px on cards; 20px on the share sheet; 22px on the panel; 30px on the desktop bottle. Provider chips are full pills; the back button and fix numerals are circles.

The silhouettes are the label's own: the arched banner (a red arch, a yellow band inset inside it, a dotted red keyline inset again), a 24-point seal for the heat badge, the OR divider and the quote seals, an 18-point burst for the score and the cooking spinner, a 5-point star for title ornaments and the footer, and a strip of flame tongues in two rows along the panel's rounded bottom. Dashed outlines mark places that receive something: the drop zone (2.5px dashed ink, turning solid red on drag-over), the heat readout (2px dashed ink at 35%) and the prompt preview (2px dashed ink at 45%).

Illustrations are hand-drawn SVG symbols in the label palette with 2.2-3.5px round-joined ink strokes: the glossy chilli (radial-gradient pod, clipped shadow side, cream highlight, green cap), and three route illustrations (a document, a key, an upload cloud). UI icons are a separate single-stroke set at 2.2-2.8px with round caps, drawn in currentColor.

### Named Rules
**The Starburst Rule.** Heat, score and roast lines sit on seals and bursts; ordered fixes sit in plain red circles. A seal never wraps a control.

**The Hand-Placed Tilt Rule.** Stamped and illustrated things are slightly off-square: roast quote cards alternate -0.7deg and 0.6deg, their seals turn 14deg or -10deg, picker chillies tilt -6deg and 5deg, the score chillies lean at 62deg. Route cards, fix cards, fields and buttons stay square.

## Components

### Buttons
Chunky label buttons: condensed caps-height type, full width, ink-outlined, pressed down rather than lit up.
- **Shape:** gently rounded (12px), 2.5px ink outline, full width, 50px tall (58px for big step buttons), 18px side padding, 9px gap to a 21px icon.
- **Primary (red):** Sauce Red with Label Cream text. Used for the step forward on every screen ("Copy prompt", "Next: pick the heat", "Roast me", "Fix these 3", "Share my roast").
- **Secondary (yellow):** Banner Yellow with ink text, for the alternate path ("Show my roast", "Roast again", "Save image", "Change key").
- **Hover / Active:** hover lifts the fill slightly lighter (#E02A22 red, #FFDC63 yellow); press moves the button down 2px in 0.12s with the ease-out curve and darkens it to Dried Chilli or Turmeric.
- **States:** "Copied" turns the button Stem Green with white text for a moment; a not-ready step button (aria-disabled) goes tan (#E9C9A6) with brown text (#7A5544) but stays focusable, and a tap takes the user to the missing key or resume; a busy button drops to 75% opacity.
- **Links:** underlined Zilla Slab 15px in Dried Chilli, 1.5px underline offset 3px, Sauce Red on hover, with a 14px icon when they leave the site.

### Chips
- **Style:** provider chips are three equal pills in a row, 44px tall, Fresh Paper with ink text in Barlow Condensed 800 19px, 2.5px ink outline. Providers are plain names, never logos.
- **State:** hover goes Pale Butter; the selected chip is Sauce Red with cream text; press moves 1px down.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** Card Stock on the Label Cream panel.
- **Shadow Strategy:** none; outline only (see The Ink Line Rule). The cooking and error cards add a double keyline.
- **Border:** 2.5px solid ink.
- **Internal Padding:** 15px (15px 15px 16px on route cards; 12px 14px 12-13px 11px on quote and fix cards).
- **Route card:** a 46px illustration beside a Title and a Tamarind lead, then the card's controls. The copy-prompt card and the key card are separated by a red OR seal that overlaps both.
- **Panel:** the cream paper sheet itself, 3px ink outline, 22px corners, red inner keyline, flames along the bottom.

### Inputs / Fields
- **Style:** Fresh Paper fields with an ink outline. The key field is 52px tall, 12px corners, 2.5px outline, monospace 16px with 0.05em tracking, with a 44px show/hide eye button inside its right end and a lock line under it ("Your key stays in this browser"). Textareas and the model field are 10px corners with a 2px outline; placeholders are #8C6A57.
- **Focus:** the global focus halo (3px ink outline, 7px yellow ring). The drop zone shows the ink outline when its hidden file input has focus.
- **Error / Disabled:** a rejected key turns the field border Sauce Red with a soft red ring, and an error line appears below it: Fresh Paper, 2px Sauce Red border, 10px corners, Dried Chilli text.
- **Drop zone:** a Pale Butter well with a 2.5px dashed ink border and a centred Barlow title; drag-over fills it Banner Yellow, makes the border solid Sauce Red and scales it to 1.015. A picked file shows as a Banner Yellow chip with a 2px ink outline, a file icon, the ellipsised name and a 34px remove button.
- **Opt-in checkbox:** a 24px custom box with a 2.5px ink outline and 6px corners on Fresh Paper; checked fills Sauce Red with a cream tick.

### Navigation
- **Style:** a three-screen flow with no nav bar. Each screen has one Headline title between two red stars and ends in a full-width step button. A round 44px back button (cream, ink outline, red inner keyline, 24px chevron) appears in the banner's top-left corner from screen 2 on; it presses 1px down. Screen changes fade up 10px over 0.45s and move focus to the new screen title.

### Masthead and Heat Badge
The banner SVG is the identity: red arch, yellow halftone band, dotted keyline, arched lettering, two chillies, two stars. The heat badge under it is a 24-point seal (Banner Yellow ring over a Sauce Red seal, both ink-outlined) whose one or two words follow the chosen heat ("MILD" through "GHOST PEPPER"); when the heat changes it stamps (scale 1.35 and -14deg to rest in 0.5s).

### Heat Picker
Five glossy chillies as radio buttons. On screen 2 they are 58px in a centred row on a card under a ruled "Spice level" label, with the Ultra count line and a one-line tone note under them; in the copy card they are 30px inside a dashed readout with the heat name on the right. Unlit chillies are sepia-desaturated at 42% opacity. Picking pops the chilli (0.42s overshoot and counter-tilt); hover lifts it 2px. At heat 5 the lit chillies shiver continuously (1.6s loop, staggered).

### Roast Lines (Quote Cards)
Each roast line is a Card Stock card with a 52px seal (red 24-point ring, yellow burst, small chilli) beside the line in bold slab. Cards alternate a slight tilt and stamp in one after another (0.55s each, 260ms apart). The example state adds an ink ribbon above them reading "Example: a made-up resume" in yellow caps.

### Score and Fixes
The score is an 18-point burst (red ring, yellow gradient fill, both ink-outlined) between six red rays and two leaning chillies, with the score counting up over 1s (ease-out quartic) in outlined Ultra. Under it the verdict in bold slab. Each fix is a Card Stock card with a 44px red numeral circle, a bold slab title, a Tamarind "how" line and, when given, a before/after pair: an ink "Before" tag beside struck-through Tamarind text (red strike at 70%), a red "After" tag beside ink text. Fix cards stamp in after the burst (450ms, then 220ms apart).

### Loading and Error Cards
Cooking: a Card Stock card with a Turmeric double keyline, a spinning 104px burst (6s linear) with a sizzling chilli on it, a Barlow 21px status line and a Cancel link. Error: the same card with a red double keyline, a ruled "Didn't cook" label with an alert icon, a plain-language message and a two-up red/yellow button row.

### Share Sheet and Share Card
The sheet is a native dialog: cream, 3px ink outline, 20px corners, over a 66% ink scrim, entering with the screen fade in 0.35s. It shows the card image (2.5px ink outline, 12px corners, at most 54% of the viewport height), the details opt-in, and a two-up Share / Save row. The card is the label at 1080 x 1920: Label Red ground, the banner with the heat badge, a cream panel with "My resume scored" between stars, the score burst between chillies, the verdict, up to two roast lines on seal cards, a ruled "FIX THESE 3" label, the numbered fix titles, the flame edge, and the site address in cream Barlow with the credit in yellow slab. Personal details are drawn as ink bars unless the user opts in.

### Footer
Cream text on Label Red under the panel: a 22px Banner Yellow star, a privacy line at 14.5px and a credit line with yellow-underlined links.

### Motion
One curve, cubic-bezier(.16, 1, .3, 1), for every entrance and state change. Results stamp (scale from 1.22 with a slight rotation, settle by 0.55s); controls only press (1-2px down in 0.12s). Ambient loops exist only while something is happening (the cooking spinner and sizzle) or at maximum heat (the shiver). Under prefers-reduced-motion every animation and transition collapses to 0.01ms, scripted waits drop to zero and the score shows its final value at once.

## Do's and Don'ts

### Do:
- **Do** outline every card, button, field, chip and seal in Smoked Ink (#2A120B): 2.5px on components, 3px on the panel, the sheet and the desktop bottle.
- **Do** keep sentences in Zilla Slab at 13.5px or larger, in Smoked Ink or Tamarind on cream surfaces.
- **Do** put text on Sauce Red in Label Cream (4.7:1) or, in Ultra, Pale Butter; use Dried Chilli (#9E1410) for any red text under 18px.
- **Do** put heat, score and roast lines on seals and bursts, and let results stamp in with the shared ease-out curve.
- **Do** use dashed ink borders only for places that receive something: the drop zone, the heat readout, the prompt preview.
- **Do** mark example content with the ink ribbon ("Example: a made-up resume") on screen and on the share card.
- **Do** keep every tap target at 44px or more and keep the 3px ink outline plus 7px yellow halo for keyboard focus.
- **Do** redraw the share card from the same palette, fonts and SVG paths as the page.

### Don't:
- **Don't** use grey or blue anywhere on the label; neutrals are warm browns and creams, and an unlit chilli goes sepia.
- **Don't** cast shadows from cards, buttons or chips; depth is the ink outline and the inset double keyline. The bottle float on wide screens is the only cast shadow.
- **Don't** set a sentence in Ultra or Barlow Condensed, or a name or number meant to shout in Zilla Slab.
- **Don't** set the masthead lettering or the score as flat red Ultra without its ink outline.
- **Don't** show provider logos; providers are plain names on chips.
- **Don't** widen the 460px label column or add a second column on large screens.
- **Don't** tilt or stamp controls; tilt and stamps belong to results and illustrations.
- **Don't** use Banner Yellow text on red for anything but the 21px Ultra fix numerals.
