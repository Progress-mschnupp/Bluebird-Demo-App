 var sigElement;

//initialize SessionStorage
function initSessionStorage() {
    // enable Flags
	sessionStorage.setItem('isDriverSet',false);
	sessionStorage.setItem('isVehicleSet',false);
	sessionStorage.setItem('isServiceSet',false);
	sessionStorage.setItem('isPaymentSet',false);    
    sessionStorage.setItem('enablePayment',false);  
    sessionStorage.setItem('isSigned', false);
    sessionStorage.setItem('enableSign', false);
    sessionStorage.setItem('enableContract',false); 
    
    // Driver Info
    removeDriverInfo();
    
    // Vehicle Info
    removeVehicleInfo();
    
    // Service Info
    removeServiceInfo();
    
    // Payment Info
    removePaymentInfo();
    
    sigElement = null;
}


/* ====================================== Driver ======================================= */
// isDriverSet Checkbox
function driverCheckbox() {
  var driverSet = sessionStorage.getItem('isDriverSet');
   // alert("Is driver set: "+ driverSet);
   // alert("Boolean Compare: "+ (driverSet === 'true' ));
    
    
    if(driverSet === 'true') {
    	$('#LoanerEntryDetails_chbx_DriverDet').prop('checked',true).checkboxradio('refresh');
        
    } else {
        $('#LoanerEntryDetails_chbx_DriverDet').prop('checked',false).checkboxradio('refresh');
    }
    
    //alert("Is driver checked: "+ $('#LoanerEntryDetails_chbx_DriverDet').is(':checked') );
}

// isDriverSet Selected
function isDriverSelected() {
  var driverSet = sessionStorage.getItem('isDriverSet');
  driverSelectSetup(driverSet);
 
  //deselect the other tabs
  vehicleDeselectSetup(sessionStorage.getItem('isVehicleSet')); 
  serviceDeselectSetup(sessionStorage.getItem('isServiceSet'));
  payDeselectSetup(sessionStorage.getItem('isPaymentSet'), sessionStorage.getItem('enablePayment'));
  signDeselectSetup(sessionStorage.getItem('isSigned'), sessionStorage.getItem('enableSign'));
    
    // alert("Is driver set: "+ driverSet);
    //alert("Boolean Compare For Selected Driver: "+ (driverSet === 'true' ));
    
    //Redirect to Selected Driver
    if(driverSet === 'true') {
    //    alert('Show the Driver Selected!');
        Progress('grid_SearchDriver').hide();
        Progress('grid_SelectedDriver').show();
        getSelectedDriverInfoPage();
    } else {
    //	alert('Search for Driver!');
        Progress('grid_SearchDriver').show();
        Progress('grid_SelectedDriver').hide();
    }
}

function driverSelectSetup(isDriverSet) {
    //background
    $('#LoanerEntryDetails_cell_DriverDetails').attr('style','background:rgba(0, 0, 0, 0.5);');
    
    //isDriverSelected
    if(isDriverSet === 'true') {
        //show green
    	$('#LoanerEntryDetails_lbl_DriverDetails').attr('style','color:rgb(163,253,0);');
        $('#LoanerEntryDetails_img_driver').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_check.png');
    } else {
    	//show blue
        $('#LoanerEntryDetails_lbl_DriverDetails').attr('style','color:#376dff;');
        $('#LoanerEntryDetails_img_driver').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_driver_active.png');
    }
}

function driverDeselectSetup(isDriverSet) {
    //background
    $('#LoanerEntryDetails_cell_DriverDetails').attr('style','background:rgba(0, 0, 0, 0);');
    
    //isDriverSelected
    if(isDriverSet === 'true') {
        //show green
    	$('#LoanerEntryDetails_lbl_DriverDetails').attr('style','color:rgb(163,253,0);');
        $('#LoanerEntryDetails_img_driver').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_check.png');
    } else {
    	//show blue
        $('#LoanerEntryDetails_lbl_DriverDetails').attr('style','color:#ffffff;');
        $('#LoanerEntryDetails_img_driver').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_driver.png');
    }
}


// isDriverSet Set Driver Info from selected list item	
function setDriverInfo() {
	//Driver Name
    sessionStorage.setItem('DriverFullName',Progress('lbl_DriverFullName').text());

    //Driver Address
    sessionStorage.setItem('DriverAddress1', Progress('lbl_DriverAddress1').text());
    sessionStorage.setItem('DriverAddress2', Progress('lbl_DriverAddress2').text());
    
    
    //Driver Date of Birth
    sessionStorage.setItem('DriverDOB',Progress('lbl_DriverDOB').text());
    
    //Driver License
    sessionStorage.setItem('DriverDLNumber', Progress('lbl_DriverDLNum').text());
    
    //Driver Phone
    sessionStorage.setItem('DriverPhone', Progress('lbl_DriverPhone').text());
    
    //Driver Renter Id
    sessionStorage.setItem('DriverRenterId', Progress('lbl_DriverRenterID').text());
    
    //Driver Bad Driver
    sessionStorage.setItem('DriverBadRenter', Progress('lbl_DriverBadRenter').text());
    
}



// isDriverSet Get Driver Info
function getSelectedDriverInfoPage() {
	Progress('lbl_SelectedDriverName').text(sessionStorage.getItem('DriverFullName'));
    Progress('lbl_SelectedDriverDOB').text(sessionStorage.getItem('DriverDOB'));
    Progress('lbl_SelectedDriverPhone').text(sessionStorage.getItem('DriverPhone'));
    Progress('lbl_SelectedDriverAddress1').text(sessionStorage.getItem('DriverAddress1'));
    Progress('lbl_SelectedDriverAddress2').text(sessionStorage.getItem('DriverAddress2'));
    Progress('lbl_SelectedDriverDLNum').text(sessionStorage.getItem('DriverDLNumber'));
    
    // hidden fields
    Progress('lbl_SelectedDriverRenterID').text(sessionStorage.getItem('DriverRenterId'));
    Progress('lbl_SelectedDriverBadRenter').text(sessionStorage.getItem('DriverBadRenter'));
}


// set the sessionStorage variable
function driverSelected() {
	sessionStorage.setItem('isDriverSet',true);
    isPaymentEnabled();
    isSignEnabled();
}

// isDriverSet Remove Driver Info
function removeDriverInfo() {
	sessionStorage.setItem('isDriverSet',false);
    
    sessionStorage.removeItem('DriverFullName');
    sessionStorage.removeItem('DriverDOB');
    sessionStorage.removeItem('DriverPhone');
    sessionStorage.removeItem('DriverAddress1');
    sessionStorage.removeItem('DriverAddress2');
    sessionStorage.removeItem('DriverDLNumber');
    sessionStorage.removeItem('DriverRenterId');
    sessionStorage.removeItem('DriverBadRenter');
    
    
    isPaymentEnabled();
    isSignEnabled();
}


/* ====================================== Vehicle ======================================= */
//isVehicleSet
function vehCheckbox() {
	var vehicleSet = localStorage.getItem('isVehicleSet');
    //alert("Is vehicle Set: " + vehicleSet);
    //alert("Boolean Compare: " + (vehicleSet === 'true') );
    
    if(vehicleSet === 'true') {
    	$('#LoanerEntryDetails_chbx_VehicleDet').prop('checked',true).checkboxradio('refresh');
    } else {
        $('#LoanerEntryDetails_chbx_VehicleDet').prop('checked',false).checkboxradio('refresh');
    }
    
    //alert("Is vehicle checked: "+ $('#LoanerEntryDetails_chbx_VehicleDet').is(':checked') );
}

//isVehicleSet
function isVehicleSelected() {
  var vehicleSet = sessionStorage.getItem('isVehicleSet');
  vehicleSelectSetup(vehicleSet);
    
  //deselect other tags
  driverDeselectSetup(sessionStorage.getItem('isDriverSet'));
  serviceDeselectSetup(sessionStorage.getItem('isServiceSet'));
  payDeselectSetup(sessionStorage.getItem('isPaymentSet'), sessionStorage.getItem('enablePayment'));
  signDeselectSetup(sessionStorage.getItem('isSigned'), sessionStorage.getItem('enableSign'));
    
    if(vehicleSet === 'true') {
        Progress('grid_SearchVehicle').hide();
        Progress('grid_SelectedVehicle').show();
        getSelectedVehicleInfoPage();
    } else {
        Progress('grid_SearchVehicle').show();
        Progress('grid_SelectedVehicle').hide();
    }	
}


function vehicleSelectSetup(isVehicleSet) {
    //background
    $('#LoanerEntryDetails_cell_VehicleDetails').attr('style','background:rgba(0, 0, 0, 0.5);');
    
    //isDriverSelected
    if(isVehicleSet === 'true') {
        //show green
    	$('#LoanerEntryDetails_lbl_VehicleDetails').attr('style','color:rgb(163,253,0);');
        $('#LoanerEntryDetails_img_vehicle').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_check.png');
    } else {
    	//show blue
        $('#LoanerEntryDetails_lbl_VehicleDetails').attr('style','color:#376dff;');
        $('#LoanerEntryDetails_img_vehicle').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_car_active.png');
    }
}

function vehicleDeselectSetup(isVehicleSet) {
    //background
    $('#LoanerEntryDetails_cell_VehicleDetails').attr('style','background:rgba(0, 0, 0, 0);');
    
    //isDriverSelected
    if(isVehicleSet === 'true') {
        //show green
    	$('#LoanerEntryDetails_lbl_VehicleDetails').attr('style','color:rgb(163,253,0);');
        $('#LoanerEntryDetails_img_vehicle').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_check.png');
    } else {
    	//show blue
        $('#LoanerEntryDetails_lbl_VehicleDetails').attr('style','color:#ffffff;');
        $('#LoanerEntryDetails_img_vehicle').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_car.png');
    }
}


// set the sessionStorage variable
function vehicleSelected() {
	sessionStorage.setItem('isVehicleSet',true);
    
    //Vehicle
    sessionStorage.setItem('VehicleClass', Progress('lbl_vehicleClass').text());
    sessionStorage.setItem('VehicleLicence',Progress('lbl_vehLicence').text());
    sessionStorage.setItem('VehicleName', Progress('lbl_VehicleName').text());
    sessionStorage.setItem('VehicleVIN', Progress('lbl_vehicleVIN').text());
    sessionStorage.setItem('VehicleColor', Progress('lbl_vehColor').text());
    sessionStorage.setItem('VehicleYear', Progress('lbl_vehicleYear').text());
    sessionStorage.setItem('VehicleState', Progress('lbl_vehState').text());
    
    isPaymentEnabled();
    isSignEnabled();
}

//Set the Selected Vehicle Grid
function getSelectedVehicleInfoPage() {
	Progress('lbl_selectedVehicleClass').text(sessionStorage.getItem('VehicleClass'));
    Progress('lbl_selectedVehicleName').text(sessionStorage.getItem('VehicleName'));
    Progress('lbl_selectedUnitNum').text(sessionStorage.getItem('VehicleVIN'));
    Progress('lbl_selectVehicleYear').text(sessionStorage.getItem('VehicleYear'));
    
    // hidden fields
    // Progress('lbl_SelectedDriverRenterID').text(sessionStorage.getItem('VehicleColor'));
    //Progress('lbl_SelectedDriverBadRenter').text(sessionStorage.getItem('VehicleLicence'));
    //Progress('lbl_SelectedDriverBadRenter').text(sessionStorage.getItem('VehicleState'));
}

// isVehicleSet Remove Vehicle Info
function removeVehicleInfo() {
	sessionStorage.setItem('isVehicleSet',false);
    
    
    //remove vehicle sessionStorage values. 
    sessionStorage.removeItem('VehicleClass');
    sessionStorage.removeItem('VehicleLicence');
    sessionStorage.removeItem('VehicleName');
    sessionStorage.removeItem('VehicleVIN');
    sessionStorage.removeItem('VehicleColor');
    sessionStorage.removeItem('VehicleYear');
    sessionStorage.removeItem('VehicleState');
    
    
    isPaymentEnabled();
    isSignEnabled();
}


// calculate the different of the endDate - startDate
function calculateDaysOut() {
	var startDate = new Date(Progress('inp_startDate').val());
    var endDate = new Date(Progress('inp_endDate').val());
    // alert("Start Date: "+startDate+"\nEnd Date: "+endDate);
    
    var diffDate = (endDate.getTime() - startDate.getTime());
    // alert("Date Diff: " + diffDate); 
    
    // alert("Date Diff Trans: "+ (diffDate/(1000* 3600 * 24) + 1));
    //set days out
    Progress('txt_DaysOut').val(diffDate/(1000* 3600 * 24) + 1);
}

// if given the start date and the number of days out. 
function calculateDueDate() {
    var startDate = new Date(Progress('inp_startDate').val());
    var daysOut = Progress('txt_DaysOut').val();

    var endDate = new Date(startDate.getTime() + daysOut *(1000 * 3600 * 24) );
    
    var formatMonth = endDate.getMonth() + 1;
    if(formatMonth < 10) {
        formatMonth += '';
    	formatMonth = '0'+formatMonth;
    }

    var formatDate = endDate.getDate();
    var formatYear = endDate.getFullYear();
    
    //set end date
    Progress('inp_endDate').val(formatYear + '-'+ formatMonth + '-' + formatDate);
}

/* ====================================== Service Order ======================================= */
//isServiceSet
function isServiceSelected() {
  var serviceSet = sessionStorage.getItem('isServiceSet');
  serviceSelectSetup(serviceSet);
    
  //deselect other tags
  driverDeselectSetup(sessionStorage.getItem('isDriverSet'));
  vehicleDeselectSetup(sessionStorage.getItem('isVehicleSet'));
  payDeselectSetup(sessionStorage.getItem('isPaymentSet'), sessionStorage.getItem('enablePayment'));
  signDeselectSetup(sessionStorage.getItem('isSigned'), sessionStorage.getItem('enableSign'));
}


function serviceSelectSetup(isServiceSet) {
    //background
    $('#LoanerEntryDetails_cell_ServiceOrderDetails').attr('style','background:rgba(0, 0, 0, 0.5);');
    
    //isServiceSelected
    if(isServiceSet === 'true') {
        //show green
    	$('#LoanerEntryDetails_lbl_ServiceOrder').attr('style','color:rgb(163,253,0);');
        $('#LoanerEntryDetails_img_service').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_check.png');
    } else {
    	//show blue
        $('#LoanerEntryDetails_lbl_ServiceOrder').attr('style','color:#376dff;');
        $('#LoanerEntryDetails_img_service').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_why_active.png');
    }
}

function serviceDeselectSetup(isServiceSet) {
    //background
    $('#LoanerEntryDetails_cell_ServiceOrderDetails').attr('style','background:rgba(0, 0, 0, 0);');
    
    //isServiceSelected
    if(isServiceSet === 'true') {
        //show green
    	$('#LoanerEntryDetails_lbl_ServiceOrder').attr('style','color:rgb(163,253,0);');
        $('#LoanerEntryDetails_img_service').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_check.png');
    } else {
    	//show blue
        $('#LoanerEntryDetails_lbl_ServiceOrder').attr('style','color:#ffffff;');
        $('#LoanerEntryDetails_img_service').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_why.png');
    }
}

// set the sessionStorage variable
function serviceSelected() {
	sessionStorage.setItem('isServiceSet',true);
    
    sessionStorage.setItem('ServiceSource', Progress('drpdwn_ServiceSource').val() );
    sessionStorage.setItem('ServiceDealership', Progress('drpdwn_ServiceDealership').val() );
    sessionStorage.setItem('ServiceAdvisor', Progress('drpdwn_ServiceAdvisor').val() );
	sessionStorage.setItem('ServiceRefferal', Progress('drpdwn_RentalReason').val() );
    
    getSelectedServiceInfoPage();
    
    isPaymentEnabled();
    isSignEnabled();
}

//Set the Selected Service Page
function getSelectedServiceInfoPage() {
	Progress('lbl_selectedSource').text(sessionStorage.getItem('ServiceSource'));
    Progress('lbl_SelectedDealership').text(sessionStorage.getItem('ServiceDealership'));
    Progress('lbl_SelectedAdvisor').text(sessionStorage.getItem('ServiceAdvisor'));
    Progress('lbl_SelectedRentalReason').text(sessionStorage.getItem('ServiceRefferal'));
}

// isServiceSet Remove service Info
function removeServiceInfo() {
	sessionStorage.setItem('isServiceSet',false);
    
    sessionStorage.removeItem('ServiceSource');
    sessionStorage.removeItem('ServiceDealership');
    sessionStorage.removeItem('ServiceAdvisor');
	sessionStorage.removeItem('ServiceRefferal');
    
    isPaymentEnabled();
}



/* ====================================== Payments ======================================= */
//isPaymentSet & enablePayment
function isPaymentEnabled() {
  	// check to see if driver, vehicle, and service information are set
    if (sessionStorage.getItem('isDriverSet') === 'true' &&
       sessionStorage.getItem('isVehicleSet') === 'true' &&
       sessionStorage.getItem('isServiceSet') === 'true') {
        	sessionStorage.setItem('enablePayment', true);
    } else {
  	// if not, then set enabled to false
    		sessionStorage.setItem('enablePayment', false);
        	removePaymentInfo();
    }

}

function isPaymentSelected() {
  var paymentSet = sessionStorage.getItem('isPaymentSet');
  
 paySelectSetup(paymentSet, sessionStorage.getItem('enablePayment'));
    
 //deselect other tags
 driverDeselectSetup(sessionStorage.getItem('isDriverSet'));
 vehicleDeselectSetup(sessionStorage.getItem('isVehicleSet'));
 serviceDeselectSetup(sessionStorage.getItem('isServiceSet'));
 signDeselectSetup(sessionStorage.getItem('isSigned'), sessionStorage.getItem('enableSign'));
  
  if(sessionStorage.getItem('enablePayment') === 'true') {
      // load payment page
      Progress('grid_noAccess').hide();
      Progress('grid_payment').show();
      
  } else {
      Progress('grid_payment').hide();
      Progress('grid_noAccess').show();
  }
}




function paySelectSetup(isPaymentSet, enablePayment) {
    //background
    $('#LoanerEntryDetails_cell_PaymentDetails').attr('style','background:rgba(0, 0, 0, 0.5);');
    
    //isPaymentSelected
    if(isPaymentSet === 'true') {
        //show green
    	$('#LoanerEntryDetails_lbl_Payments').attr('style','color:rgb(163,253,0);');
        $('#LoanerEntryDetails_img_payments').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_check.png');
    } else if(enablePayment === 'true') {
    	//show blue
        $('#LoanerEntryDetails_lbl_Payments').attr('style','color:#376dff;');
        $('#LoanerEntryDetails_img_payments').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_pay_active.png');
    } else {
    	//inactive
        $('#LoanerEntryDetails_lbl_Payments').attr('style','color:#676767;');
        $('#LoanerEntryDetails_img_payments').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_pay_disable.png');
    }
}

function payDeselectSetup(isPaymentSet, enablePayment) {
    //background
    $('#LoanerEntryDetails_cell_PaymentDetails').attr('style','background:rgba(0, 0, 0, 0);');
    
    //isPaymentSelected
    if(isPaymentSet === 'true') {
        //show green
    	$('#LoanerEntryDetails_lbl_Payments').attr('style','color:rgb(163,253,0);');
        $('#LoanerEntryDetails_img_payments').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_check.png');
    } else if(enablePayment === 'true') {
    	//show blue
        $('#LoanerEntryDetails_lbl_Payments').attr('style','color:#ffffff;');
        $('#LoanerEntryDetails_img_payments').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_pay.png');
    } else {
    	//inactive
        $('#LoanerEntryDetails_lbl_Payments').attr('style','color:#676767;');
        $('#LoanerEntryDetails_img_payments').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_pay_disable.png');
    }
}

function sumPayments() {
	var sumOfPay = 0.00;
    alert("Before sum: " + sumOfPay);
	
    //loop through all the dealer payments
    //get the list of dealer payments
    var dealerList = Progress("list_DealerCharges").children();
    alert("Dealer Length " + dealerList.length);
    
    //get the value from item
    for(i = 0; i < dealerList.length; i++) {
        alert("Get Item number "+i);
        var dealerItem = dealerList[i];
        alert("dealerItem is " + dealerItem.id);
    }
    //add to the sum
    
    //loop through all the renter payments
    
    alert("After sum: " + sumOfPay);
    Progress("lbl_amountDue").text("$"+sumOfPay.toFixed(2));
}


// set the sessionStorage variable
function paymentSelected() {
    if(sessionStorage.getItem('enablePayment') === 'true') {
		sessionStorage.setItem('isPaymentSet',true);
    } else {
    	sessionStorage.setItem('isPaymentSet',false);
    }
    isSignEnabled();
}

// isServiceSet Remove Vehicle Info
function removePaymentInfo() {
	sessionStorage.setItem('isPaymentSet',false);
    isSignEnabled();
}

/* ====================================== Review and Sign ======================================= */
//isSigned enableSign
function isSignEnabled() {
  	// check to see if driver, vehicle, and service information are set
    if (sessionStorage.getItem('isPaymentSet') === 'true') {
        	sessionStorage.setItem('enableSign', true);
    } else {
  	// if not, then set enabled to false
    		sessionStorage.setItem('enableSign', false);
        	disableContract();
    }
}

function enableContract() {
	sessionStorage.setItem('enableContract', true);
}

function disableContract() {
	sessionStorage.setItem('enableContract', false);
}

function isReviewSelected() {
  var signSet = sessionStorage.getItem('isSigned');
  
 signSelectSetup(signSet, sessionStorage.getItem('enableSign'));
    
 //deselect other tags
  driverDeselectSetup(sessionStorage.getItem('isDriverSet'));
  vehicleDeselectSetup(sessionStorage.getItem('isVehicleSet'));
  serviceDeselectSetup(sessionStorage.getItem('isServiceSet'));
  payDeselectSetup(sessionStorage.getItem('isPaymentSet'), sessionStorage.getItem('enablePayment'));
  
  if (signSet === 'true') {
      // load success popup
      Progress.openPopup('SuccessPopup',$(this));
      
  }else if(sessionStorage.getItem('enableContract') === 'true') {
      // load Review page
      Progress('grid_noAccess').hide();
      Progress('grid_contract').show();
      Progress('grid_Review').hide();
      
  } else if(sessionStorage.getItem('enableSign') === 'true') {
      Progress('grid_noAccess').hide();
      Progress('grid_contract').hide();
      Progress('grid_Review').show();
  } else {
  	 Progress('grid_Review').hide();
     Progress('grid_noAccess').show();
     Progress('grid_contract').hide();
  }
}


function signSelectSetup(isSigned, enableSign) {
    //background
    $('#LoanerEntryDetails_cell_ReviewOrder').attr('style','background:rgba(0, 0, 0, 0.5);');
    
    //isPaymentSelected
    if(isSigned === 'true') {
        //show green
    	$('#LoanerEntryDetails_lbl_Review').attr('style','color:rgb(163,253,0);');
        $('#LoanerEntryDetails_img_review').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_check.png');
    } else if(enableSign === 'true') {
    	//show blue
        $('#LoanerEntryDetails_lbl_Review').attr('style','color:#376dff;');
        $('#LoanerEntryDetails_img_review').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_review_active.png');
    } else {
    	//inactive
        $('#LoanerEntryDetails_lbl_Review').attr('style','color:#676767;');
        $('#LoanerEntryDetails_img_review').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_review_disable.png');
    }
}

function signDeselectSetup(isSigned, enableSign) {
    //background
    $('#LoanerEntryDetails_cell_ReviewOrder').attr('style','background:rgba(0, 0, 0, 0);');
    
    //isPaymentSelected
    if(isSigned === 'true') {
        //show green
    	$('#LoanerEntryDetails_lbl_Review').attr('style','color:rgb(163,253,0);');
        $('#LoanerEntryDetails_img_review').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_check.png');
    } else if(enableSign === 'true') {
    	//show white
        $('#LoanerEntryDetails_lbl_Review').attr('style','color:#ffffff;');
        $('#LoanerEntryDetails_img_review').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_review.png');
    } else {
    	//inactive
        $('#LoanerEntryDetails_lbl_Review').attr('style','color:#676767;');
        $('#LoanerEntryDetails_img_review').attr('src', 'BluebirdDemoApp_HTML/files/views/assets/image/ic_review_disable.png');
    }
}

function signSelected() {
	if(sessionStorage.getItem('enableContract') === 'true')
    	sessionStorage.setItem('isSigned', true);
}

function embedPDF() {
	//insert DOM for embed of pdf into the name="lbl_contract" div element
    //<embed src="url.pdf" width=800px height=1200px>
    //$('<p>Test</p>').appendTo('#ReviewAndSign_lbl_contract');
    //$('#ReviewAndSign_lbl_contract').append('<embed src=BluebirdDemoApp_HTML/files/views/assets/image/RA-797.pdf width=625px height=600px>');
    $('#ReviewAndSign_lbl_contract').append('<embed src=BluebirdDemoApp_HTML/files/views/assets/image/RA-797.pdf width=625px height=530px>');
    
}

function removeEmbeddedPDF() {
    $('#ReviewAndSign_lbl_contract').empty();
    
}

/* ====================================== Signature Popup ======================================= */

function createSignature() {
    
    
 $(document).ready(function() {
     $("#Signature_gridcell_signature").jSignature();
	    });
    
 sigElement = $("#Signature_gridcell_signature");
 
}

function clearSignature() {
   	sigElement.jSignature("reset");
}

function removeSignature() {
     sigElement.jSignature().remove();
}

/* ====================================== Success Screen ======================================= */

function dimBackground() {
	//need mobile container of LoanerEntryDetails
    // set the background over that by css class
    
}