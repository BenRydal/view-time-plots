function keyPressed() {
    if (key === 's' || key === 'S') view = !view;
}

function setScales() {
    const spacing = 50;
    xPosVidScale_1 = spacing;
    xPosVidScale_2 = width / 2 - spacing;
    yPosAnalystScale_1 = spacing;
    yPosAnalystScale_2 = height - 3 * spacing;
    analystScaleLength = yPosAnalystScale_2 - yPosAnalystScale_1;
    xPosVideo = width / 2 + spacing;
    yPosVideo = spacing;
    videoWidth = width / 2 - spacing * 2;
    videoHeight = height / 2 - spacing;

    keyYPos = yPosAnalystScale_2 + spacing;
    keyXPos = xPosVidScale_1;
}