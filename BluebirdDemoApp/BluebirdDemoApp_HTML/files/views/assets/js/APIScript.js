

/* ====================================== SearchDriver Functions ======================================= */
//Temp varables
var counterName = 0;
var tempName = '';

var counterAddress2 = 0;
var tempAddress2 = '';

//Format Name
function getFullNameSearch( value) {
    if(value == null)
        return 'Bad Name Given';

    if(counterName%2 == 0) {
         tempName = value;
    } else {
		 tempName =  tempName + " " + value;
    }
    
    counterName++;
    return tempName;
}

//Format Address
function getAddressLine1(address) {
	
}

function getAddressLine2(value) {
    if(value == null)
        return 'Bad Address Given';
    
    if(counterAddress2%3 == 0) {
        tempAddress2 = value;
    } else {
    	tempAddress2 = tempAddress2 + ", "+ value;
    }
    
    counterAddress2++;
	return tempAddress2;
}

//Format DOB
function formatDate(strDate) {
    if(strDate == null)
        return 'Bad Date';
    
	//Format the string given to a date
    //example  "DOB":"1960-02-28"
    var tempDate = strDate;
    tempDate = tempDate.replace(/[^0-9]/g, '');
    var month = getFullMonth( tempDate.replace(/(\d{4})(\d{2})(\d{2})/, "$2") );
    tempDate = tempDate.replace(/(\d{4})(\d{2})(\d{2})/, "$3, $1");
    return month + " "+tempDate;
   
}

//Format Phone Number
function getPhoneNum(phoneNum) {
    if(phoneNum == null)
        return 'Bad Phone Number';
    
    //format the string given to a phone number
    //example "HomePhone":"8005551212"
    var phone = phoneNum;
    phone = phone.replace(/[^0-9]/g,''); //<--- remove all values that is not a number
    phone = phone.replace(/(\d{3})(\d{3})(\d{4})/,"($1) $2-$3");
    return phone;
}

function getDriverLicense(DLNum) {
    if(DLNum == null)
        return 'Bad DLNum';
    
    //"DLNumber":"PA9875972159",
    return "DL#: " + DLNum;
}


/* ====================================== SearchVehicle Functions ======================================= */

//Format Name
function getVehicleNameSearch( value) {
    if(value == null)
        return 'Bad Name Given';

    if(counterName%2 == 0) {
         tempName = value;
    } else {
		 tempName =  tempName + " " + value;
    }
    
    counterName++;
    return tempName;
}

/* ====================================== ServiceOrderDetails Functions ======================================= */

/* ====================================== PaymentDetail Functions ======================================= */

/* ====================================== ReviewAndSign Functions ======================================= */


/* ====================================== Utility Functions ======================================= */


function resetCounter(counter) {
	counter = 0;
}

function getCounter(counter) {
	return counter;
}

var month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";


function getFullMonth(num) {
    //If parameter is a string, make into a number
    if(!typeof num == 'number') {
    	return 'String Value';
    }
    
	return month[num-1]; 
}


function testAlert(strValue) {
    alert(strValue);
}


/**/