const hour = document.querySelector('.hrs');
const minute = document.querySelector('.min');
const second = document.querySelector('.sec');
const outsideInfo = document.querySelector('.outside-info');
const minutesNumber = document.querySelector('.number-minutes');
let forcedTime = window.location.search.split('time=')[1];
let initialTime = new Date();

if (forcedTime) {
    // If it's only a partial time (minutes and hours)
    // Add a dummy date
    if (forcedTime.split(':').length === 2) {
        forcedTime = `2021-01-01T${forcedTime}:00`;
    } else if (forcedTime.split(':').length === 3) {
        forcedTime = `2021-01-01T${forcedTime}`;
    }
    forcedTime = new Date(forcedTime);
}

setInterval(runClock, 1000);
runClock();

function runClock() {
    let time = new Date();
    if (forcedTime) {
        // Add forced time to time
        time = new Date(initialTime.getTime() + (time.getTime() - initialTime.getTime()) + (forcedTime.getTime() - initialTime.getTime()));
    }
    const sec = time.getSeconds() / 60;
    const min = (sec + time.getMinutes()) / 60;
    const hrs = (min + time.getHours()) / 12;
    hour.style.setProperty('--rotation', hrs * 360);
    minute.style.setProperty('--rotation', min * 360);
    second.style.setProperty('--rotation', sec * 360);

    /*
      background-image: conic-gradient(
        rgb(255, 0, 43) 0deg, 
        transparent 0); 
    */

    if (min <= 0.5) {
        outsideInfo.style.setProperty('background-image', `conic-gradient(
            rgb(205, 255, 255) ${min * 360}deg, 
            transparent 0)`);

        minutesNumber.textContent = Math.round(min * 60);
        minutesNumber.style.setProperty('--rotation', (min / 2) * 360);
    } else {
        outsideInfo.style.setProperty('background-image', `conic-gradient(
            transparent ${min * 360}deg, 
            rgb(205, 255, 255) 0)`);

        minutesNumber.textContent = Math.round((1 - (min)) * 60);
        minutesNumber.style.setProperty('--rotation', (min + ((1 - min) / 2)) * 360);
    }



}


// Add 60 .tick elements to the .analog-clock element
const analogClock = document.querySelector('.analog-clock');
for (let i = 0; i < 60; i++) {
    const tick = document.createElement('div');
    tick.classList.add('tick');
    tick.style.setProperty('--rotate', `${i * 6}deg`);
    tick.innerHTML = '|'
    if (i % 5 === 0) {
        tick.classList.add('big-tick');
    }
    analogClock.appendChild(tick);
}