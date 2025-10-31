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

//I defined new array for logs to memory
let logs = JSON.parse(localStorage.getItem('logs')) || [];


//click event 
plank.addEventListener('click', (e) => {
  //getting x coordinate of the clicked place e.offsetX gives us to us
  const x = e.offsetX;
  
  //read the weight from the nextText box parseFloat turns text to number.
  const weight = parseFloat(nextText.textContent);

  //make the new obj
  const newObject = { x: x, weight: weight };
  
  //push the new obj to our main objects array
  objects.push(newObject);
  
  //call the function to draw the obj on the plank
  //with true parameters I allow to frop animation
  createObjectPlank(x, weight, true);

  const pivotX = 200;
  const side = x < pivotX ? 'left' : 'right';
  const distance = Math.abs(x - pivotX);
  
  //for logs added weight side and distance
  const newLog = { weight, side, distance };
  logs.unshift(newLog); 
  addLogToDOM(newLog);

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
  logs = [];

  //clears the localStorage
  localStorage.removeItem('objects');
  localStorage.removeItem('nextWeight'); //clears the next weight
  localStorage.removeItem('logs');// clears the logs

  
  plank.innerHTML = ''; //for clear the board deletes on the plank
  logContainer.innerHTML = '';

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

  //with calculated angle slide the plank
  plank.style.transform = `translateX(-50%) rotate(${angle}deg)`;

  //update angle info box
  angleText.textContent = angle.toFixed(1);

  //update localstorage every time state changes
  //every time calculateTilt runs saves the current objects array and also logs
  localStorage.setItem('objects', JSON.stringify(objects));
  localStorage.setItem('logs', JSON.stringify(logs));
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

  //change the color left or right
  objElement.style.background = x < 200 ? '#eab308' : '#3b82f6';
  
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

//adds one log entry to the log screen
function addLogToDOM(log) {
  const logElement = document.createElement('p');
  logElement.classList.add('log-entry');
  logElement.textContent = `📦 ${log.weight}kg dropped on ${log.side} side at ${Math.round(log.distance)}px from center`;
  logContainer.prepend(logElement); //prepend adds it to the top
}

//draws all logs from memory when page refresh
function renderInitialLogs() {
  logContainer.innerHTML = ''; //clears
  logs.forEach(log => { //loop for adding them
    addLogToDOM(log);
  });
}


//draws old objects on page load and draws each using createObjectPlank
function renderInitialObjects() {
  objects.forEach(obj => {
    //with false paramter I dont allow animation because page reloaded
    createObjectPlank(obj.x, obj.weight, false);
  });
}




//nextWeight from memory if none make a new one
nextText.textContent = localStorage.getItem('nextWeight') || Math.floor(Math.random() * 10) + 1;

//draw all objects from memory
renderInitialObjects();
renderInitialLogs();

//calc initial tilt based on loaded objects
calculateTilt();

