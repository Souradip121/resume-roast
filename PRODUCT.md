# Product

<!-- impeccable:product-schema 1 -->

> Written from the build brief (the coordinating session's task, 13 Nov 2026) plus one confirmation round with the author: roast lines in English only, and build in code straight from the picked concept board. Facts marked *(inferred)* come from the brief's context rather than a direct statement.

## Platform

web

## Stack

Static: `index.html`, one stylesheet and plain ES modules, no build step and no backend. pdf.js is vendored into the repo and loaded only when a PDF is added. Hosted on GitHub Pages from the public repo `Souradip121/resume-roast`; anyone can fork it and turn on Pages. Same approach as `who-texts-first`.

## Users

Indian college students and freshers (mostly CS/engineering) who follow @souradip.sh on Instagram. They arrive from an Instagram DM after commenting ROAST on the reel, so they open the link on a phone, often inside Instagram's in-app browser. They are about to send a one-page resume to internships and placement drives and want to know what is wrong with it before a recruiter does.

## Product Purpose

Give a student's resume to an AI and get back a funny but useful roast: a few roast lines, a score out of 10, and the three fixes that matter most. Two ways:

1. **Copy the prompt.** A ready-made prompt the student pastes into ChatGPT, Gemini or Claude with their resume attached. They can paste the AI's answer back into the site to see it as a roast card.
2. **Use your own API key.** Pick OpenAI, Gemini or Claude, paste a key, add the resume (PDF read in the browser with pdf.js, a .txt, or pasted text). The site calls the provider straight from the browser and shows the result.

Success: a student gets a roast that makes them laugh and three fixes they can act on tonight, then shares the card.

Reel hook: "Don't send your resume to 100 companies. Let AI roast it first." Keyword: ROAST.

## Positioning

No server and no account. The resume goes only to the AI the student picks. The prompt is the product: it aims every joke at what is written on the page (never at the person's background, gender, college tier or language), knows the Indian fresher resume (CGPA, projects, internships, hackathons, "Declaration", father's name, "MS Office"), and always ends in three concrete fixes.

## Operating Context

- Opened from an Instagram DM on a phone, one-handed, portrait. *(inferred)* Often inside Instagram's in-app browser, where clipboard and downloads can be unreliable.
- Resumes are usually a one-page PDF made in Word, Canva, Overleaf or a resume builder; some are scanned images with no text layer.
- The reel (~33 s) shows: the two route cards, the drop zone with a PDF, the spice level being chosen, roast lines landing as quote cards, then the score and the three fixes.

## Capabilities and Constraints

- Screen 1 "Pick how to run it": the "Copy prompt" route and the own-key route (provider chips, masked key field with "Your key stays in this browser", resume drop zone for PDF / .txt / pasted text).
- Screen 2 "The roast": a spice level of 1 to 5 chillies chosen before running (it sets the tone), then the roast lines as quote cards.
- Screen 3 "Fix these 3": the score, three numbered fixes, "Share my roast" (a result card image with no name, phone, email or college unless the user opts in) and "Roast again".
- The AI must answer in a strict JSON shape (roast lines, score, verdict, three fixes, details to hide on the card). English only, at every spice level.
- Errors handled with clear messages: bad key, no credit, rate limit, network, unknown model, refusal, non-resume file, scanned PDF with no text, malformed JSON.
- Example lines in the right voice appear only on the clearly labelled example state: "'Proficient in MS Word' is not a skill. It is a confession.", "5 projects. 4 of them are to-do apps.", "'Team player' appears 6 times. Your team would like a word."
- Web only. No Android app, no analytics, no storage beyond the tab.

## Brand Commitments

Made by @souradip.sh (Instagram). Voice: student-to-student, cheeky, sharp; the roast is the joke, the fixes are the help. Visual direction pinned by the author: concept D, "hot sauce label" (`builds/ui-concepts/roast/roast_d_hotsauce.png`): vintage hot sauce label, red and yellow, bold label typography, chilli illustrations, "EXTRA HOT" starburst badges, thick outlines. It must not look vibe-coded. AI providers appear as plain names, not logos.

## Evidence on Hand

- The concept board above (three screens). Its text is a placeholder.
- A made-up sample resume (`samples/`), with an invented name, college and contact details, used for the demo button, tests and the reel stills. It is labelled as made up. No real resume is used anywhere.
- No user counts, testimonials, hiring outcomes or accuracy claims exist. Never invent them.

## Product Principles

1. Roast the resume, never the person.
2. Funny first, useful always: every roast ends in three fixes a fresher can act on.
3. Privacy you can read: say exactly what leaves the phone, and to whom.
4. Two routes, no dead ends: anyone without a key can still copy the prompt.
5. Screenshot-ready: each screen fits a phone and looks good in a reel.

## Accessibility & Inclusion

Keyboard-reachable controls with visible focus, 4.5:1 contrast for body text, reduced motion respected for the stamp and count-up effects. *(inferred)* Many users read English as a second language, so copy stays short and plain, and the roast never mocks English level or first language.
