/*
 * Service settings
 */
var SessionService_Settings = {
    "serviceURI": "",
    "catalogURIs": "",
    "authenticationModel": "ANONYMOUS",
    "authenticationResource": ""
};

/*
 * Session services
 */
/* JSDO Session service */

var SessionService_Session = new Appery.Session({
    'serviceSettings': SessionService_Settings
});

/* JSDO Session login */

var SessionService_Login = new Appery.SessionLogin({
    'service': SessionService_Session
});

/* JSDO Session logout */

var SessionService_Logout = new Appery.SessionLogout({
    'service': SessionService_Session

});

/*
 * Services
 */

var getVehicleClasses = new Appery.RestService({
    'url': 'https:\/\/dvsvr.barscloud.com:8943\/RWMobile\/rest\/RWMobileService\/beCode\/ReadbeCode',
    'dataType': 'json',
    'type': 'put',
    'contentType': 'application/json',
});

var getLocations = new Appery.RestService({
    'url': 'https:\/\/dvsvr.barscloud.com:8943\/RWMobile\/rest\/RWMobileService\/beCode\/ReadbeCode',
    'dataType': 'json',
    'type': 'put',
    'contentType': 'application/json',
});

var createNewRentalAgreement = new Appery.RestService({
    'url': 'https:\/\/dvsvr.barscloud.com:8943\/RWMobile\/rest\/RWMobileService\/beRAMob',
    'dataType': 'json',
    'type': 'post',
    'contentType': 'application/json',
});

var GEtTest = new Appery.RestService({
    'url': 'https:\/\/dvsvr.barscloud.com:8943\/RWMobile\/static\/mobile\/RWMobileService.json',
    'dataType': 'json',
    'type': 'get',
});

var getRentalAgreement = new Appery.RestService({
    'url': 'https:\/\/dvsvr.barscloud.com:8943\/RWMobile\/rest\/RWMobileService\/beRAMob',
    'dataType': 'json',
    'type': 'get',
});

var getPaymenTypes = new Appery.RestService({
    'url': 'https:\/\/dvsvr.barscloud.com:8943\/RWMobile\/rest\/RWMobileService\/beCode\/ReadbeCode',
    'dataType': 'json',
    'type': 'put',
    'contentType': 'application/json',
});

var getVehicles = new Appery.RestService({
    'url': 'https:\/\/dvsvr.barscloud.com:8943\/RWMobile\/rest\/RWMobileService\/beVehicleSearch\/ReadbeVehicleSearch',
    'dataType': 'json',
    'type': 'put',
    'contentType': 'application/json',
});

var beDriverSearch = new Appery.RestService({
    'url': 'https:\/\/dvsvr.barscloud.com:8943\/RWMobile\/rest\/RWMobileService\/beDriverSearch\/ReadbeDriverSearch',
    'dataType': 'json',
    'type': 'put',
    'contentType': 'application/json',
});

var getRentalReasons = new Appery.RestService({
    'url': 'https:\/\/dvsvr.barscloud.com:8943\/RWMobile\/rest\/RWMobileService\/beCode\/ReadbeCode',
    'dataType': 'json',
    'type': 'put',
    'contentType': 'application/json',
});

var getDealerships = new Appery.RestService({
    'url': 'https:\/\/dvsvr.barscloud.com:8943\/RWMobile\/rest\/RWMobileService\/beCode\/ReadbeCode\/',
    'dataType': 'json',
    'type': 'put',
    'contentType': 'application/json',
});

var getReferrals = new Appery.RestService({
    'url': 'https:\/\/dvsvr.barscloud.com:8943\/RWMobile\/rest\/RWMobileService\/beCode\/ReadbeCode',
    'dataType': 'json',
    'type': 'put',
    'contentType': 'application/json',
});

var getAgents = new Appery.RestService({
    'url': 'https:\/\/dvsvr.barscloud.com:8943\/RWMobile\/rest\/RWMobileService\/beCode\/ReadbeCode',
    'dataType': 'json',
    'type': 'put',
    'contentType': 'application/json',
});