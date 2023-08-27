<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <title>Fitness Data</title>

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link href="/css/showData.css" rel="stylesheet" type="text/css">
</head>

<body>

    <h1>Fitness Data</h1>

    <div class="container pb-2 pt-2">
        <div class="row">
            <div class="button-wrap">
                <a href="show-data.php?userName=userB" class="btn btn-primary btn-lg active" role="button" aria-pressed="true">userB</a>
            </div>
            <div class="button-wrap">
                <a href="show-data.php?userName=userA" class="btn btn-primary btn-lg active" role="button" aria-pressed="true">userA</a>
            </div>
            <div class="button-wrap">
                <a href="/" class="btn btn-primary btn-lg active" role="button" aria-pressed="true">Tracker</a>
            </div>
        </div>
    </div>
    <?php

    if (isset($_GET['userName'])) {
        $userName = $_GET['userName'];
        $userName = strtolower($userName);
        // check if there's a file for the user data-username.csv
        if (!file_exists('data-' . $userName . '.csv')) {
            echo "<div id='data'>";
            // capitalize first letter of username
            echo "<p>No data found for user " . ucfirst($userName) . ".</p>";
            echo "</div>";
            exit();
        }
        $file = fopen('data-' . $userName . '.csv', 'r');
    } else {
        echo "<div id='data'>";
        echo "<p>No user selected.</p>";
        echo "</div>";
        exit();
    }
    $data = array();
    while (($line = fgetcsv($file)) !== FALSE) {
        $data[] = $line;
    }
    fclose($file);
    echo "<div id='data'>";
    echo "<table>";
    echo "<tr><th>Date</th><th>Distance</th><th>Time</th><th>Speed</th></tr>";
    foreach ($data as $row) {
        echo "<tr>";
        foreach ($row as $cell) {
            echo "<td>" . htmlspecialchars($cell) . "</td>";
        }
        echo "</tr>";
    }
    echo "</table>";
    echo "</div>";
    ?>

    <div class="chartContainerWrap">
        <div id="chartContainer">
            <canvas id="chartDistance"></canvas>
        </div>
        <div id="chartContainer">
            <canvas id="chartTime"></canvas>
        </div>
        <div id="chartContainer">
            <canvas id="chartSpeed"></canvas>
        </div>
    </div>

</body>

</html>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        let data = <?php echo json_encode($data); ?>;
        let dates = [];
        let distances = [];
        let times = [];
        let speeds = [];

        for (let i = 0; i < data.length; i++) {
            dates.push(data[i][0]);
            distances.push(data[i][1]);
            times.push(data[i][2]);
            speeds.push(data[i][3]);
        }

        for (let i = 0; i < times.length; i++) {
            let time = times[i].split(':');
            let minutes = parseInt(time[0]);
            let seconds = parseInt(time[1]);
            times[i] = minutes + seconds / 60;
        }

        let ctxDistance = document.getElementById('chartDistance').getContext('2d');
        let chartDistance = new Chart(ctxDistance, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Distance',
                    data: distances,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            callback: function(value, index, values) {
                                return value + ' km';
                            }
                        }
                    }]
                }
            }
        });

        let ctxTime = document.getElementById('chartTime').getContext('2d');
        let chartTime = new Chart(ctxTime, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Time',
                    data: times,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            callback: function(value, index, values) {
                                return value + ' minutes';
                            }
                        }
                    }]
                }
            }
        });

        let ctxSpeed = document.getElementById('chartSpeed').getContext('2d');
        let chartSpeed = new Chart(ctxSpeed, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Speed',
                    data: speeds,
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            callback: function(value, index, values) {
                                return value + ' km/h';
                            }
                        }
                    }]
                }
            }
        });
    });
</script>