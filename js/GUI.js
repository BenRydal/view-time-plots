function keyPressed() {
    if (key === 's' || key === 'S') view = !view;
}

function setScales() {
    xPosVidScale_1 = genSpacing;
    xPosVidScale_2 = width/6;
    yPosAnalystScale_1 = genSpacing;
    yPosAnalystScale_2 = height - genSpacing;
    analystScaleLength = yPosAnalystScale_2 - yPosAnalystScale_1;
    xPosVideo = width/4;
    yPosVideo = genSpacing;
    videoWidth = width/2;
    videoHeight = height/2;
}