import '/style.css'

import "p5"

import { onResults, setOptions, showVideo, keys } from "./mediapipe-simplifier"

let contentHtmlCam = document.querySelector('#contentPart1')
let contentHtmlTouch = document.querySelector('#contentPart2')

const videoMode = true

let detected = false

let oldDistance
let newDistance = 0

let landmarks = []

let txtClassName = 'word'
let text = [
  {
    el : document.createElement('p'),
    contentTxt : 'be',
    id : 'be'
  },
  {
    el : document.createElement('p'),
    contentTxt : 'care',
    id : 'care'
  },
  {
    el : document.createElement('p'),
    contentTxt : 'full',
    id : 'full'
  }
]

let color = [
  { // ROSE
    pastel : "rgb(248, 163, 230)",
    fluo : "rgb(255, 0, 255)"
  },
  { // BLEU
    pastel : "rgb(40, 142, 255)",
    fluo : "rgb(40, 53, 255)"
  },
  { // ORANGE
    pastel : "rgb(255, 132, 12)",
    fluo : "rgb(255, 66, 0)"
  },
  { // VERT
    pastel : "rgb(169, 238, 138)",
    fluo : "rgb(0, 255, 0)"
  }

]

window.setup = () => {
  windowResized()
  showVideo(videoMode)
  window.addEventListener("touchstart", fingerDown);
  window.addEventListener("touchmove", fingerDown);
  window.addEventListener("touchend", fingerUp);
  
  // CREATE HTML CONTENT
  // Cam content
  for(let i = 0; i < text.length; i++){
    let elDivCase = document.createElement('div');
    elDivCase.setAttribute('id', text[i].id)
    elDivCase.setAttribute('class', 'content-case')
    contentHtmlCam.appendChild(elDivCase)

    let elDivText = document.createElement('div');
    elDivText.setAttribute('class', 'content-text')
    elDivCase.appendChild(elDivText)

    text[i].el.textContent = text[i].contentTxt
    text[i].el.setAttribute('class', txtClassName)
    elDivText.appendChild(text[i].el);
  }

  // Touch content
  for(let i = 0; i < text.length; i++){
    // let elDivCase = document.createElement('div');
    // elDivCase.setAttribute('id', text[i].id)
    // elDivCase.setAttribute('class', 'content-case')
    // contentHtmlTouch.appendChild(elDivCase)

    // let elDivText = document.createElement('div');
    // elDivText.setAttribute('class', 'content-text')
    // elDivCase.appendChild(elDivText)

    // text[i].el.textContent = text[i].contentTxt
    // text[i].el.setAttribute('class', txtClassName)
    // elDivText.appendChild(text[i].el);
  }

  camAnimation()
}

function camAnimation(){
  if (detected) {
    // receip ear's position and calculate distance
    const leftEar = toCanvas(landmarks[keys.LEFT_EAR])
    const rightEar = toCanvas(landmarks[keys.RIGHT_EAR])
    calculateDistance(leftEar.x, rightEar.x)

    // display txt
    contentHtmlCam.classList.remove('hidden');

    // animation when ppl come closer from device
    // TXT SETTINGS
    let scaleTxt = parseInt(map(newDistance, 0, 8, 1, 3))
    let elWord = document.getElementsByClassName('word')

    // COLOR SETTINGS
    let colorAleat = Math.floor(random(0, 4))

    for(let i = 0; i < elWord.length; i++){
      elWord[i].style.transform = `scaleX(2) scaleY(${scaleTxt})`
      if(oldDistance != newDistance){
        elWord[i].style.color = color[colorAleat].fluo
      }
    }
  }else{
    // hide txt
    contentHtmlCam.classList.add('hidden');
  }

  requestAnimationFrame(camAnimation);
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

function calculateDistance(left, right){
    oldDistance = newDistance

    newDistance = Math.floor(right - left)
    newDistance = map(newDistance, 0, 200, 0, 1)
    newDistance = parseInt(newDistance * 10)

    //console.log(newDistance);
}

function fingerDown(){
  contentHtmlCam.style.display = 'none';
  contentHtmlTouch.classList.remove('hidden');
}

function fingerUp(){
  contentHtmlCam.style.display = 'initial';
  contentHtmlTouch.classList.add('hidden');
}