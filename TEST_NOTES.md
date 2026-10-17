# Core-flow test notes

Static code walkthrough performed after reading the story from cover to final page.

- **Cover → first page:** Next could be pressed before Start, which allowed the reader to skip the opening interaction. **Fixed:** Next and page dots are locked until Start is pressed.
- **Mars, supplies, rocket, launch, stars, landing, ending:** The reader could repeatedly press Next without completing the page activity. **Fixed:** each page now records completion and unlocks Next only after its required interaction.
- **Supply collection:** Tapping the same supply repeatedly could inflate the count. **Fixed:** collected supplies are idempotent and only count once.
- **Launch:** Repeated pointer presses could start overlapping hold timers or repeat the launch transition. **Fixed:** launch uses one timer and ignores additional presses after liftoff.
- **Star trail:** Dragging worked with pointer events, but one star was enough to reveal the message and the page could still be skipped. **Fixed:** all four stars must be dragged, with pointer-cancel handling for touch interruptions.
- **Back then forward:** Page activity state was not used to control navigation. **Fixed:** completed page state persists when moving backward and forward.
- **Read again:** Restart returned to the cover but left collected supplies, moved stars, launch state, and messages in place. **Fixed:** Restart clears all progress and restores the original scene state.
- **Final interaction:** Tapping anywhere in the final scene counted as tapping Johnny. **Fixed:** only Johnny completes the final page activity.
- **Phone held sideways:** The main mobile layout had a tall minimum height that could overflow a short landscape viewport. **Fixed:** added a short-landscape layout with a compact single-row page and resized scenes.

The JavaScript syntax check passed. A live visual walkthrough on a physical tablet was not available in this pass, so the final visual fit should still be spot-checked in the open browser at a narrow landscape size.
