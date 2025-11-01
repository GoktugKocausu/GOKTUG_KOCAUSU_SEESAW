// dom elements 
const plank = document.getElementById('board-plank'); // plank
const area = document.getElementById('board-area'); // on the plank where should we click 
const leftText = document.getElementById('left-weight'); // left weight 
const rightText = document.getElementById('right-weight'); // right weight
const angleText = document.getElementById('angle'); // planks tilt angle  with + - we can guess which sides
const nextText = document.getElementById('next-weight'); // weight created with random func
const resetBtn = document.getElementById('reset'); // reset button
const logContainer = document.getElementById('log-container'); // contains logs

//get objects array from localstorage, or make a new empty one
let objects = JSON.parse(localStorage.getItem('objects')) || [];// array that holds objects on plank 
//get logs array from localstorage, or make a new empty one
let logs = JSON.parse(localStorage.getItem('logs')) || [];

//colors
const objectColors = [
  '#e11d48', //rose
  '#f97316', //orange
  '#22c55e', //green
  '#0ea5e9', //sky
  '#8b5cf6'  //violet
];

const soundContext = new (window.AudioContext || window.webkitAudioContext)(); // sound effect for dropping objects

//sound effect function
function dropSound() {
  const sound = soundContext.createOscillator(); //infinite beep sound
  const soundController = soundContext.createGain(); //layer for sound and destintion speker main reason control the infinite beep sound

  sound.type = 'triangle'; //sound effect
  sound.frequency.setValueAtTime(300, soundContext.currentTime); //pitch
  soundController.gain.setValueAtTime(0.3, soundContext.currentTime); //sets volume %30

 
  soundController.gain.exponentialRampToValueAtTime(0.01, soundContext.currentTime + 0.2); //closes the sound slowly

  sound.connect(soundController); //connecting sound to our soundcontroller so sound doesnt go directly to our speakers
  soundController.connect(soundContext.destination); //connects our soundcontroller to speaker with our object
  
  sound.start(soundContext.currentTime);//starts the sound
  sound.stop(soundContext.currentTime + 0.2); //stops the sound after 0.2 sec
}

//sound effect function for tilt angle +30 -30 
function hitSound() {
  const sound = soundContext.createOscillator();//infinite beep sound
  const soundController = soundContext.createGain();//layer for sound and destintion speker main reason control the infinite beep sound
  
  sound.type = 'square'; //more bass sound than triangle its like bzzzz
  sound.frequency.setValueAtTime(80, soundContext.currentTime); //low pitch warning sound
  soundController.gain.setValueAtTime(0.2, soundContext.currentTime); //sets %20

  soundController.gain.exponentialRampToValueAtTime(0.01, soundContext.currentTime + 0.1); //it closes the sound very quick

  sound.connect(soundController); //connecting sound to our soundcontroller so sound doesnt go directly to our speakers
  soundController.connect(soundContext.destination); //connects our soundcontroller to speaker with our object
  
  sound.start(soundContext.currentTime);
  sound.stop(soundContext.currentTime + 0.1); //0.1 sec
}

let isAtLimit = false; //false because gets true when angle +30 -30 

//preview elements
let previewObj = null;
let previewLine = null;

//click event 
plank.addEventListener('click', (e) => {
  //sound call statement !! resume allows the user start the effect
  if (soundContext.state === 'suspended') {
    soundContext.resume();
  }
  dropSound(); //every click plays the sound
  
  //getting x coordinate of the clicked place e.offsetX gives us to us
  const x = e.offsetX;
  
  //read the weight from the nextText box parseFloat turns text to number.
  const weight = parseFloat(nextText.textContent);

  //make the new obj
  const newObject = { x: x, weight: weight };
  
  //push the new obj to our main objects array
  objects.push(newObject);
  
  //call the function to draw the obj on the plank
  //with true parameters I allow to drop animation
  createObjectPlank(x, weight, true);

  //log entry for every click
  const pivotX = 200;
  const side = x < pivotX ? 'left' : 'right';
  const distance = Math.abs(x - pivotX);
  
  //make a new log obj
  const newLog = { weight, side, distance };
  logs.unshift(newLog); //add log to start of the array
  addLogToDOM(newLog); //add log to html

  //call function to draw the object on the plank
  calculateTilt();

  //get a new random weight 1-10kg and show it
  const newNextWeight = Math.floor(Math.random() * 10) + 1;
  nextText.textContent = newNextWeight;
  
  //save the nextWeight to localstorage
  localStorage.setItem('nextWeight', newNextWeight);
});

//reset button for clear the seesaw
resetBtn.addEventListener('click', () => {
  //clears the memory
  objects = [];
  logs = []; //clear logs from memory

  //clears the localStorage
  localStorage.removeItem('objects');
  localStorage.removeItem('nextWeight'); //clears the next weight
  localStorage.removeItem('logs'); //clear logs from storage
  
  plank.innerHTML = ''; //for clear the board deletes on the plank
  logContainer.innerHTML = ''; //clear logs from html

  //recall the function for starting again
  calculateTilt();
});

//main function for calculation
function calculateTilt() {
  
  let leftTorque = 0;
  let rightTorque = 0;
  let leftWeight = 0;
  let rightWeight = 0;
  const pivotX = 200; //center of the plank 400px/2 200px

  //looping all obj to calc torque and weight
  objects.forEach(obj => {
    const distance = Math.abs(obj.x - pivotX); //distance from the center
    
    if (obj.x < pivotX) {
      //left side
      leftTorque += obj.weight * distance;
      leftWeight += obj.weight;
    } else {
      //right side
      rightTorque += obj.weight * distance;
      rightWeight += obj.weight;
    }
  });

  //writes the new values to info card boxes
  leftText.textContent = leftWeight.toFixed(1);
  rightText.textContent = rightWeight.toFixed(1);

  //calc angle from torque difference
  const torqueDifference = rightTorque - leftTorque;
  
  //limiting the angle between -30 +30 and doc formula (rightTorque - leftTorque) / 10 (too steep), I used 100 for better tilt
  const angle = Math.max(-30, Math.min(30, torqueDifference / 100));

const justHitLimit = (angle === 30 || angle === -30);
  if (justHitLimit && !isAtLimit) {
    //plays the sound the tilt angle gets +30 -30
    hitSound();
  }
  //update for next hit
  isAtLimit = justHitLimit;

  //with calculated angle slide the plank
  plank.style.transform = `translateX(-50%) rotate(${angle}deg)`;

  //update angle info box
  angleText.textContent = angle.toFixed(1);

  //update localstorage every time state changes
  //every time calculateTilt runs saves the current objects array
  localStorage.setItem('objects', JSON.stringify(objects));
  localStorage.setItem('logs', JSON.stringify(logs)); //save logs to storage
}

//I updated the function true for animation 
function createObjectPlank(x, weight, animate = true) {
  //make a new <div> 
  const objElement = document.createElement('div');
  
  //required css and texts
  objElement.classList.add('object');
  objElement.textContent = `${weight}kg`; //show weight on object

  //change object size based on weight
  const size = 30 + weight * 2; //30px base +2px per kilo
  objElement.style.width = `${size}px`;
  objElement.style.height = `${size}px`;
  objElement.style.lineHeight = `${size}px`; //to center text vertically

  //set position
  //for center the obj on the where click 
  objElement.style.left = `${x - size / 2}px`;

  //changed feature !! now randomly choosing color
  const randomColor = objectColors[Math.floor(Math.random() * objectColors.length)];
  objElement.style.background = randomColor;
  
  //for the rotation with the plank I added to the plank 
  plank.appendChild(objElement);

  //animation logic
  const plankHeight = 20; //plank height in styles.css
  const objectBottomPosition = `${plankHeight}px`; //last position on the plank

  if (animate) {
    //if animated like first time the balls drops start at 300px in css wait 10ms and setting the final position up 20px bottom 
    setTimeout(() => {
      objElement.style.bottom = objectBottomPosition;
    }, 10);
  } else {
    //if there is no animation like refresh the page then put the object where it stands before refreshing
    objElement.style.bottom = objectBottomPosition;
  }
}
//add a new log entry to the html
function addLogToDOM(log) {
  const logElement = document.createElement('p');
  logElement.classList.add('log-entry');
  logElement.textContent = `📦 ${log.weight}kg dropped on ${log.side} side at ${Math.round(log.distance)}px from center`;
  logContainer.prepend(logElement); //add to top of the list
}
//draws old logs on page load
function renderLogs() {
  logContainer.innerHTML = ''; //clear old logs
  logs.forEach(log => {
    addLogToDOM(log);
  });
}

//draws old objects on page load and draws each using createObjectPlank
function renderObject() {
  objects.forEach(obj => {
    //with false paramter I dont allow animation because page reloaded
    createObjectPlank(obj.x, obj.weight, false);
  });
}

//watch mouse movements on plank
plank.addEventListener('mousemove', (e) => {
  const x = e.offsetX; //gets mouse position x on plank
  const weight = parseFloat(nextText.textContent); //gets nextweight value for simulate gets better
  const size = 30 + weight * 2; //same as the objects for accuricy
  const plankLeftOffset = 100; //600 - 400 / 2

  //previewobject !! if there is no prewobj creates it
  if (!previewObj) {
    previewObj = document.createElement('div');
    previewObj.classList.add('preview-object');
    area.appendChild(previewObj); // add it to the grey area
  }
  //update preview obj properties on every mouse move
  previewObj.textContent = `${weight}kg`;
  previewObj.style.width = `${size}px`;
  previewObj.style.height = `${size}px`;
  previewObj.style.lineHeight = `${size}px`;
  previewObj.style.left = `${plankLeftOffset + x - (size / 2)}px`;//same logic as createObjectPlank to center obj
  previewObj.style.opacity = '1'; //making visible

  //previewline !! if there is no preview line null create it
  if (!previewLine) {
    previewLine = document.createElement('div');
    previewLine.classList.add('preview-line');
    area.appendChild(previewLine); //add it to the grey area
  }
  
  //match line's x position with objects center
  previewLine.style.left = `${plankLeftOffset + x}px`;
  
  //.preview-object 'bottom: 260px .board-plank 'bottom: 200px for calculating line position
  previewLine.style.bottom = '200px'; //start from top of plank
  previewLine.style.height = '60px'; //line height 260px - 200px  60px
  previewLine.style.top = 'auto'; //top:0 diasabled with this
  previewLine.style.opacity = '1'; //make it visible
});

//when mouse leaves on the plank preview dissapear
plank.addEventListener('mouseleave', () => {
  if (previewObj) {
    previewObj.style.opacity = '0'; //if previewObj exists hide the ball
  }
  if (previewLine) {
    previewLine.style.opacity = '0'; //if previewLine exists hide the line
  }
});

//nextWeight from memory if none make a new one
nextText.textContent = localStorage.getItem('nextWeight') || Math.floor(Math.random() * 10) + 1;

//draw all objects from memory
renderObject();

//draw all logs from memory
renderLogs();

//calc initial tilt based on loaded objects
calculateTilt();

