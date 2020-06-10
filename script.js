//SPLASH PAGE INTERACTION
const splash = document.querySelector("#splash")
const splashClick = document.querySelector("#click")

splashClick.addEventListener("click", () => {
  splash.style.display = "none"
})
splashClick.addEventListener("mouseenter", () => {
  splash.style.opacity = "0.8"
})
splashClick.addEventListener("mouseleave", () => {
  splash.style.opacity = "1"
})

// AUDIO EFFECTS DEFINED AND CHAINED
const audioContext = new AudioContext()
const masterGain = audioContext.createGain()
masterGain.gain.value = 0.1
masterGain.connect(audioContext.destination)

let effects = []
for(let i = 0; i<3; i++){
  let nodeRack = {
    reverbNode: audioContext.createConvolver(),
    reverbGain: audioContext.createGain(),
    instrumentVolume: audioContext.createGain()
  }

  nodeRack.instrumentVolume.gain.value = 0.5

  //Impulse Response for Reverb Node
  const getImpulseBuffer = (audioContext, impulseUrl) => {
    return fetch(impulseUrl)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
  }
  const getLiveAudio = (audioContext) => {
    return navigator.mediaDevices.getUserMedia({audio: true})
    .then(stream => audioContext.createMediaStreamSource(stream))
  } 
  async function init(){
    nodeRack.reverbNode.buffer = await getImpulseBuffer(audioContext, 'https://res.cloudinary.com/dcttcffbc/video/upload/v1591564569/Impulse_Responses/IMreverbs/Large_Bottle_Hall.wav')
  }

  init()

  nodeRack.reverbGain.gain.value = 0
  nodeRack.reverbGain.connect(nodeRack.reverbNode)
  nodeRack.reverbNode.connect(nodeRack.instrumentVolume)
  nodeRack.instrumentVolume.connect(masterGain)
  effects.push(nodeRack)
}








  
//CONTROLS FOR ALL SLIDERS  
const slide = document.querySelectorAll(".slide")  
slide.forEach( slide => {
  slide.addEventListener("input", e => {
    const value = e.target.value
    const id = e.target.id

    const column1 = document.querySelector("#column1")
    const column2 = document.querySelector("#column2")
    const column3 = document.querySelector("#column3")
    if (id === "reverb1") {
      effects[0].reverbGain.gain.value = value/100
      column1.style.transition = `background-color ${value/70}s`
    } else if (id === "reverb2") {
      effects[1].reverbGain.gain.value = value/100
      column2.style.transition = `background-color ${value/70}s`
    } else if (id === "reverb3") {
      effects[2].reverbGain.gain.value = value/100
      column3.style.transition = `background-color ${value/70}s`
    } else if (id === "volume1") {
      effects[0].instrumentVolume.gain.value = value/100
    } else if (id === "volume2") {
      effects[1].instrumentVolume.gain.value = value/100
    } else if (id === "volume3") {
      effects[2].instrumentVolume.gain.value = value/100
    }
  })
})
  
  
// GENERATE SCALE BUTTONS
const allScales = teoria.Scale.KNOWN_SCALES;
const scaleList = document.querySelector("#scale-list");
allScales.forEach(function(scale) {
  const button = document.createElement("button");
  button.innerHTML = scale;
  button.classList.add("scale-button")
  scaleList.appendChild(button);
  button.classList.add("scalechoice")
})
  
 //DISPLAY CURRENT SCALE. 
const scaleDisplayElement = document.querySelector("#scale-display")


//DISPLAY SCALE LIST ON HOVER
scaleDisplayElement.addEventListener("mouseenter", e => {
  scaleList.style.display = "block";
})
scaleList.addEventListener("mouseleave", e => {
  scaleList.style.display = "none"
  scaleList.style.backgroundColor = "white"
})
  
//SCALE DEFINITION FUNCTION
scaleDisplayElement.innerHTML = "Scale: major"

const getScale = (root, scale) => {
  return teoria.scale(root, scale).notes().map(function(note){
    return note.midi()
  })
}

let currentScale = getScale("c4", "major")


//BUTTON EVENTLISTENER 
const scaleButtons = document.querySelectorAll(".scalechoice");
scaleButtons.forEach(button => {
  button.addEventListener("click", function(e) {
    let scale = e.target.innerHTML;
    let root = "c4"; // this can be changed, but will be the root of the scales
    currentScale = getScale(root, scale);
    scaleDisplayElement.innerHTML = `Scale: ${scale}`
    scaleList.style.display = "none"
  })
});

//PLAY RANDOM NOTE 
function playRandomNote(id) {
  let synth = audioContext.createOscillator()
  let gain = audioContext.createGain()
  gain.connect(masterGain)
  let waveType
  let num = Math.floor(Math.random()*currentScale.length)
  let randomMidiNote = currentScale[num]
  let frequency = Math.pow(2, (randomMidiNote-69)/12)*440

  if (id === "column1") {
    waveType = "sine"
    gain.gain.value = 0.3
    synth.connect(effects[0].reverbGain)
    synth.connect(effects[0].instrumentVolume)

  } else if (id === "column2") {
    waveType = "sawtooth"
    synth.connect(effects[1].reverbGain)
    synth.connect(effects[0].instrumentVolume)

    gain.gain.value = 0
  } else if (id === "column3") {
    waveType = "triangle"
    gain.gain.value = 0.3
    synth.connect(effects[2].reverbGain)
    synth.connect(effects[0].instrumentVolume)

  } 

  synth.type = waveType
  synth.frequency.setValueAtTime(frequency, audioContext.currentTime) 
  synth.start(audioContext.currentTime)
  synth.stop(audioContext.currentTime + 0.5)
  synth.onended = () => {
    synth.disconnect()
    gain.disconnect()
  }
} 


//FUNCTION THAT CHANGES BACKGROUND COLOR OF EACH COLUMN and CALLS playRandomNote() EVERY 1000ms  
function changeBackground(element) {
      let r = Math.floor(Math.random() * 256);
      let g = Math.floor(Math.random() * 256);
      let b = Math.floor(Math.random() * 256);
      element.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')'
    }

// THIS ADDS EVENT LISTENERS FOR EACH COLUMN  
const  columns = document.querySelectorAll('.column') 
columns.forEach(column => { // this returns an array of all objects with class .column
  column.addEventListener("click", function(e) { //for each of those objects we attach an event listener
    let element = e.target; //the e.target will be the specific object
    let id = element.id;
    changeBackground(element)
    playRandomNote(id);
    if (element.classList.contains("column")) {
      startInterval(element, id) //this calls the function with the input of the event's target
    }
  }) 
})
  
//SLIDE BAR TOP
const topContainer = document.querySelector("#top-container")
columns.forEach(column => {
  column.addEventListener("click", ()=> {
    topContainer.style.transform = "translateY(-30%)"
  })
})

//BOTTOM SLIDE BAR INTERACTION
const bottomContainer = document.querySelector("#bottom-container");
const arrow = document.querySelector("#arrow")

const toggleBottomSlide = (direction) => {
  if(direction === "up"){
    bottomContainer.classList.add("active")
    arrow.style.transform = "rotate(180deg)"
    arrow.style.transition = "transform 1s"
  } 
  if(direction === "down"){
    bottomContainer.classList.remove("active")
    arrow.style.transform = "rotate(360deg)"
    arrow.style.transition = "transform 1s"
  }
}

bottomContainer.addEventListener("mouseenter", e => {
  toggleBottomSlide("up")
})
bottomContainer.addEventListener("mouseleave", e => {
  toggleBottomSlide("down")
})

arrow.addEventListener("touchstart", ()=>{
  if(bottomContainer.classList.contains("active")){
    toggleBottomSlide("down")
  } else {
    toggleBottomSlide("up")
  }
})
  
//FUNCTION THAT GENERATES RANDOM BGR COLOR ON PAGE LOAD
//INITIAL STATE HOVERING
columns.forEach(column => {
  column.setAttribute("data-clicked", false)
})
  
columns.forEach(column => {
  column.addEventListener("click", function(e) {
    column.setAttribute("data-clicked", true)
    column.style.transition = "background-color 0s"
  })
  column.addEventListener("mouseenter", e => {
    if (column.getAttribute("data-clicked") == 'false') {
      let element = e.target
      let id = e.target.id
      column.style.transition = "background-color 0s"
      changeBackground(element)
      playRandomNote(id)
    }
  })
  column.addEventListener("mouseleave", function(e) {
    if (column.getAttribute("data-clicked") == 'false') {
      e.target.style.backgroundColor = "white"
      column.style.transition = "background-color 0s"
    }
  })
})               

//FUNCTION CHANGES BG COLOR AND PLAYS RANDOM NOTE EVERY SECOND
let flash;
const startInterval = (element, id) => { //this function has an input, element, retrieved from the function below  
  if (id) {
    flash = setInterval(() => {
      changeBackground(element)
      playRandomNote(id)
    }, 1000)
  }  
}


// CLEAR INTERVAL
const reset = document.querySelector("#reset")
reset.addEventListener("click", function(i) {
  columns.forEach(column => {
    column.style.backgroundColor = "white"
    column.style.transition = "background-color 2s"
    column.setAttribute("data-clicked", false)
  });
  for(i=0; i<100; i++) //clears the all intervalss
  {
    window.clearInterval(i)
  }
})


  
  
  
  
  