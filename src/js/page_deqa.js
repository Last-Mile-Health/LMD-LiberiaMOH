// Dependencies: jQuery, jQueryUI, LMD_fileSystemHelpers.js, LMD_utilities.js

$(document).ready(function(){
    
    
    // Set app "last updated" timestamp (from AppCache manifest)
    $.ajax({
        url: '../../lmdliberiamoh_v2.appcache',
        success: function(data){
            $('#appVersion').text('App last updated: ' + data.substring(23,47));
        }
    });


    // CLICK HANDLER: Send Records
    $('#modal_sendRecords_submit').click(function(){
        // Manipulate DOM
        $('#modal_sendRecords_buttons').slideUp(600);
        $('#modal_sendRecords_text').slideUp(800, function(){
            sendRecordsAJAX();
        });
    });


    // CLICK HANDLER: Delete Records
    $('#modal_deleteRecords_submit').click(function(){
        console.log($('#deletePassword').val());
        if ($('#deletePassword').val() == 'liberiA') {
            LMD_fileSystemHelper.deleteFile('data.lmd');
            setTimeout(function() {
                alert('File successfully deleted.');
                location.reload();
            }, 1500);
        } else {
            alert('Password is incorrect.');
        }
    });


    // CLICK HANDLER: Close send Records modal
    $('#modal_sendRecords_close').click(function(){
        
        // Close dialog box
        $('.modal').modal('hide');
        
        // Pause, reset DOM
        setTimeout( function() {
            $('#modal_sendRecords_buttons, #modal_sendRecords_ajaxInner, #modal_sendRecords_close').css('display','');
            $('#modal_sendRecords_buttons').css('display','block');
            $('#modal_sendRecords_text').html('Are you sure you want to send all current records to the database?');
            $('#modal_sendRecords_ajaxInner').html('');
        }, 500 );
        
    });
    
    
    // QA Click handlers (current forms)
    $('#qa_community').click(function() {
        launchQAModal({
            targetForm: "../forms/integrated_chsd_deoh_nhpd_supervision_tool_community.html",
            qaFormName: "Integrated Supervision Tool: Community",
            pKey1_name: "month_complete",
            pKey2_name: "community",
            pKey1_label: "Month",
            pKey2_label: "Community"
        });
    }); 
    
    
    // QA Click handlers (current forms)
    $('#qa_facility').click(function() {
        launchQAModal({
            targetForm: "../forms/integrated_chsd_deoh_nhpd_supervision_tool_facility.html",
            qaFormName: "Integrated Supervision Tool: Facility",
            pKey1_name: "month_complete",
            pKey2_name: "facility",
            pKey1_label: "Month",
            pKey2_label: "Facility"
        });
    });
    
    
    // CLICK HANDLER: QA modal
    $('#modal_QA_submit').click(function() {

        // Set pKey values
        pKey1_val = $('#modal_QA_pKey1').val();
        pKey2_val = $('#modal_QA_pKey2').val();
        pKey3_val = $('#modal_QA_pKey3').val();
        pKey4_val = $('#modal_QA_pKey4').val();
        
        // Initialize "QA Record ID" (i.e. key of myRecordset object where desired record is contained)
        var qaRecordID = false;
        
        // Read in file and run callback
        LMD_fileSystemHelper.readAndUseFile('data.lmd', function(result){
            
            if (result == "" || result == "{}") {
                flashDiv('#qaNoMatch');
            }
            else {
                // Otherwise, parse myRecordset into object
                myRecordset = JSON.parse(result);
                
                // First loop through keys of myRecordset (set numRecords)
                for (var key in myRecordset) {
                    try {
                        // Assign record object to currentRecord
                        currentRecord = JSON.parse(myRecordset[key]);
                    }
                    catch(e) {
                        currentRecord = 1;  // To avoid JSON.Parse() returning an error if value variable is not valid JSON
                    }
                    
                    // Test that pKey1 matches
                    if ( pKey1_val == currentRecord[window.lmd_qaOptions.pKey1_name] ) {

                        // Test that pKey2 matches (or doesn't exist)
                        if ( window.lmd_qaOptions.pKey2_name === undefined || pKey2_val == currentRecord[window.lmd_qaOptions.pKey2_name] ) {

                            // Test that pKey3 matches (or doesn't exist)
                            if ( window.lmd_qaOptions.pKey3_name === undefined || pKey3_val == currentRecord[window.lmd_qaOptions.pKey3_name] ) {

                                // Test that pKey4 matches (or doesn't exist)
                                if ( window.lmd_qaOptions.pKey4_name === undefined || pKey4_val == currentRecord[window.lmd_qaOptions.pKey4_name] ) {
                                    // Match found; set qaRecordID
                                    var qaRecordID = key;
                                }
                            }
                        }
                    }
                }
                
                // Handle: match is found
                if (qaRecordID) {
                    // Set qaRecordID; redirect
                    localStorage.qaRecordID = qaRecordID;
                    location.assign(window.lmd_qaOptions.targetForm);
                }
                // Handle: no match found
                else {
                    flashDiv('#qaNoMatch');
                }
            }

        });
        
    });
    
    
    // EVENT HANDLER: AppCache downloading
    applicationCache.ondownloading = function() {
        // Hide any existing modals; display appcacheRefresh modal
        $('.modal').modal('hide');
        $('#modal_appcacheRefresh').modal();
        return false;
    }
    
    
    // ERROR HANDLER: AppCache error
    window.applicationCache.onerror = function (e) {
        $('#modal_appcacheRefresh_text').html('An error occurred (AppCache error). Please contact Ministry of Health for assistance.');
        $('#modal_appcacheRefresh_progress').text('');
        console.log(e);
    };
    
    
    // EVENT HANDLER: AppCache progress
    applicationCache.onprogress = function(ev) {
        var progressMessage = "Progress: " + ev.loaded + " of " + ev.total + " files ("+ Math.round(100*ev.loaded/ev.total) +"%)";
        $("#modal_appcacheRefresh_progress").text(progressMessage);
        return false;
    };
    
    // EVENT HANDLER: AppCache cached
    applicationCache.oncached = function() {
        // To handle cases where the AppCache was cleared manually by the user (but localStorage remains)
        $('#modal_appcacheRefresh_text').text('New application version has been successfully downloaded. Reloading page now...');
        setTimeout(function(){
            location.reload();
        }, 1500);
        return false;
    };
    
    
    // EVENT HANDLER: AppCache update ready
    applicationCache.onupdateready = function() {
        $('#modal_appcacheRefresh_text').text('New application version has been successfully downloaded. Reloading page now...');
        setTimeout(function(){
            location.reload();
        }, 1500);
        return false;
    };
    
});


function launchQAModal(options)
{
    // Set global qaOptions object
    window.lmd_qaOptions = options;
    
    // Reset DOM
    $('#modal_QA_pKeyDiv1, #modal_QA_pKeyDiv2, #modal_QA_pKeyDiv3, #modal_QA_pKeyDiv4').css('display','');
    $('#modal_QA_pKey1, #modal_QA_pKey2, #modal_QA_pKey3, #modal_QA_pKey4').datepicker('destroy');
    $('#modal_QA_pKey1, #modal_QA_pKey2, #modal_QA_pKey3, #modal_QA_pKey4').val('');
    $('#qaFormName').text(options.qaFormName);
    
    // Manipulate modal DOM
    if ( options.pKey1_label ) {
        $('#modal_QA_pKeyDiv1 label').text(options.pKey1_label);
    }
    else {
        $('#modal_QA_pKeyDiv1').css('display','none');
    }
    if ( options.pKey2_label ) {
        $('#modal_QA_pKeyDiv2 label').text(options.pKey2_label);
    }
    else {
        $('#modal_QA_pKeyDiv2').css('display','none');
    }
    if ( options.pKey3_label ) {
        $('#modal_QA_pKeyDiv3 label').text(options.pKey3_label);
    }
    else {
        $('#modal_QA_pKeyDiv3').css('display','none');
    }
    if ( options.pKey4_label ) {
        $('#modal_QA_pKeyDiv4 label').text(options.pKey4_label);
    }
    else {
        $('#modal_QA_pKeyDiv4').css('display','none');
    }
    
    // Apply jQueryUI datepicker (MySQL date format)
    if ( options.pKey_date ) {
        // Datepicker; enforce MySQl date format
        $("#" + options.pKey_date).datepicker({dateFormat: 'yy-mm-dd'});
        $("#" + options.pKey_date).blur(datepickerBlur);
    }
    
    // Open modal
    $('#modal_QA').modal();
}


function flashDiv(myDiv) {
    // Flash "no match found" message div
    $(myDiv).slideDown(1000).delay(1000).slideUp(1000);
}


function noRecordsMessage() {
    // Display "no records" message in DOM; reset modal
    $('#modal_sendRecords_text').html('There are currently no locally-stored records.');
    $('#modal_sendRecords_text').slideDown(500);
    $('#modal_sendRecords_close').slideDown(500);
}


function sendRecordsAJAX(){
    
    // Reset variables
    var queryString = "",
        numRecords = 0,
        numAjax_success = 0,
        numAjax_fail = 0;
        
    LMD_fileSystemHelper.readAndUseFile('data.lmd', function(result){
        
        if (result == "" || result == "{}") {
            noRecordsMessage();
        }
        else {
            
            // Manipulate DOM
            $('#modal_sendRecords_ajaxLoadIcon').slideDown(500);
            $('#modal_sendRecords_ajaxInner').slideDown(500,function(){
                
                // Otherwise, parse myRecordset into object
                myRecordset = JSON.parse(result);
                
                // First loop through keys of myRecordset (set numRecords and manipulate DOM)
                for (var key in myRecordset) {
                    try {
                        // Assign record object to currentRecord
                        currentRecord = JSON.parse(myRecordset[key]);
                    }
                    catch(e) {
                        currentRecord = 1;  // To avoid JSON.Parse() returning an error if value variable is not valid JSON
                    }
                    
                    // Add "color blocks" (one block represents one record)
                    numRecords++;
                    $('#modal_sendRecords_ajaxInner').append('<div id="ajaxBlock_' + key + '" class="ajaxBlock">' + numRecords + '</div>');
                }
                
                // Second loop through keys of myRecordset (process numRecords)
                for (var key in myRecordset) {
                    
                    try {
                        // Assign record object to currentRecord
                        currentRecord = JSON.parse(myRecordset[key]);
                    }
                    catch(e) {
                        currentRecord = 1;  // To avoid JSON.Parse() returning an error if value variable is not valid JSON
                    }
                    
                    // Parse SQL Insert query
                    queryString = LMD_utilities.parseJSONIntoSQL(currentRecord, currentRecord.database, currentRecord.table, ['table', 'database']);
                    
                    // Send record to database via AJAX
                    var myData = { 'queryString': queryString, 'rKey': key, 'transaction': 0, 'queryDebugging': false } ;

                    // Send AJAX request
                    $.ajax({
                        type: "POST",
                        url: "/LMDLiberiaMOH/php/scripts/ajaxSendQuery.php",
                        data: myData,
                        dataType: "json",
                        success: function(data) {

                            // Change ajaxBlock to GREEN
                            $("#ajaxBlock_" + data.rKeyAJAX).css('background-color','#5CB85C');

                            // Log success; remove record from myRecordset; increment AJAX success counter
                            console.log('ajax success!');
                            delete myRecordset[data.rKeyAJAX];
                            numAjax_success++;

                        },
                        error: function(request, status, error) {

                            // Change ajaxBlock to RED
                            $("#ajaxBlock_" + JSON.parse(request.responseText).rKeyAJAX).css('background-color','#C12E2A');

                            // Log failure; increment AJAX failure counter
                            console.log('ajax error :/');
                            console.log(request);
                            numAjax_fail++;
                            
                        }
                    });
                }
                
                var myTimer = setInterval(function(){
                    
                    if(numRecords == numAjax_success + numAjax_fail) {
                        
                        // !!!!! Try doing this without deleting file !!!!!
                        LMD_fileSystemHelper.deleteFile('data.lmd',function(){
                            
                            LMD_fileSystemHelper.createOrOverwriteFile('data.lmd', JSON.stringify(myRecordset), function(){
                                
                                if (numRecords == numAjax_success) {
                                    // Display success message
                                    $('#modal_sendRecords_text').html('Success. All records were sent to the central MOH database.');
                                }
                                
                                else if (numRecords == numAjax_fail) {
                                    // Display "full error" message
                                    $('#modal_sendRecords_text').html('No records were successfully sent.<br>Please try again later.');
                                }
                                
                                else if (numRecords == numAjax_success + numAjax_fail) {
                                    // Display "partial error" message
                                    $('#modal_sendRecords_text').html('Only some records were sent successfully.<br>Please try again to send the remaining records.');
                                }
                                
                                else {
                                    // Display "unknown error" message
                                    $('#modal_sendRecords_text').html('An unknown error occurred.<br>Please contact the database manager for support');
                                }
                                
                                // Update DOM
                                $('#modal_sendRecords_ajaxLoadIcon').slideUp(500, function(){
                                    $('#modal_sendRecords_text, #modal_sendRecords_close').slideDown(500);
                                });
                                
                            });
                            
                        });
                        
                        clearInterval(myTimer);
                    }
                    
                },500);
                
            });
            
        }
        
    });
    
}