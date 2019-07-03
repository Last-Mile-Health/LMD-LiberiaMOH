<?php

// Dumps specific MySQL tables as CSVs into /LMDLiberiaMOH/backups/CSVs. Should be run daily at roughly 1am (server time - EST)
// URL: localhost/LMDLiberiaMOH/php/scripts/dumpTablesAsCSVs.php

// Set include path; require connection file
// set_include_path( get_include_path() . PATH_SEPARATOR . $_SERVER['DOCUMENT_ROOT'] . "/LMDLiberiaMOH/php/includes" );
// Apparently, cron does not inherit all the user shell info, like DOCUMENT_ROOT, so I had to hard code the .../php/includes path.
// Same goes for the query3 string below.
//set_include_path( "/home/liberiadata/public_html/LMDLiberiaMOH/php/includes" );
set_include_path( "../includes" ); // !!!!! TEMP !!!!!
require_once("cxn.php");

// Delete old files
//$files = glob('../../backups/CSVs/*');
//foreach($files as $file){ 
//    if(is_file($file)) {
//        unlink($file); 
//    }
//}

// Set variables
$schema = 'liberiad_upload';
$table = $_GET['table'];

// Increase maximum length of row entry for GROUP_CONCAT
$query1 = "SET SESSION group_concat_max_len=10000;";
mysqli_query($cxn, $query1) or die(mysqli_error($cxn));

// Parse and run query string that selects column names
$query2 = "SELECT GROUP_CONCAT(CONCAT(\"'\",column_name, \"'\")) AS `val` FROM information_schema.columns
WHERE `table_schema`='$schema' AND table_name='$table';";
$result = mysqli_query($cxn, $query2) or die(mysqli_error($cxn));
$columnHeaders = mysqli_fetch_assoc($result)['val'];

// Parse and run query that selects data
$query3 = "SELECT $columnHeaders UNION SELECT * FROM `$schema`.`$table`;";
//    INTO OUTFILE '" . "/home/liberiadata/public_html" . "/LMDLiberiaMOH/backups/CSVs/$table" . ".csv'
//    FIELDS TERMINATED BY ',' ENCLOSED BY '\\\"' LINES TERMINATED BY '\\n';";

// Memory buffer is hitting this limit: Allowed memory size of 33554432 bytes exhausted (tried to allocate 32 bytes)
// Set memory_limit to -1, which means unlimited.

ini_set('memory_limit', '-1');

// Run query
$result = mysqli_query($cxn, $query3) or die(mysqli_error($cxn));

// Output results

//    echo $query3 . "<br><br>";

while ( $row = mysqli_fetch_assoc($result) ) {
//        print_r($row);

    $rowFormatted = "";
    foreach($row as $value) {
        $rowFormatted .= '"' . $value . '",';
    }
    $rowFormatted = trim($rowFormatted,",");
    echo $rowFormatted;
    echo "\n";

//        extract($row);
//        $tableRow .= "<td>$health_facility</td>";
//        $tableRow .= "<td>$chssPlusID</td>";
//        $tableRow .= "<td>$cha ($cha_id)</td>";
//        $tableRow .= "<td>$community_list</td>";
//        $tableRow .= "<td>$community_id_list</td>";
//        echo $tableRow;
}
    