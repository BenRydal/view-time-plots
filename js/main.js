const tableHeaders = ['Method', 'TStartVid', 'TEndVid', 'TStartAnalyst', 'TEndAnalyst'];
// SAMPLE DATA formatted as: { directory, data file, video platform, video params (see Video Player Interface) }
// const example_1 = ['data/example-1/', 'units.csv', 'Youtube', {
//     videoId: 'Iu0rxb-xkMk'
// }];
const example_1 = ['data/example-1/units.csv']; // temp without video
const example_2 = ['data/example-2/units.csv']; // temp without video
const example_3 = ['data/example-3/units.csv']; // temp without video
const example_4 = ['data/example-4/units.csv']; // temp without video

// Orange, dark purple, dark green, light purple, light green 
// dark shade is fast, light shade is slow
const methodColors = ['#e66101', '#7b3294', '#008837', '#9e9ac8', '#74c476'];
const playMethods = [0, 1, 2, 3, 4]; // 0 = normal, 1 = ff, 2 == fb, 3 = sf, 4 = sb
const vidLength = 119; // video length in seconds
const analystLength = 3300; // max value in seconds across all analyst videos
let dataValues = [] // list to hold all unit objects
let view = true; // normal or rescaled view
const baseRectSize = 1; // base pixel size of width/height of rects

class Unit {
    constructor(playMethod, tStartVid, tEndVid, tStartAnalyst, tEndAnalyst) {
        this.playMethod = playMethod;
        this.tStartVid = tStartVid;
        this.tEndVid = tEndVid;
        this.tStartAnalyst = tStartAnalyst;
        this.tEndAnalyst = tEndAnalyst;
    }
}

// scale x/y positions used for drawing and scaling rects
let xPosVidScale_1 = 50;
let xPosVidScale_2 = 250;
let yPosAnalystScale_1 = 50;
let yPosAnalystScale_2 = 1000;
let analystScaleLength = yPosAnalystScale_2 - yPosAnalystScale_1;

function keyPressed() {
    view = !view;
}

function preload() {
    loadExample(example_1);
}

function setup() {
    canvas = createCanvas(window.innerWidth, window.innerHeight, P2D);
    rectMode(CORNERS);
}

function draw() {
    // background, scales
    background(255);
    stroke(0);
    line(xPosVidScale_1, yPosAnalystScale_1 - 20, xPosVidScale_2, yPosAnalystScale_1 - 20); // Video scale  
    line(xPosVidScale_1, yPosAnalystScale_1, xPosVidScale_1, yPosAnalystScale_2); // Analyst scale

    noStroke();
    // Loop through table and draw rects
    for (let i = 0; i < dataValues.length; i++) {
        let u = dataValues[i]; // get unit
        fill(setRectColor(u.playMethod));
        if (view) drawNormalRects(u);
        else drawScaledRects(u, i);
    }
}

function setRectColor(method) {
    // Loop through playMethods and return appropriate color; return white if nothing
    for (let i = 0; i < playMethods.length; i++) {
        if (i === method) return methodColors[i];
    }
    return 255;
}

function drawNormalRects(unit) {
    let x1 = Math.floor(map(unit.tStartVid, 0, vidLength, xPosVidScale_1, xPosVidScale_2));
    let x2 = Math.floor(map(unit.tEndVid, 0, vidLength, xPosVidScale_1, xPosVidScale_2)); // rect width
    let y1 = Math.floor(map(unit.tStartAnalyst, 0, analystLength, yPosAnalystScale_1, yPosAnalystScale_2));
    let y2 = Math.floor(map(unit.tEndAnalyst, 0, analystLength, yPosAnalystScale_1, yPosAnalystScale_2)); // rect height
    // base rect width/height is at least 1 pixel
    if (x2 - x1 == 0) x2 = x1 + baseRectSize;
    if (y2 - y1 == 0) y2 = y1 + baseRectSize;
    rect(x1, y1, x2, y2); // draw scaled rect
}

function drawScaledRects(unit, rowNum) {
    let ySpacing = analystScaleLength / dataValues.length;
    let rectWidth = 5;
    let x1 = floor(map(unit.tStartVid, 0, vidLength, xPosVidScale_1, xPosVidScale_2));
    let x2 = floor(map(unit.tEndVid, 0, vidLength, xPosVidScale_1, xPosVidScale_2)); // rect width
    let y1 = yPosAnalystScale_1 + (ySpacing * rowNum);
    let y2 = ySpacing * rowNum + rectWidth + yPosAnalystScale_1;
    rect(x1, y1, x2, y2); // draw scaled rect
}