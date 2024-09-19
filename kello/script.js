const hour=document.querySelector('.hrs');
const minute=document.querySelector('.min');
const second=document.querySelector('.sec');
const outsideInfo = document.querySelector('.outside-info');
const minutesNumber = document.querySelector('.number-minutes');

setInterval(runClock,1000);

function runClock(){
  const time=new Date();
  const sec=time.getSeconds()/60;
  const min=(sec+time.getMinutes())/60;
  const hrs=(min+time.getHours())/12;
  hour.style.setProperty('--rotation',hrs*360);
  minute.style.setProperty('--rotation',min*360);
  second.style.setProperty('--rotation',sec*360);

/*
  background-image: conic-gradient(
    rgb(255, 0, 43) 0deg, 
    transparent 0); 
*/

    if (min <= 0.5) {
        outsideInfo.style.setProperty('background-image',`conic-gradient(
            rgb(205, 255, 255) ${min*360}deg, 
            transparent 0)`);
        
        minutesNumber.textContent = Math.round(min*60);
        minutesNumber.style.setProperty('--rotation',(min - 0.015)*360);
    } else {
        outsideInfo.style.setProperty('background-image',`conic-gradient(
            transparent ${min*360}deg, 
            rgb(205, 255, 255) 0)`);
        
        minutesNumber.textContent = Math.round((1-(min))*60);
        minutesNumber.style.setProperty('--rotation',(min + 0.015)*360);
    }

    

}

runClock();
