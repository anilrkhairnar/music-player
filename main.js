// Get Element Function
const getElement = (elementName) => document.querySelector(elementName);

// Features Close Button
const close = document.querySelectorAll(".dots .close");
const blurBox = getElement(".blur-box");

// Visualizer Elements
const tuneIcon = getElement(".tune");
const left = getElement(".left");
const right = getElement(".right");
const circle = getElement(".circle");

// Progress Bar
const progressArea = getElement(".progress-area");
const progressBar = getElement(".progress-bar");

// Current Song Info
const currentSongName = getElement(".current-song-name");
const currentSongAlbum = getElement(".current-song-album");
const currentSongFav = getElement(".song-info .fa-heart");

// Music Controllers
const playPauseBtn = getElement(".play-pause");
const prevBtn = getElement(".prev");
const nextBtn = getElement(".next");

// Playlist
const playlist = getElement(".playlist");

// Favorite Icon
let favSong;

let playlistSong;

let audio = getElement("#audio");

let analyser;
let audioSource;

let isPlaying = false;
let currentSong = 0;

//  Get Audio Context
const ctx = new window.AudioContext() || window.webkitAudioContext();

// Features Close Button Event
close.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    blurBox.classList.add("hidden");
  });
});

// Get Song Duration
audio.addEventListener("loadeddata", () => {
  let audioDuration = audio.duration;
  let minTime = Math.floor(audioDuration / 60);
  let secTime = Math.floor(audioDuration % 60);

  if (secTime < 10) {
    secTime = `0${secTime}`;
  }

  document.querySelector(
    ".timer .duration"
  ).textContent = `${minTime}:${secTime}`;
});

// Updating Current Time
audio.addEventListener("timeupdate", (e) => {
  const currentTime = e.target.currentTime;
  const duration = e.target.duration;

  let progressWidth = (currentTime / duration) * 100;

  progressBar.style.width = `${progressWidth}%`;

  let audioTime = currentTime;
  let minTime = Math.floor(audioTime / 60);
  let secTime = Math.floor(audioTime % 60);

  if (secTime < 10) {
    secTime = `0${secTime}`;
  }

  document.querySelector(
    ".timer .current"
  ).textContent = `${minTime}:${secTime}`;
});

// Event on Progress Bar Click
progressArea.addEventListener("click", (e) => {
  let areaWidth = progressArea.clientWidth;
  let clickOffsetX = e.offsetX;

  let songDuration = audio.duration;

  audio.currentTime = (clickOffsetX / areaWidth) * songDuration;

  playPause(true);
});

// Event on Favorite btn
currentSongFav.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  let song = favSong[currentSong];

  if (song.favorite) {
    song.classList.remove("fa-solid");
    song.classList.add("fa-regular");

    currentSongFav.classList.remove("fa-solid");
    currentSongFav.classList.add("fa-regular");

    song.favorite = false;
  } else {
    song.classList.remove("fa-regular");
    song.classList.add("fa-solid");
    currentSongFav.classList.remove("fa-regular");
    currentSongFav.classList.add("fa-solid");

    song.favorite = true;
  }
});

// Event on Prev Button
prevBtn.addEventListener("click", (e) => {
  e.preventDefault();
  playPrevSong();
});

// Event on Prev Button
nextBtn.addEventListener("click", (e) => {
  e.preventDefault();
  playNextSong();
});

// Event on Play Pause Button
playPauseBtn.addEventListener("click", (e) => {
  e.preventDefault();
  playPause();
});

// Play Pause Button
const playPause = (val) => {
  isPlaying = val === true ? true : !isPlaying;
  iconToggler();
  audioVisualizer();
};

// Play Pause Icon Toggler
const iconToggler = () => {
  if (isPlaying) {
    playPauseBtn.classList.remove("fa-play");
    playPauseBtn.classList.add("fa-pause");
  } else {
    playPauseBtn.classList.remove("fa-pause");
    playPauseBtn.classList.add("fa-play");
  }
};

// Keyboard Controller
document.addEventListener("keyup", (e) => {
  e.preventDefault();
  if (e.key === " ") {
    playPause();
  } else if (e.key === "ArrowLeft") {
    playPrevSong();
  } else if (e.key === "ArrowRight") {
    playNextSong();
  }
});

// Play Song function
const playCurrentSong = (index) => {
  currentSong = index;
  let song = playlistData[index];
  audio.src = song.songSource;
  currentSongName.textContent = song.songName;
  currentSongAlbum.textContent = song.songAlbum;
  if (currentSongFav.classList.contains("fa-solid")) {
    currentSongFav.classList.remove("fa-solid");
  } else {
    currentSongFav.classList.remove("fa-regular");
  }
  currentSongFav.classList.add(song.favorite ? "fa-solid" : "fa-regular");
};

// Prev Song Function
const playPrevSong = () => {
  currentSong--;
  isPlaying = true;
  iconToggler();
  if (currentSong < 0) {
    currentSong = playlistData.length - 1;

    playCurrentSong(currentSong);
    audioVisualizer();
  } else {
    playCurrentSong(currentSong);
    audioVisualizer();
  }
};

// Next Song Function
const playNextSong = () => {
  currentSong++;
  isPlaying = true;
  iconToggler();
  if (currentSong > playlistData.length - 1) {
    currentSong = 0;

    playCurrentSong(currentSong);
    audioVisualizer();
  } else {
    playCurrentSong(currentSong);
    audioVisualizer();
  }
};

// Audio Visualizer
const audioVisualizer = () => {
  if (isPlaying) {
    ctx.resume().then(() => {
      // Remove Tune Icon
      !tuneIcon.classList.contains("hidden") &&
        tuneIcon.classList.add("hidden");

      // Play Audio
      audio.play();

      // Get Audio Data
      audioSource = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser(); // Get Analyser

      audioSource.connect(analyser); // Connecting audio data to analyser
      analyser.connect(ctx.destination); // Connecting analyser to Destination(Speaker)

      analyser.fftSize = 32; // Set FFT Size
      const bufferLength = analyser.frequencyBinCount; // Analyzing Frequency Data

      let dataArray = new Uint8Array(bufferLength); // Get Data in Array

      // Creating waves
      dataArray.forEach((item) => {
        let element = document.createElement("span");
        element.classList.add("node-left");
        left.appendChild(element);
      });
      dataArray.forEach((item) => {
        let element = document.createElement("span");
        element.classList.add("node-right");
        right.appendChild(element);
      });

      const nodeLeft = document.querySelectorAll(".node-left");
      const nodeRight = document.querySelectorAll(".node-right");

      // Animate
      const animate = () => {
        requestAnimationFrame(animate); // Call Function in loop
        analyser.getByteFrequencyData(dataArray);

        nodeLeft.forEach((element, i) => {
          if (isPlaying) {
            let item = dataArray[i];
            element.style.height = `${item / 3}px`;
            element.style.backgroundColor = `#7B57E4`;
          }
        });
        nodeRight.forEach((element, i) => {
          if (isPlaying) {
            let item = dataArray[i];
            element.style.height = `${item / 3}px`;
            element.style.backgroundColor = `#FFFFFF`;
          }
        });
      };

      animate();
    });
  } else if (!isPlaying) {
    ctx.suspend().then(() => {
      // Pause Audio
      audio.pause();
    });
  }
};

// Load Playlist
window.addEventListener("load", () => {
  playlistData.forEach((song) => {
    // Create Elements
    let parentElemSong = document.createElement("div");
    let elemSongData = document.createElement("div");
    let cover = document.createElement("div");
    let img = document.createElement("img");
    let info = document.createElement("div");
    let songName = document.createElement("h3");
    let album = document.createElement("span");
    let i = document.createElement("i");

    // Add Classes and Source
    parentElemSong.classList.add("song");
    elemSongData.classList.add("song-data");
    cover.classList.add("cover");
    info.classList.add("info");
    songName.classList.add("song-name");
    album.classList.add("album");
    i.classList.add(song.favorite ? "fa-solid" : "fa-regular", "fa-heart");

    img.src = "./assets/images/music-icon.svg";
    img.alt = "music-icon";

    // Append Child to Parent
    parentElemSong.appendChild(elemSongData);
    elemSongData.appendChild(cover);
    elemSongData.appendChild(info);
    cover.appendChild(img);
    info.appendChild(songName);
    info.appendChild(album);
    parentElemSong.appendChild(i);

    // Inset Data
    songName.textContent = song.songName;
    album.textContent = song.songAlbum;

    // Inject in HTML
    playlist.appendChild(parentElemSong);
  });

  // Load Initial Song and Data
  playCurrentSong(currentSong);
  playlistSong = document.querySelectorAll(".song");
  favSong = document.querySelectorAll(".song .fa-heart");

  // Event on Playlist songs
  playlistSong.forEach((song, index) => {
    song.addEventListener("click", () => {
      isPlaying = true;
      iconToggler();
      playCurrentSong(index);
      audioVisualizer();
    });
  });

  // Event on Favorite Button
  favSong.forEach((song, index) => {
    song.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (playlistData[index].favorite) {
        song.classList.remove("fa-solid");
        song.classList.add("fa-regular");

        if (index == currentSong) {
          currentSongFav.classList.remove("fa-solid");
          currentSongFav.classList.add("fa-regular");
        }

        playlistData[index].favorite = false;
      } else {
        song.classList.remove("fa-regular");
        song.classList.add("fa-solid");
        if (index == currentSong) {
          currentSongFav.classList.remove("fa-regular");
          currentSongFav.classList.add("fa-solid");
        }
        playlistData[index].favorite = true;
      }
    });
  });
});
