// Load the messages asynchronously from the CSV file
async function loadMessages() {
  try {
    const response = await fetch('messages.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const csvData = await response.text();
    const messages = Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;

    // Generate a random index to select a message
    const randomIndex = Math.floor(Math.random() * messages.length);
    const selectedMessage = messages[randomIndex]?.message;

    if (selectedMessage) {
      document.getElementById("message").textContent = selectedMessage;
      fitMessage();
    } else {
      throw new Error("No message selected");
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Scale the prompt to the largest size that still fits the screen. The prompts
// vary a lot in length, so any single fixed size would either clip the long
// ones or waste most of the screen on the short ones. Binary search is safe
// here because rendered height only ever grows with font size.
function fitMessage() {
  const stage = document.querySelector('.stage');
  const el = document.getElementById('message');
  if (!stage || !el || !el.textContent) return;

  // Measure the space from the viewport, not from the stage: the stage has
  // already been stretched by whatever size the text is currently at, so
  // measuring it would just feed the previous size back in.
  const header = document.querySelector('.header');
  const pad = getComputedStyle(stage);
  const availH = document.documentElement.clientHeight
    - (header ? header.offsetHeight : 0)
    - parseFloat(pad.paddingTop) - parseFloat(pad.paddingBottom);
  const availW = stage.clientWidth
    - parseFloat(pad.paddingLeft) - parseFloat(pad.paddingRight);
  if (!(availH > 0) || !(availW > 0)) return;

  let lo = 16;
  let hi = Math.min(96, availH);

  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    el.style.fontSize = mid + 'px';
    const fits = el.offsetHeight <= availH && el.scrollWidth <= el.clientWidth + 1;
    if (fits) { lo = mid; } else { hi = mid; }
  }
  el.style.fontSize = lo + 'px';
}

// Call the loadMessages function when the HTML content is fully loaded
document.addEventListener('DOMContentLoaded', loadMessages);

// The heading font arrives after first paint, and it has different metrics
// from the fallback, so the fit has to be recalculated once it lands.
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(fitMessage);
}

// Re-fit after rotation, a resized window, or a projector switching resolution
let refitFrame;
window.addEventListener('resize', () => {
  cancelAnimationFrame(refitFrame);
  refitFrame = requestAnimationFrame(fitMessage);
});
