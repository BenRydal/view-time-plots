// SAMPLE DATA formatted as: { directory, data file, video platform, video params (see Video Player Interface) }
// const example_1 = ['data/example-1/', 'units.csv', 'Youtube', {
//     videoId: 'Iu0rxb-xkMk'
// }];
const example_1 = ["data/example-1/units.csv", "HjBvwRSG_jY"]; // params are file path and YouTube id
const example_2 = ["data/example-2/units.csv", "agUUzmtjsR0"]; // params are file path and YouTube id
const example_3 = ["data/example-3/units.csv", "S8IJKA7t9cE"]; // params are file path and YouTube id
const example_4 = ["data/example-4/units.csv", "bOT48kMRL1g"]; // params are file path and YouTube id
const example_5 = ["data/example-5/units.csv", "9Qa1T4pwUYo"]; // params are file path and YouTube id
const example_6 = ["data/example-6/units.csv", "vhthoOHXMSI"]; // params are file path and YouTube id

// TODO: remove?
const vidLength = 119; // video length in seconds
const analystLength = 3300; // max value in seconds across all analyst videos
let dataValues = []; // list to hold all unit objects
let view = true; // normal or rescaled view
const baseRectSize = 0.5; // base pixel size of width/height of rects

class Unit {
    constructor(playMethod, tStartVid, tEndVid, tStartAnalyst, tEndAnalyst) {
        this.playMethod = playMethod;
        this.tStartVid = tStartVid;
        this.tEndVid = tEndVid;
        this.tStartAnalyst = tStartAnalyst;
        this.tEndAnalyst = tEndAnalyst;
    }
}

// TIME PLOT SCALES
let xPosVidScale_1;
let xPosVidScale_2;
let yPosAnalystScale_1;
let yPosAnalystScale_2;
let analystScaleLength;
let keyXPos, keyYPos;

// VIDEO
let movie; // global holder for movie element--youtube, Kaltura and File Player coordinate around this
let videoPlayer; // instantiated in setupMovie method, used to manipulate video (play, pause, seek, etc.)
let videoIsPlaying = false; // boolean for video playing or stopped
let videoIsShowing = false; // boolean for showing/hiding video
let xPosVideo, yPosVideo, videoWidth, videoHeight;

function setup() {
    canvas = createCanvas(window.innerWidth, window.innerHeight, P2D);
    setScales();
    loadExample(example_5);
    rectMode(CORNERS);
}

function draw() {
    // background, scales
    background(255);
    noStroke();
    // Loop through table and draw rects
    for (let i = 0; i < dataValues.length; i++) {
        let u = dataValues[i]; // get unit
        fill(setRectColor(u.playMethod));
        if (view) drawNormalRects(u);
        else drawScaledRects(u, i);
    }

    drawVideoCursorLine();

    drawKeys();

    strokeWeight(1);
    stroke(0);
    textSize(20);
    line(xPosVidScale_1, yPosAnalystScale_1, xPosVidScale_2, yPosAnalystScale_1); // Video scale/x-axis
    //line(xPosVidScale_1, yPosAnalystScale_1, xPosVidScale_1, yPosAnalystScale_2); // Analyst scale/Y-axis

    drawLineWithTicks(xPosVidScale_1, yPosAnalystScale_1, xPosVidScale_1, yPosAnalystScale_2, analystLength, 300, 10); // Analyst scale/Y-axis

    fill(0);
    text("0", xPosVidScale_1 - 2 * textWidth("0"), 10); // Draw the text next to the tick mark
    text("1:59", xPosVidScale_2, 10); // Draw the text next to the tick mark
}

function mousePressed() {
    if (overRect(xPosVidScale_1, yPosAnalystScale_1, xPosVidScale_2, yPosAnalystScale_2)) {
        const seekTime = map(mouseY, yPosAnalystScale_1, yPosAnalystScale_2, 0, analystLength);
        seekTo(seekTime);
        play();
    }
}

function overRect(x, y, width, height) {
    return mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height;
}

function drawLineWithTicks(x1, y1, x2, y2, totalSeconds, intervalSeconds, tickLen) {
    // Draw the main line
    line(x1, y1, x2, y2);

    // Calculate the number of intervals
    let numIntervals = totalSeconds / intervalSeconds;

    // Draw the ticks and the text
    for (let i = 0; i <= numIntervals; i++) {
        let y = lerp(y1, y2, i / numIntervals);
        stroke(0);
        line(x1 - tickLen / 2, y, x1 + tickLen / 2, y); // Draw the tick mark

        let totalSecondsAtTick = i * intervalSeconds;
        let minutes = floor(totalSecondsAtTick / 60);
        let seconds = totalSecondsAtTick % 60;
        let timeText = nf(minutes, 2) + ":" + nf(seconds, 2);

        noStroke();
        fill(0);
        textSize(12);
        text(timeText, x1 - tickLen - textWidth(timeText), y); // Draw the text next to the tick mark
    }
}

function drawVideoCursorLine() {
    // Draw video cursor line on Plot
    // Get mapped value in seconds to greatest video size, then map it to pixels on analyst timeline
    // let yPosSeconds = map(videoPlayer.getCurrentTime(), 0, videoPlayer.getDuration(), 0, analystLength);
    stroke(150);
    strokeWeight(2);
    let yPosPixels = map(videoPlayer.getCurrentTime(), 0, analystLength, yPosAnalystScale_1, yPosAnalystScale_2);
    drawDottedLine(xPosVidScale_1, yPosPixels, xPosVidScale_2, yPosPixels, 20);
}

function drawDottedLine(x1, y1, x2, y2, spacing) {
    let distance = dist(x1, y1, x2, y2);
    let numDots = distance / spacing;

    for (let i = 0; i < numDots; i++) {
        let xStart = lerp(x1, x2, i / numDots);
        let yStart = lerp(y1, y2, i / numDots);
        let xEnd = lerp(x1, x2, (i + 0.5) / numDots);
        let yEnd = lerp(y1, y2, (i + 0.5) / numDots);
        line(xStart, yStart, xEnd, yEnd);
    }
}

function setRectColor(method) {
    if (method === "jrev") return "#756bb1"; // dark purple
    else if (method === "frev") return "#bcbddc"; // mid purple
    else if (method === "srev") return "#efedf5"; // light purple
    else if (method === "still") return "#000000"; // black
    else if (method === "sfwd") return "#feedde"; // light light orange
    else if (method === "play") return "#fdbe85"; // light orange
    else if (method === "ffwd") return "#fd8d3c"; // mid orange
    else if (method === "jfwd") return "#d94701"; // dark orange
    else return 0;
}

function drawKeys() {
    textSize(20);
    const methodColors = ["#756bb1", "#bcbddc", "#efedf5", "#000000", "#feedde", "#fdbe85", "#fd8d3c", "#d94701"];
    const methods = ["jrev", "frev", "srev", "still", "sfwd", "play", "ffwd", "jfwd"];
    let xPosUpdate = 0;
    for (let i = 0; i < methods.length; i++) {
        noStroke();
        fill(0);
        text(methods[i], keyXPos + xPosUpdate, keyYPos);
        fill(methodColors[i]);
        rect(keyXPos + xPosUpdate, 10 + keyYPos, xPosUpdate + keyXPos + 50, 10 + keyYPos + 50);
        xPosUpdate += 2 * textWidth(methods[i]);
    }
}

function drawNormalRects(unit) {
    let x1 = Math.floor(map(unit.tStartVid, 0, vidLength, xPosVidScale_1, xPosVidScale_2));
    let x2 = Math.floor(map(unit.tEndVid, 0, vidLength, xPosVidScale_1, xPosVidScale_2)); // rect width
    let y1 = Math.floor(map(unit.tStartAnalyst, 0, analystLength, yPosAnalystScale_1, yPosAnalystScale_2));
    let y2 = Math.floor(map(unit.tEndAnalyst, 0, analystLength, yPosAnalystScale_1, yPosAnalystScale_2)); // rect height
    // base rect width/height is at least 1 pixel
    if (x2 - x1 == 0) x2 = x1 - baseRectSize;
    if (y2 - y1 == 0) y2 = y1 - baseRectSize;
    rect(x1, y1, x2, y2); // draw scaled rect
}

function drawScaledRects(unit, rowNum) {
    let ySpacing = analystScaleLength / dataValues.length;
    let rectWidth = 5;
    let x1 = floor(map(unit.tStartVid, 0, vidLength, xPosVidScale_1, xPosVidScale_2));
    let x2 = floor(map(unit.tEndVid, 0, vidLength, xPosVidScale_1, xPosVidScale_2)); // rect width
    let y1 = yPosAnalystScale_1 + ySpacing * rowNum;
    let y2 = ySpacing * rowNum + rectWidth + yPosAnalystScale_1;
    rect(x1, y1, x2, y2); // draw scaled rect
}
