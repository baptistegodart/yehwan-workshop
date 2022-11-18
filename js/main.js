import '/styleGlobal.css'
import '/stylePart1.css'
import '/stylePart2.css'

import "p5"

import { onResults, setOptions, showVideo, keys } from "./mediapipe-simplifier"
import StateMachine from 'javascript-state-machine';

let touchY = 0

const stater = new StateMachine({
  init: 'webcam',
  transitions: [
    { name: 'touchStart', from: 'webcam', to: 'touching' },
    { name: 'touchEnd', from: ['webcam', 'touching'], to: 'webcam' },
  ],
  methods: {
    onTouchStart: function () {
      textCam.classList.add('hidden');
      contentHtmlTouch.classList.remove('hidden')
      firstAnim = false
      scdAnim = true

      // let elWord = document.getElementsByClassName('font')
      // for (let i = 0; i < elWord.length; i++) {
      //   let colorAleat = Math.floor(random(0, 4))
      //   elWord[i].style.color = colors[colorAleat].fluo
      // }

      // let video1 = document.getElementById('video0')
      // let video2 = document.getElementById('video1')
      // video1.src = selectRandomVideo()
      // video2.src = selectRandomVideo()

    },
    onTouchEnd: function () {
      contentHtmlTouch.classList.add('hidden')
      firstAnim = true
      scdAnim = false;
    },
  }
});

const debugMode = true

let detected = false

let oldDistance
let newDistance = 0

let landmarks = []

let firstAnim = true
let scdAnim = false

// First part var
let textCam = document.querySelector('#contentPart1')
let txtClassName = 'word-cam'
let textPart1 = [
  {
    el: document.createElement('p'),
    contentTxt: 'be',
    id: 'be'
  },
  {
    el: document.createElement('p'),
    contentTxt: 'care',
    id: 'care'
  },
  {
    el: document.createElement('p'),
    contentTxt: 'full',
    id: 'full'
  }
]
let colors = [
  { // ROSE
    pastel: "rgb(248, 163, 230)",
    fluo: "rgb(255, 0, 255)"
  },
  { // BLEU
    pastel: "rgb(40, 142, 255)",
    fluo: "rgb(40, 53, 255)"
  },
  { // ORANGE
    pastel: "rgb(255, 132, 12)",
    fluo: "rgb(255, 66, 0)"
  },
  { // VERT
    pastel: "rgb(169, 238, 138)",
    fluo: "rgb(0, 255, 0)"
  }

]

// Scd part var
let contentHtmlTouch = document.querySelector('#contentPart2')
let textPart2 = [
  {
    el: document.createElement('p'),
    contentTxt: 'be',
    id: 'be'
  },
  {
    el: document.createElement('p'),
    contentTxt: 'care',
    id: 'care'
  }
]
let videos = [
  { // ROSE
    src: "/videos/4.mp4"
  },
  { // BLEU
    src: "/videos/1.mp4"
  },
  { // ORANGE
    src: "/videos/3.mp4"
  },
  { // VERT
    src: "/videos/2.mp4"
  }
  // { // ROSE
  //   src: "/videos/webm/4.webm"
  // },
  // { // BLEU
  //   src: "/videos/webm/1.webm"
  // },
  // { // ORANGE
  //   src: "/videos/webm/3.webm"
  // },
  // { // VERT
  //   src: "/videos/webm/2.webm"
  // }

]

window.setup = () => {
  windowResized()
  showVideo(debugMode)
  window.addEventListener("touchstart", fingerDown);
  window.addEventListener("touchmove", fingerMove, true);
  window.addEventListener("touchend", fingerUp);

  // CREATE HTML CONTENT
  // Cam content
  for (let i = 0; i < textPart1.length; i++) {
    let elDivCaseCam = document.createElement('div')
    elDivCaseCam.setAttribute('class', 'content-case-cam')
    elDivCaseCam.setAttribute('id', textPart1[i].id)
    textCam.appendChild(elDivCaseCam)

    let elDivTextCam = document.createElement('div')
    elDivTextCam.setAttribute('class', 'content-text-cam')
    elDivCaseCam.appendChild(elDivTextCam)

    textPart1[i].el.textContent = textPart1[i].contentTxt
    textPart1[i].el.setAttribute('class', txtClassName)
    elDivTextCam.appendChild(textPart1[i].el);
    console.log(textPart1[i].contentTxt);
  }

  // Touch content
  for (let i = 0; i < textPart2.length; i++) {
    let elDivCaseTouch = document.createElement('div')
    elDivCaseTouch.setAttribute('id', `${textPart2[i].id}-case`)
    elDivCaseTouch.setAttribute('class', 'content-case')
    contentHtmlTouch.appendChild(elDivCaseTouch)

    let elVideoTouch = document.createElement('video')
    elVideoTouch.setAttribute('id', `video${i}`)
    elVideoTouch.setAttribute('playsinline','');
    elVideoTouch.src = selectRandomVideo()
    elVideoTouch.autoplay = true;
    elVideoTouch.loop = true;
    elVideoTouch.muted = true;
    elDivCaseTouch.appendChild(elVideoTouch)

    let elDivTextTouch = document.createElement('div')
    elDivTextTouch.setAttribute('class', 'content-text')
    elDivCaseTouch.appendChild(elDivTextTouch)

    textPart2[i].el.textContent = textPart2[i].contentTxt
    textPart2[i].el.setAttribute('id', textPart2[i].id)
    textPart2[i].el.setAttribute('class', 'font')
    elDivTextTouch.appendChild(textPart2[i].el);
  }

  animate()
}

function animate() {
  if (detected) {
    // receip ear's position and calculate distance
    const leftEar = toCanvas(landmarks[keys.LEFT_EAR])
    const rightEar = toCanvas(landmarks[keys.RIGHT_EAR])
    calculateDistance(leftEar.x, rightEar.x)

    // display txt
    //if (!contentHtmlTouch.classList.has('hidden'))

    // animation when ppl come closer from device
    // TXT SETTINGS
    // let scaleTxt = parseInt(map(newDistance, 0, 8, 1, 3))

    // COLOR SETTINGS
    let elWord = document.getElementsByClassName('word-cam')
    let colorAleat = Math.floor(random(0, 4))

    for (let i = 0; i < elWord.length; i++) {
      elWord[i].style.transform = `scaleX(2) scaleY(4.4) translateY(1.3vh)`
      if (oldDistance != newDistance) {
        elWord[i].style.color = colors[colorAleat].fluo
      }
    }
  }

  let posY = touchY / window.innerHeight
  posY = constrain(posY, 0, 1)

  document.body.style.setProperty('--pos-y', posY)


  if (stater.is('webcam'))
    textCam.classList.toggle('hidden', !detected);

  requestAnimationFrame(animate);

}

window.windowResized = () => {
  resizeCanvas(windowWidth, windowHeight)
}

setOptions({
  selfieMode: true,
  model: 'short',
  minDetectionConfidence: 0.5,
});

onResults(({ detections }) => {
  const firstDetection = detections[0]
  detected = Boolean(firstDetection)

  if (detected) {
    landmarks = (firstDetection.landmarks);
  }
})

function toCanvas({ x, y }) {
  return {
    x: x * width,
    y: y * height
  }
}

function calculateDistance(left, right) {
  oldDistance = newDistance

  newDistance = Math.floor(right - left)
  newDistance = map(newDistance, 0, 200, 0, 1)
  newDistance = parseInt(newDistance * 10)

  //console.log(newDistance);
}

function fingerDown(event) {
  // init changes
  touchY = event.touches[0].pageY;
  stater.touchStart()
}

function fingerMove(event) {
  event.preventDefault()
  console.log('move');
  touchY = event.touches[0].pageY;
}

function fingerUp() {
  // init changes

  stater.touchEnd()
}

function selectRandomVideo() {
  let randomIndex = parseInt(random(0, 4))
  let randomVideo = videos[randomIndex].src
  console.log(randomVideo)
  return randomVideo
}