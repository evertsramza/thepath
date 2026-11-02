/* =====================================
   CONFIGURATION
===================================== */

const TOTAL_FRAMES = 200;
const FRAME_INTERVAL = 300;


/* =====================================
   ELEMENTS
===================================== */

const openingSection = document.querySelector("#openingSection");
const openingVisual = document.querySelector("#openingVisual");
const frameA = document.querySelector("#frameA");
const blackGradient = document.querySelector("#blackGradient");

const poemLines = document.querySelectorAll(
    ".poem-line:not(.final-poem-line)"
);


/* =====================================
   SINGLE DOORS IMAGE
===================================== */

frameA.src = "images1/doors_351.jpg";
frameA.classList.add("active");


/* =====================================
   SCROLL-DRIVEN TRANSITION
===================================== */

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function smoothstep(value) {
    return value * value * (3 - 2 * value);
}


function updateOpeningTransition() {

    const rect = openingSection.getBoundingClientRect();

    /*
    Pin the composition during the transition.
    Release it at the end.
    */

    const scrollableDistance =
        openingSection.offsetHeight - window.innerHeight;

    const scrolled = clamp(
        -rect.top,
        0,
        scrollableDistance
    );

    const progress = scrollableDistance > 0
        ? scrolled / scrollableDistance
        : 0;

    const easedProgress = smoothstep(progress);


    /* ---------------------------------
       KEEP THE VISUAL FIXED
    --------------------------------- */

    if (scrolled >= scrollableDistance) {

        openingVisual.style.position = "absolute";

        openingVisual.style.top =
            `${openingSection.offsetHeight - openingVisual.offsetHeight}px`;

        openingVisual.style.left = "0";

    } else {

        openingVisual.style.position = "fixed";
        openingVisual.style.top = "0";
        openingVisual.style.left = "0";
    }


    /* ---------------------------------
       IMAGE OPACITY
    --------------------------------- */

    const startingOpacity = 0.2;
    const endingOpacity = 1;

    const imageOpacity =
        startingOpacity +
        (endingOpacity - startingOpacity) * easedProgress;

    frameA.style.opacity = imageOpacity;


    /* ---------------------------------
       IMAGE ZOOM
    --------------------------------- */

    const startingZoom = 1.75;
    const endingZoom = 8.0;

    const zoom =
        startingZoom +
        (endingZoom - startingZoom) * easedProgress;

    // Horizontal and vertical positions in pixels
const startingX =26;
const endingX = 20;

const startingY = 0;
const endingY = -20;

const x = startingX + (endingX - startingX) * easedProgress;
const y = startingY + (endingY - startingY) * easedProgress;

frameA.style.transform =
    `scale(${zoom}) translate(${x}px, ${y}px)`;


    /* ---------------------------------
       POEM FADE
    --------------------------------- */

    const otherLinesOpacity = 1 - easedProgress;

    poemLines.forEach(line => {
        line.style.opacity = otherLinesOpacity;
    });
}


/* =====================================
   SCROLL LISTENERS
===================================== */

window.addEventListener(
    "scroll",
    updateOpeningTransition,
    { passive: true }
);

document.addEventListener(
    "scroll",
    updateOpeningTransition,
    { passive: true }
);

document.body.addEventListener(
    "scroll",
    updateOpeningTransition,
    { passive: true }
);

window.addEventListener(
    "resize",
    updateOpeningTransition
);


/* =====================================
   INITIAL SETUP
===================================== */

updateOpeningTransition();

/* ==================================
   PATH + LEGS SCROLL SEQUENCE
================================== */

const blackSection = document.querySelector("#blackSection");
const blackStage = document.querySelector("#blackStage");
const blackSectionText = document.querySelector("#blackSectionText");
const pathContainer = document.querySelector(".path-container");
const pathA = document.querySelector("#pathA");
const pathB = document.querySelector("#pathB");
const legsFrame = document.querySelector("#legsFrame");

const TOTAL_PATHS = 9;
const TOTAL_LEGS = 38;

// Each path image's display interval and transition duration,
// measured in screen-heights.
const PATH_HOLD = 8;
const PATH_TRANSITION = 5;

// First screen-height is reserved for fading the text.
const TEXT_FADE_SCREENS = 1;

// Total path sequence length:
// 9 images × 8 screens + 8 transitions × 5 screens = 112 screens.
const PATH_SEQUENCE_SCREENS =
    TOTAL_PATHS * PATH_HOLD +
    (TOTAL_PATHS - 1) * PATH_TRANSITION;

// Preload path images.
const pathImages = [];

for (let i = 1; i <= TOTAL_PATHS; i++) {
    const img = new Image();
    img.src = `images10/path_${i}.jpg`;
    pathImages.push(img);
}

// Preload legs images progressively.
const legsImages = new Array(TOTAL_LEGS);
let legsPreloadedUntil = 0;

function preloadLegsThrough(frameNumber) {
    const target = Math.min(TOTAL_LEGS, frameNumber + 8);

    while (legsPreloadedUntil < target) {
        legsPreloadedUntil++;

        const img = new Image();
        img.src = `images5/legs_${legsPreloadedUntil}.jpg`;

        legsImages[legsPreloadedUntil - 1] = img;
    }
}

preloadLegsThrough(1);

function clampValue(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function smoothValue(value) {
    value = clampValue(value, 0, 1);
    return value * value * (3 - 2 * value);
}

function updateBlackSection() {
    if (!blackSection || !blackStage) return;

    const rect = blackSection.getBoundingClientRect();
    const screenHeight = window.innerHeight;
    const maxScroll = blackSection.offsetHeight - screenHeight;

    const sectionScroll = clampValue(
        -rect.top,
        0,
        maxScroll
    );

    const screensScrolled = sectionScroll / screenHeight;

    /* ---------------------------------
       PIN THE STAGE TO THE VIEWPORT
    --------------------------------- */

    if (rect.top > 0) {
        // Before the second section begins.
        blackStage.style.position = "absolute";
        blackStage.style.top = "0";
        blackStage.style.left = "0";
    } else if (rect.bottom > screenHeight) {
        // During the sequence, keep the stage in place.
        blackStage.style.position = "fixed";
        blackStage.style.top = "0";
        blackStage.style.left = "0";
    } else {
        // After the sequence, anchor the stage to the section's end.
        blackStage.style.position = "absolute";
        blackStage.style.top = `${maxScroll}px`;
        blackStage.style.left = "0";
    }

    /* ---------------------------------
   1. FADE OUT TEXT AND FADE IN PATH_1
--------------------------------- */

const textProgress = smoothValue(
    screensScrolled / TEXT_FADE_SCREENS
);

blackSectionText.style.opacity = 1 - textProgress;

// During the first screen-height, fade in path_1
// at exactly the same rate that the text fades out.
if (screensScrolled < TEXT_FADE_SCREENS) {
    pathContainer.style.opacity = 1;
    pathA.src = "images10/path_1.jpg";
    pathB.src = "images10/path_1.jpg";

    pathA.style.opacity = textProgress;
    pathB.style.opacity = 0;
}

/* ---------------------------------
   2. PATH IMAGE SEQUENCE
--------------------------------- */

// Begin the timed photo sequence after the text fade finishes.
const pathScreensScrolled = Math.max(
    0,
    screensScrolled - TEXT_FADE_SCREENS
);

let basePath = 0;
let fade = 0;

if (pathScreensScrolled < PATH_HOLD) {

    // Hold path_1 for the first 8 screen-heights.
    basePath = 0;
    fade = 0;

} else {

    // Each subsequent cycle consists of:
    // 4 screen-heights of crossfade + 8 screen-heights of holding.
    const elapsed = pathScreensScrolled - PATH_HOLD;
    const cycleLength = PATH_TRANSITION + PATH_HOLD;

    const cycle = Math.floor(elapsed / cycleLength);
    const withinCycle = elapsed % cycleLength;

    basePath = Math.min(cycle + 1, TOTAL_PATHS - 1);

    if (basePath >= TOTAL_PATHS - 1) {

        // Once path_9 is reached, keep it visible.
        basePath = TOTAL_PATHS - 1;
        fade = 0;

    } else if (withinCycle < PATH_TRANSITION) {

        // Crossfade smoothly over exactly 4 screen-heights.
        fade = smoothValue(
            withinCycle / PATH_TRANSITION
        );

    } else {

        // Hold the new image until the next transition.
        fade = 0;
    }
}

// Only construct filenames from path_1.jpg through path_9.jpg.
const nextPath = Math.min(
    basePath + 1,
    TOTAL_PATHS - 1
);

pathA.src = `images10/path_${basePath + 1}.jpg`;
pathB.src = `images10/path_${nextPath + 1}.jpg`;

// Once the introductory text fade is over, show the timed sequence.
if (screensScrolled >= TEXT_FADE_SCREENS) {
    pathContainer.style.opacity = 1;
    pathA.style.opacity = 1 - fade;
    pathB.style.opacity = fade;
}

    /* ---------------------------------
   3. ADVANCE THE LEGS IMAGE SEQUENCE
--------------------------------- */

const legsProgress = clampValue(
    pathScreensScrolled / PATH_SEQUENCE_SCREENS,
    0,
    1
);

const legsIndex = Math.round(
    legsProgress * (TOTAL_LEGS - 1)
);

const legsFrameNumber = legsIndex + 1;

// Preload nearby legs frames.
preloadLegsThrough(legsFrameNumber);

// Determine which folder contains this frame.
const folderNumber = 5 + Math.floor((legsFrameNumber - 1) / 50);

// Construct the correct image path.
const newLegsSrc =
    `images${folderNumber}/legs_${legsFrameNumber}.jpg`;

// Update the displayed image when the frame changes.
if (
    !legsFrame.dataset.currentSrc ||
    legsFrame.dataset.currentSrc !== newLegsSrc
) {
    legsFrame.src = newLegsSrc;
    legsFrame.dataset.currentSrc = newLegsSrc;
}

// Show the text as the legs reach their final position
const finalLegsText = document.querySelector("#finalLegsText");

finalLegsText.style.opacity = smoothValue(
    clampValue((legsProgress - 0.95) / 0.05, 0, 1)
);

/* ---------------------------------
   4. MOVE THE LEGS UP AND SHRINK THEM
--------------------------------- */

const moveProgress = smoothValue(legsProgress);

const startScale = 1;
const endScale = 0.08;

const scale =
    startScale + (endScale - startScale) * moveProgress;

// Adjust the final photo's position
const finalPositionY = -8; // Vertical position in pixels
const finalPositionX = -10;  // Horizontal position in pixels

legsFrame.style.bottom = "0";

legsFrame.style.transform =
    `translateX(calc(-50% + ${moveProgress * finalPositionX}px)) translateY(${-moveProgress * window.innerHeight * 0.35 + moveProgress * finalPositionY}px) scale(${scale})`;
}

window.addEventListener(
    "scroll",
    updateBlackSection,
    { passive: true }
);

window.addEventListener("resize", updateBlackSection);

updateBlackSection();