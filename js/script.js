let songs;
let index;
let currFolder;
let currentSong = new Audio();
const play = document.getElementById("play");

function convertToMinutesSeconds(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`https://jagpreet141413.github.io/Spotify-clone/${currFolder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currFolder}/`)[1]);
    }
  }
  // show all the songs in playlist
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    let formattedSong = song.replaceAll("%20", " ").replaceAll("undefined", "");
    songUL.innerHTML =
      songUL.innerHTML +
      `<li> <img class="invert" src="images/music.svg" alt="">
                            <div class="info">
                                <div>${formattedSong}</div>
                                <div>Jagga</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                            </div>
                            <img class="invert" src="images/play.svg" alt="">
                            </li>`;
  }
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "images/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// Assuming cardContainer is defined somewhere in your HTML or JavaScript code

async function displayAlbums() {
  let a = await fetch(`https://jagpreet141413.github.io/Spotify-clone/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  Array.from(anchors).forEach(async (e) => {
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-1)[0];
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder=${folder} class="card ">
            <div class="play"> 
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`;
      // load the playlist whenever card is clicked
      Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async (item) => {
          await getSongs(`songs/${item.currentTarget.dataset.folder}`);
          // Now that songs are loaded, you can safely use the songs array
          // For example, you can call playMusic here
          // playMusic(songs[0], true);
        });
      });
    }
  });
}

async function main() {
  // get the list of all the songs
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  //display all the albums on the page
  displayAlbums();

  // attach event listener to play, previous, and next
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "images/play.svg";
    }
  });

  // listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${convertToMinutesSeconds(
      currentSong.currentTime * 1000
    )}/ ${convertToMinutesSeconds(currentSong.duration * 1000)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // add event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // add event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // add event listener for close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add event listener for ended event
  currentSong.addEventListener("ended", () => {
    // reset time and seekbar position to zero
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    document.querySelector(".circle").style.left = "0%";
  });
  // add event listener for previous
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
      console.log(songs);
      console.log(currentSong.src);
    }
  });

  // add event listener for next
  next.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index !== -1 && index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]);
    }
  });
  // add event listener to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  // add the event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}
main();
