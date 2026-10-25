// Shared timeline (ms) for the eye animation and its music, so picture and sound stay in sync.

// Intro: closed (with a twitch) → slow crack → snap wide open → shock
export const INTRO_CLOSED = 1300
export const TWITCH_AT = 750 // lids twitch once while closed
export const INTRO_CRACK = 600 // opens to a slit…
export const INTRO_SNAP = 180 // …then snaps open (slight overshoot)
export const INTRO_SETTLE = 160
export const SHOCK_MS = 900 // shake, shockwave rings, white flare, row glitch, pupil contraction

// After the shock the eye zooms into the pupil until its black fills the screen.
// The whole animation (intro + shock + zoom) takes TOTAL_MS, then stays black.
export const TOTAL_MS = 12000

export const SHOCK_AT = INTRO_CLOSED + INTRO_CRACK + INTRO_SNAP // eye fully open = impact
export const ZOOM_AT = SHOCK_AT + SHOCK_MS
