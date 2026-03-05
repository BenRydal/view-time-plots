function keyPressed() {
    if (key === "s" || key === "S") view = !view;
}

function setScales() {
    const spacing = 50;
    xPosVidScale_1 = spacing;
    xPosVidScale_2 = width / 2 - spacing;
    yPosAnalystScale_1 = 0;
    yPosAnalystScale_2 = height - spacing / 2;
    analystScaleLength = yPosAnalystScale_2 - yPosAnalystScale_1;
    xPosVideo = width / 2 + spacing;
    yPosVideo = spacing;
    videoWidth = width / 2 - spacing * 2;
    videoHeight = height / 2 - spacing;

    keyYPos = yPosVideo + videoHeight;
    keyXPos = xPosVideo;
}
