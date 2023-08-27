const connectBluetooth = document.querySelector('.connect-bluetooth');
const startBikeExcersise = document.querySelector('.start-bike-excersise');
const cadenceData = document.querySelector('.cadence-data');
const cadence = document.querySelector('.cadence');
const speed = document.querySelector('.speed');
const distance = document.querySelector('.distance');
const timeElement = document.querySelector('.time');
const modalUser = document.querySelector('.modal-user');

let oldCumulativeCrankRevolutions = 0;
let oldLastCrankEventTime = 0;
let totalDistanceKM = 0;
let exerciseStartTime = 0;
let elapsedTimeSeconds = 0;
let lastEventTime = 0;
let device = null;
let deviceName = '';

connectBluetooth.addEventListener('click', () => {
    navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['cycling_speed_and_cadence']
    })
        .then(selectedDevice => {
            device = selectedDevice;
            deviceName = device.name;
            return device.gatt.connect();
        })
        .then(server => server.getPrimaryService('cycling_speed_and_cadence'))
        .then(service => service.getCharacteristic('csc_measurement'))
        .then(characteristic => characteristic.startNotifications())
        .then(characteristic => {
            characteristic.addEventListener('characteristicvaluechanged', handleNotifications);
        })
        .then(() => {
            console.log('Notifications have been started.');
        })
        .catch(error => {
            console.log(error);
        });
});


startBikeExcersise.addEventListener('click', () => {

    if (!startBikeExcersise.classList.contains('active')) {
        exerciseStartTime = Date.now();
        elapsedTimeSeconds = 0;
        startExerciseTimer();
    } else {
        startBikeExcersise.classList.remove('active');
        startBikeExcersise.innerHTML = 'Start';

        saveDataToCSV();

        disconnectBluetooth();

    }
});

function handleNotifications(event) {
    let value = event.target.value;
    let flags = value.getUint8(0);
    let crankRevolutionsPresent = flags & 0x02;

    let index = 1;
    let cumulativeCrankRevolutions = 0;
    let lastCrankEventTime = 0;

    if (crankRevolutionsPresent) {
        cumulativeCrankRevolutions = value.getUint16(index, true);
        index += 2;
        lastCrankEventTime = value.getUint16(index, true);
        index += 2;

        if (cumulativeCrankRevolutions !== oldCumulativeCrankRevolutions && lastCrankEventTime !== oldLastCrankEventTime) {
            let crankRevolutionsDiff = cumulativeCrankRevolutions - oldCumulativeCrankRevolutions;
            let eventTimeDiff = lastCrankEventTime - oldLastCrankEventTime;

            if (eventTimeDiff < 0) {
                eventTimeDiff += 65536;
            }


            let eventTimeDiffInMinutes = eventTimeDiff / 1024 / 60;
            let cadenceRPM = (crankRevolutionsDiff / eventTimeDiffInMinutes).toFixed(1);

            if (!isNaN(cadenceRPM)) {
                cadence.innerHTML = `Cadence: ${cadenceRPM}`;
            }

            let speedKPH = speedKPHCalculator(cadenceRPM);

            // if the speed is not 0 or NaN, then start the timer
            if (speedKPH !== 0 && !isNaN(speedKPH)) {
                // if the button does not have active class, then add it and change the text
                if (!startBikeExcersise.classList.contains('active')) {
                    startBikeExcersise.classList.add('active');
                    startBikeExcersise.innerHTML = 'Stop';
                    exerciseStartTime = Date.now();
                    elapsedTimeSeconds = 0;
                    startExerciseTimer();
                }
            }
            let distanceKM = distanceCalculator(speedKPH, eventTimeDiffInMinutes);
            totalDistanceKM = totalDistanceCalculator(distanceKM);

            oldCumulativeCrankRevolutions = cumulativeCrankRevolutions;
            oldLastCrankEventTime = lastCrankEventTime;
            lastEventTime = Date.now();
        }
    }
}

function distanceCalculator(speedKPH, eventTimeDiffInMinutes) {
    if (isNaN(speedKPH) || isNaN(eventTimeDiffInMinutes)) {
        return 0;
    }
    let distanceKM = speedKPH / 60 * eventTimeDiffInMinutes;
    return distanceKM;
}

function totalDistanceCalculator(distanceKM) {
    totalDistanceKM += distanceKM;
    distance.innerHTML = `Distance: ${totalDistanceKM.toFixed(2)} km`;
    return totalDistanceKM;
}

function speedKPHCalculator(cadenceRPM) {
    if (isNaN(cadenceRPM)) {
        return 0;
    }
    let speedKPH = cadenceRPM * 0.354;
    speed.innerHTML = `Speed: ${speedKPH.toFixed(2)} km/h`;
    return speedKPH;
}

async function startExerciseTimer() {
    while (true) {
        startBikeExcersise.innerHTML = 'Stop';
        startBikeExcersise.classList.add('active');

        await new Promise(resolve => setTimeout(resolve, 1000));
        let now = Date.now();
        if (now - lastEventTime < 60000) {
            elapsedTimeSeconds += 1;
            let minutes = Math.floor(elapsedTimeSeconds / 60);
            let seconds = elapsedTimeSeconds % 60;
            timeElement.innerHTML = `Time:</br> ${minutes} : ${seconds < 10 ? '0' : ''}${seconds}`;
        } else if (now - lastEventTime >= 60000 && elapsedTimeSeconds > 0) {
            alert("The training session seems to be over. Resetting counters...");
            oldCumulativeCrankRevolutions = 0;
            oldLastCrankEventTime = 0;
            totalDistanceKM = 0;
            elapsedTimeSeconds = 0;
            cadence.innerHTML = `Cadence: 0`;
            speed.innerHTML = `Speed: 0 km/h`;
            distance.innerHTML = `Distance: 0 km`;
            timeElement.innerHTML = `Time:</br> 0 : 00`;
            break;
        } else if (now - lastEventTime >= 3000 && elapsedTimeSeconds > 0) {
            cadence.innerHTML = `Cadence: 0`;
            speed.innerHTML = `Speed: 0 km/h`;
        }
    }
}


function saveDataToCSV() {
    let distance = totalDistanceKM;
    let time = elapsedTimeSeconds;

    distance = parseFloat(distance.toFixed(2));
    time = parseFloat(time.toFixed(2));

    let speed = (distance / time) * 3600;
    speed = parseFloat(speed.toFixed(2));

    let endDateTime = new Date();

    console.log("Distance: " + distance);
    console.log("Time: " + time);
    console.log("Speed: " + speed);
    console.log("End date and time: " + endDateTime);

    let data = {
        endDateTime: endDateTime,
        distance: distance,
        time: time,
        speed: speed,
    };

    if (distance === 0) {
        location.reload();
    }

    modalUser.style.display = "flex";

    const buttons = document.querySelectorAll(".button-modal-userA, .button-modal-userB, .reset-user-data");

    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            let data = {
                userName: "",
                endDateTime: endDateTime,
                distance: distance,
                time: time,
                speed: speed,
            };

            if (button.classList.contains("button-modal-userA")) {
                data.userName = "userA";
            }

            if (button.classList.contains("button-modal-userB")) {
                data.userName = "userB";
            }

            if (button.classList.contains("reset-user-data")) {
                location.reload();
                return;
            }

            fetch("saveData.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
                .then((response) => response.text())
                .then((data) => {
                    console.log("Success:", data);
                    window.location.href = "show-data.php?userName=" + data;

                })
                .catch((error) => {
                    console.error("Error:", error);
                    location.reload();
                });
        });
    });
}






function disconnectBluetooth() {
    if (deviceName) {
        if (device && device.gatt.connected) {
            device.gatt.disconnect();
            console.log('Disconnected from the device:', deviceName);
            cadence.innerHTML = `Cadence: 0`;
            speed.innerHTML = `Speed: 0 km/h`;
            distance.innerHTML = `Distance: 0 km`;
            timeElement.innerHTML = `Time:</br> 0 : 00`;
        } else {
            console.log('Device not found or already disconnected:', deviceName);


        }
    } else {
        console.log('No device name saved.');
    }
}

window.onclick = function (event) {
    if (event.target == modalUser) {
        modalUser.style.display = "none";
    }
}


if ('wakeLock' in navigator) {
    let wakeLock = null;

    const requestWakeLock = async () => {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Screen wake lock is active');
        } catch (err) {
            console.error(`${err.name}, ${err.message}`);
        }
    };

    const releaseWakeLock = async () => {
        if (wakeLock !== null) {
            try {
                await wakeLock.release();
                wakeLock = null;
                console.log('Screen wake lock is released');
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
            }
        }
    };

    document.addEventListener('DOMContentLoaded', requestWakeLock);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            releaseWakeLock();
        }
    });
} else {
    console.log('Wake Lock API is not supported');
}