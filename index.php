<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadence Bike</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link href="/css/index.css" rel="stylesheet" type="text/css">
</head>

<body>
    <div class="buttonWrap">
        <button class="connect-bluetooth btn btn-primary">Connect</button>
        <button class="start-bike-excersise btn btn-primary">Start</button>
    </div>

    <div class="cadence-data">
        <div class="cadence-block">
            <p class="cadence">Cadence: 0</p>
        </div>
        <div class="speed-block">

            <p class="speed">Speed: 0</p>
        </div>
        <div class="distance-block">
            <p class="distance">Distance: 0</p>
        </div>
        <div class="time-block">
            <p class="time">Time:</br> 0 : 00</p>
        </div>
    </div>

    <div class="modal-user">
        <div class="modal-user-content">
            <div class="modal-user-question-wrap">
                <p>Which user data to save?</p>
            </div>
            <div class="modal-user-button-wrap">
                <button class="save-user-data btn btn-primary button-modal-userA">userA</button>
                <button class="save-user-data btn btn-primary button-modal-userB">userB</button>
            </div>
            <div class="modal-reset-button-wrap">
                <button class="reset-user-data btn btn-primary">Reset</button>
            </div>
        </div>
    </div>
    <script src="/js/index.js"></script>
</body>

</html>