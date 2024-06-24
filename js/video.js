function processYTVideo(id) {
    noLoop(); // stop program loop while loading video, restarted upon video loaded in videoPlayer or in processVideoFile if loading from file
    // if first time player loaded at program start it will be undefined, don't destroy exisiting player and remove exisiting movie element
    if (videoPlayer !== undefined) {
        videoPlayer.destroy();
        movie.remove();
    }
    movie = createDiv(); // create the div that will hold the video if other player
    movie.id("moviePlayer");
    // movie.hide();
    setupMovie("moviePlayer", id); // set up the video player
    let video = select("#moviePlayer").position(xPosVideo, yPosVideo); // position video
    let iFrameID = document.getElementById("moviePlayer");
    iFrameID.width = videoWidth;
    iFrameID.height = videoHeight;
}

// Initialization for the video player
function setupMovie(movieDiv, id) {
    // 'moviePlyaer' is the div/id and id is web link
    videoPlayer = new YT.Player(movieDiv, {
        videoId: id,
        playerVars: {
            //controls: 0, // hides controls on the video
            disablekb: 1, // disables keyboard controls on the video
        },
        events: {
            onReady: onPlayerReady,
        },
    });
}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
    // event.target.playVideo();
    loop(); // restart p5 draw loop once loaded
    console.log("YT player ready: ");
}

function seekTo(time) {
    videoPlayer.seekTo(time, true);
}

function play() {
    videoPlayer.playVideo();
}

function pause() {
    videoPlayer.pauseVideo();
}

// // Plays/pauses video and toggles videoIsPlaying
// function playPauseMovie() {
//     if (videoIsPlaying) {
//         videoPlayer.pause();
//         videoIsPlaying = false;
//     } else {
//         let mPos = map(mouseX, timelineStart, timelineEnd, currPixelTimeMin, currPixelTimeMax); // first map mouse to selected time values in GUI
//         // must floor vPos to prevent double finite error
//         let vPos = Math.floor(map(mPos, timelineStart, timelineEnd, 0, Math.floor(videoPlayer.getVideoDuration())));
//         print(vPos);
//         videoPlayer.play();
//         videoPlayer.seekTo(vPos);
//         videoIsPlaying = true;
//     }
// }

// // Updates time selected in video depending on mouse position or animation over timeline
// function updateVideoScrubbing() {
//     if (animation) {
//         let startValue = map(currPixelTimeMin, timelineStart, timelineEnd, 0, Math.floor(videoPlayer.getVideoDuration())); // remap starting point to seek for video
//         let endValue = map(currPixelTimeMax, timelineStart, timelineEnd, 0, Math.floor(videoPlayer.getVideoDuration())); // remap starting point to seek for video
//         let vPos = Math.floor(map(bugTimePosForVideo, timelineStart, timelineEnd, startValue, endValue));
//         videoPlayer.seekTo(vPos);
//     } else if (overRect(timelineStart, 0, timelineEnd, timelineHeight)) {
//         let mPos = map(mouseX, timelineStart, timelineEnd, currPixelTimeMin, currPixelTimeMax); // first map mouse to selected time values in GUI
//         // must floor vPos to prevent double finite error
//         let vPos = Math.floor(map(mPos, timelineStart, timelineEnd, 0, Math.floor(videoPlayer.getVideoDuration())));
//         videoPlayer.seekTo(vPos);
//     }
// }
