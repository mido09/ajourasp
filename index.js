const Gpio = require('pigpio').Gpio;

var onState = true;
var alerting = false;
var alertingJob = null;

var lastLine = null;

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECONDS_PER_CM = 1e6/34321;

const trigger = new Gpio(23, {mode: Gpio.OUTPUT});
const echo = new Gpio(24, {mode: Gpio.INPUT, alert: true});

trigger.digitalWrite(0); // Make sure trigger is low

const watchHCSR04 = () => {
  let startTick;

  echo.on('alert', (level, tick) => {
    if (level == 1) {
      startTick = tick;
    } else {
      const endTick = tick;
      const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
      var currentMeasurement= diff / 2 / MICROSECONDS_PER_CM;
      console.log(currentMeasurement);
      if(lastLine!=null){
	var differ = Math.abs(lastLine-currentMeasurement);
	if(differ>5){
		if(onState==true) {
			alarm();
			console.log("Someone moved");
		}
	}
      }
      lastLine = currentMeasurement;
    }
  });
};

watchHCSR04();

// Trigger a distance measurement once per second
setInterval(() => {
  trigger.trigger(10, 1); // Set trigger high for 10 microseconds
}, 1000);


const redLed = new Gpio(26, {mode: Gpio.OUTPUT});
const greenLed = new Gpio(16, {mode: Gpio.OUTPUT});

const alertingLed = new Gpio(12, {mode: Gpio.OUTPUT});

setOn();
//setAlerting(0);

//functions of state manipulation
function setOn(){
 redLed.digitalWrite(0);
 greenLed.digitalWrite(1);
 onState = true;
}

function setOff(){
 onState = false;
 redLed.digitalWrite(1);
 greenLed.digitalWrite(0);
}


function setAlerting(x){
 alertingLed.digitalWrite(x);
}

function startAlerting(x){
 setAlerting(1);
 setTimeout(()=>{
  setAlerting(0); 
 },200);
}

function alarm(){
if(alerting==false)
{
alerting = true;
alertingJob = setInterval(startAlerting,400);
}
};

function stopAlarm(){
if(alerting==true){

alerting = false;
clearInterval(alertingJob);
}
}


