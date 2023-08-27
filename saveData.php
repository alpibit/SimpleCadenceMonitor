<?php
    $data = json_decode(file_get_contents('php://input'), true);
    $distance = $data['distance'];
    $time = $data['time'];

    $time = gmdate("i:s", $time);
    $speed = $data['speed'];
    $endDateTime = $data['endDateTime'];
    $userName = $data['userName'];

    $userName = strtolower($userName);


    $endDateTime = date("d-m-Y H:i:s", strtotime($endDateTime));
    
    $file = fopen('data-' . $userName . '.csv', 'a'); 
    fputcsv($file, array($endDateTime, $distance, $time, $speed)); 
    fclose($file); 

    echo $userName;
?>