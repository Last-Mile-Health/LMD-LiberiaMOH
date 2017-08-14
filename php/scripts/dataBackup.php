<?php

// Backs up all MySQL databse schemas. Should be run daily at roughly 1am (server time - EST)
// Set DB connection strings (!!!!! figure out how to set include path with CRON !!!!!)
// URL: /LMDLiberiaMOH/php/scripts/dataBackup.php

// --skip-lock-tables option to mysqldump helps clear up the problem of mysqld using excessive amounts of memory during the nightly backups.

$user = "root";
$password = "Ju!y261847";
$host = "localhost";

$db1    = "liberiad_upload";

$backup_file1   = $db1      . '_' . date("Y-m-d-H-i-s") . '.sql';

$logFile = 'dataBackup.log';


// For GoDaddy
// Move old files into backups/archive directory
$source = "/home/liberiadata/public_html/LMDLiberiaMOH/backups/";
$files = scandir($source);
$destination = "/home/liberiadata/public_html/LMDLiberiaMOH/backups/archive/";
foreach ($files as $file) {
    if (in_array($file, array(".",".."))) continue;
    if (substr($file, -4) != '.sql') continue;
    // If we successfully copied this file, delete it from the source folder
    if (copy($source.$file, $destination.$file)) {
        unlink($source.$file);
    }
}

// Create new backups
exec( 'echo "------------------------------------------------------" >> ' . '/home/liberiadata/public_html/LMDLiberiaMOH/backups/' . $logFile );
exec( 'date >> ' . '/home/liberiadata/public_html/LMDLiberiaMOH/backups/' . $logFile );
exec( 'echo "dumping" ' . $db1 . ' >> ' . '/home/liberiadata/public_html/LMDLiberiaMOH/backups/' . $logFile );
exec('mysqldump --skip-lock-tables --routines --events --force --add-drop-trigger --user="' . $user . '" --password="' . $password . '" --host="' . $host . '" ' . $db1 . ' >' . '/home/liberiadata/public_html/LMDLiberiaMOH/backups/' . $backup_file1 . ' 2>> ' . '/home/liberiadata/public_html/LMDLiberiaMOH/backups/' . $logFile );
exec( 'echo "------------------------------------------------------" >> ' . '/home/liberiadata/public_html/LMDLiberiaMOH/backups/' . $logFile );
