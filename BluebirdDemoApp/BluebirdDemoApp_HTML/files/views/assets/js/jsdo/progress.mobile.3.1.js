/* Copyright (c) 2012-2014 Progress Software Corporation and/or its subsidiaries or affiliates.
 * All rights reserved.
 *
 * Redistributable Code.
 *
 */

/* ========================================================
   JSDOServices.js -- implementations for Mobile App Builder JSDO services 
   
    Version: 3.0.0-1
*/

/* ***** JSDO service implementation code ***** */
JSDOImpl = function( jsdoBase ) {

    this._jsdoBase = jsdoBase;

    this.init = function(requestOptions) {
        this._jsdoBase.jsdo = null;
        this._jsdoBase.__requestOptions = $.extend({}, requestOptions);        
        this._jsdoBase.serviceSettings = this._jsdoBase.__requestOptions.serviceSettings;
        
        this._jsdoBase.normalizeError = function (request) {        
           var cError = "";   
           var response;
            
            /* Try to get the error string. First try to get an     
               _error object, otherwise see if the error came     
               as a string in the body. If nothing is set, then     
               just get the native statusTest */
            response = request.response;            
            
            if (response && response._errors && response._errors.length > 0)        
                cError = response._errors[0]._errorMsg;                     
            if (cError == "" && request.xhr.responseText.substring(0,6) != "<html>")      
                cError = request.xhr.responseText;      
            if (cError == "")
                cError = request.xhr.statusText;     
            return cError;   
         };
    };

     
    this.process = function(settings) {

        var status = 'error';

        if (this._jsdoBase.__requestOptions.echo) {
             throw new Error ("Echo not supported");
        } else {
             this._jsdoBase.jsdo = new progress.data.JSDO({
                 name: this._jsdoBase.serviceSettings.resourceName
             });

             settings.success();
             status = 'success';
        }
        settings.complete(null, status);

    };
};



/* ***** JSDORead service implementation code ***** */
JSDOReadImpl = function( jsdoReadBase ) {

	this._readBase = jsdoReadBase;
	
    this.init = function(requestOptions) {
        this._readBase.__requestOptions = $.extend({}, requestOptions);
    };

    this.process = function(settings) {
        if (this._readBase.__requestOptions.echo)    
            throw new Error("Echo not supported");

        var filter = '';
        var isLocal = false;

        if (settings.data.filter != undefined) 
            filter = settings.data.filter;
        if (settings.data.readLocal != undefined) {  
            if ((typeof(settings.data.readLocal) != 'string') ||
                (settings.data.readLocal.toLowerCase() != 'false')) {
                isLocal = Boolean(settings.data.readLocal);
            }
        }

        var svc_jsdo = this._readBase.__requestOptions.service.jsdo;
        if (!isLocal) {
            
            /* before sending the request, save it away so we executed
               only the function for this DataSource */
            var beforeFillFn = function (jsdo, request) {
                jsdo.unsubscribe('beforeFill', beforeFillFn);
                settings.request = request;
            };
                
            var afterFillFn = function(jsdo, success, request) {                
            
                var doNested = false;
                
                /* if not for the same request saved away on the before
                   fill fn, just return */
                if (request != settings.request)
                    return;
                
                /* unsubscribe so this fn doesn't execute for some other
                   Tiggr.DataSource event */                
                jsdo.unsubscribe('afterFill', afterFillFn);
                
                var cStatus = 'success';
                if (success) {

		    // If at least one of the buffers has nested on, then call _getDataObjectAsNested()
		    // which will return the data in its nested format. 
		    // Otherwise just use the response (more efficient)
		    var data = request.response;
		    for (var buf in svc_jsdo._buffers) {
		        if (svc_jsdo._buffers[buf]._isNested) {
		            data = svc_jsdo._getDataObjectAsNested();
            	    	    doNested = true;
		            break;
		        }
		    }
		    
                    settings.success(data);

		    // Once done with mappings (done via settings.success()) unnest data
		    // Data in jsdo is stored as unnested
            	    if (doNested) {
			svc_jsdo._unnestData();
	    	    }

                } else {
                    var cError = settings.service.normalizeError(request);

                    settings.error(request.xhr, cError);
                    cStatus = cError;
                }
                settings.complete(request.xhr, cStatus);
            };
            svc_jsdo.subscribe('beforeFill', beforeFillFn);
            svc_jsdo.subscribe('afterFill', afterFillFn);
            svc_jsdo.fill(filter);
        } else {
	    // Get data from jsdo local memory
            var data;
            var doNested = false;

	    // Determine if we should return data as nested  - if at least one of the buffers is nested 
	    for (var buf in svc_jsdo._buffers) {
	        if (svc_jsdo._buffers[buf]._isNested) {
            	    doNested = true;
		    break;
		}
	    }

            if (doNested) {
		data = svc_jsdo._getDataObjectAsNested();
	    } else {
                data = svc_jsdo._getDataObject();
	    }

            settings.success(data);
            settings.complete(null, 'success');

	    // Once done with mappings (done via settings.success()) unnest data
            if (doNested) {
		svc_jsdo._unnestData();
	    }
        }
    };

};




/* ***** JSDOCreate service implementation code ***** */
JSDOCreateImpl = function( jsdoCreateBase ) {
    
	this._createBase = jsdoCreateBase;
	
    this.init = function(requestOptions) {
        this._createBase.__requestOptions = $.extend({}, requestOptions);
    };
    
    this.process = function(settings) {        
        if (this._createBase.__requestOptions.echo)
            throw new Error ("Echo not supported");  
        
        var svc_jsdo = this._createBase.__requestOptions.service.jsdo;   
        var tableName = this._createBase.__requestOptions.tableName;    
        var localOnly = false;
            
        if (settings.data.localOnly != undefined) {  
            if ((typeof(settings.data.localOnly) != 'string') ||
                (settings.data.localOnly.toLowerCase() != 'false')) {
                localOnly = Boolean(settings.data.localOnly);
            }
        }
            
        if (tableName == undefined)    
            tableName = svc_jsdo._dataProperty;     
        
        /* object with initial values, if specified */
        var datarec = svc_jsdo[tableName]._recFromDataObject(settings.data);
        var jsrow = svc_jsdo[tableName].add(datarec);
          
        if (jsrow != undefined) {     
            if (localOnly) {            
                var data = svc_jsdo[tableName]._recToDataObject(jsrow.data, false);
               
                settings.success(data);
                settings.complete(null, 'success');
            }
            else {
                /* before sending the request, save it away so we execute
                   only the function for this DataSource */
                var beforeCreateFn = function (jsdo, jsrecord, request) {
                    jsdo[tableName].unsubscribe('beforeCreate', beforeCreateFn);
                    settings.request = request;
                }; 
                
                var afterCreateFn = function(jsdo, record, success, request) {
               
                    /* if not for the same request saved away on the before
                       create/update fn, just return */
                    if (request != settings.request)
                        return;
                   
                   /* unsubscribe so this fn doesn't execute for some other
                      Tiggr.DataSource event */               
                   jsdo[tableName].unsubscribe('afterCreate', afterCreateFn);
                   
                   var cStatus = 'success';
                   
                   if (success) {
                       settings.success(request.response);
                   } else {                        
                       var cError = settings.service.normalizeError(request);
                       settings.error(request.xhr, cError);      
                       cStatus = cError;
                   }
                   settings.complete(request.xhr, cStatus);
               };
                
               svc_jsdo[tableName].subscribe('beforeCreate', beforeCreateFn);
               svc_jsdo[tableName].subscribe('afterCreate', afterCreateFn);
               svc_jsdo.saveChanges();                
            }
        }
        else {     
            settings.error(null, 'Failed to add record');
            settings.complete(null, 'Failed to add record');          
        }
    };
};          



/* ***** JSDOUpdate service implementation code ***** */
JSDOUpdateImpl = function( jsdoUpdateBase ) {

	this._updateBase = jsdoUpdateBase;

	this.init = function(requestOptions) {
        this._updateBase.__requestOptions = $.extend({}, requestOptions);
    };

    this.process = function(settings) {

        if (this._updateBase.__requestOptions.echo) 
            throw new Error("Echo not supported");

        var svc_jsdo = this._updateBase.__requestOptions.service.jsdo;
        var tableName = this._updateBase.__requestOptions.tableName;
        var localOnly = false;

        if (settings.data.localOnly != undefined) {  
            if ((typeof(settings.data.localOnly) != 'string') ||
                (settings.data.localOnly.toLowerCase() != 'false')) {
                localOnly = Boolean(settings.data.localOnly);
            }
        }
        
        if (tableName == undefined) 
            tableName = svc_jsdo._dataProperty;

        var datarec = svc_jsdo[tableName]._recFromDataObject(settings.data);
        var theid = datarec._id;
        
        var jsrow = svc_jsdo[tableName].findById(theid);

        if (jsrow != undefined) {
            jsrow.assign(datarec);
            
           if (localOnly) {
               settings.success(settings.data); 
               settings.complete(null, 'success');
           }
           else {                
                /* before sending the request, save it away so we execute
                   only the function for this DataSource */
                var beforeCreateUpdateFn = function (jsdo, jsrecord, request) {
                    jsdo[tableName].unsubscribe('beforeCreate', beforeCreateUpdateFn);
                    jsdo[tableName].unsubscribe('beforeUpdate', beforeCreateUpdateFn);
                    settings.request = request;
                };
                
               var afterCreateUpdateFn = function(jsdo, record, success, request) {
                   
                    /* if not for the same request saved away on the before
                       create/update fn, just return */
                    if (request != settings.request)
                        return;
                   
                   /* unsubscribe so this fn doesn't execute for some other
                      Tiggr.DataSource event */               
                   jsdo[tableName].unsubscribe('afterCreate', afterCreateUpdateFn);
                   jsdo[tableName].unsubscribe('afterUpdate', afterCreateUpdateFn);
                   
                   var cStatus = 'success';
                   
                   if (success) {
                       settings.success(request.response);
                   } else {                        
                       if (request.operation == progress.data.JSDO._OP_CREATE) {
                           /* this is the case where the record was added to the
                              local store and then updated, but since the record
                              was never sent to the server, it is really a create
                              operation (not an update), so we will put the record
                              back into the local store. Do it before calling 
                              settings.error() so new record is working record*/
                           jsdo[tableName].add(record.data);
                       }
                       var cError = settings.service.normalizeError(request);
                       settings.error(request.xhr, cError);      
                       cStatus = cError;
                   }
                   settings.complete(request.xhr, cStatus);
               };               
               svc_jsdo[tableName].subscribe('beforeCreate', beforeCreateUpdateFn);
               svc_jsdo[tableName].subscribe('beforeUpdate', beforeCreateUpdateFn);
               svc_jsdo[tableName].subscribe('afterCreate', afterCreateUpdateFn);
               svc_jsdo[tableName].subscribe('afterUpdate', afterCreateUpdateFn);
               svc_jsdo.saveChanges();
           }
        } else {
            settings.error(null, 'Row not found');
            settings.complete(null, 'Row not found');
        }
    };

};



/* ***** JSDODelete service implementation code ***** */
JSDODeleteImpl = function( jsdoDeleteBase ) {

	this._deleteBase = jsdoDeleteBase;

	this.init = function(requestOptions) {
        this._deleteBase.__requestOptions = $.extend({}, requestOptions);
    };

    this.process = function(settings) {

        if (this._deleteBase.__requestOptions.echo)     
            throw new Error("Echo not supported");

        var svc_jsdo = this._deleteBase.__requestOptions.service.jsdo;
        var tableName = this._deleteBase.__requestOptions.tableName;        
        var localOnly = false;

        if (settings.data.localOnly != undefined) {  
            if ((typeof(settings.data.localOnly) != 'string') ||
                (settings.data.localOnly.toLowerCase() != 'false')) {
                localOnly = Boolean(settings.data.localOnly);
            }
        }
        
        if (tableName == undefined) 
            tableName = svc_jsdo._dataProperty;

        var datarec = svc_jsdo[tableName]._recFromDataObject(settings.data);
        var theid = datarec._id;

        var jsrow = svc_jsdo[tableName].findById(theid);
        if (jsrow != undefined) { 
            
            /* before sending the request, save it away so we execute
               only the function for this DataSource */
            var beforeDeleteFn = function (jsdo, jsrecord, request) {
                jsdo[tableName].unsubscribe('beforeDelete', beforeDeleteFn);
                settings.request = request;
            };
            
            var afterDeleteFn = function(jsdo, record, success, request) {
                
                /* if not for the same request saved away on the before
                   delete fn, just return */
                if (request != settings.request)
                    return;
                
                /* unsubscribe so this fn doesn't execute for some other
                   Tiggr.DataSource event */
                jsdo[tableName].unsubscribe('afterDelete', afterDeleteFn);
                
                var cStatus = 'success';
                
                if (success) {
                    settings.success(request.response);                
                } else {                    
                    var cError = settings.service.normalizeError(request);

                    settings.error(request.xhr, cError);
                    cStatus = cError;
                }
                settings.complete(request.xhr, cStatus);
            };                
            jsrow.remove();
            if (localOnly) {
                settings.success({}); 
                settings.complete(null, 'success');
            }
            else {
                svc_jsdo[tableName].subscribe('beforeDelete', beforeDeleteFn);
                svc_jsdo[tableName].subscribe('afterDelete', afterDeleteFn);
                svc_jsdo.saveChanges();
            }
        } else {
            settings.error(null, 'Row not found');
            settings.complete(null, 'Row not found');
        }
    };

};



/* ***** JSDORow service implementation code ***** */
JSDORowImpl = function( jsdoRowBase ) {

	this._rowBase = jsdoRowBase;

	this.init = function(requestOptions) {
        this._rowBase.__requestOptions = $.extend({}, requestOptions);
    };

    this.process = function(settings) {

    	var status = 'error';
        if (this._rowBase.__requestOptions.echo) {
            throw new Error ("Echo not supported");  
        } else {         
            var svc_jsdo = this._rowBase.__requestOptions.service.jsdo;
            var theid =  settings.data.id;        
            var tableName = this._rowBase.__requestOptions.tableName;    
            
            if (tableName == undefined)
                tableName = svc_jsdo._dataProperty;    
            
            jsrow = svc_jsdo[tableName].findById(theid);
            if (jsrow != undefined)    
            {        
                var data = svc_jsdo[tableName]._recToDataObject(jsrow.data, true);
                
                settings.success(data);                
                status = 'success';
            }
            else     
                settings.error(null, 'Row not found');
        }
        settings.complete(null, status);     
   }; 
};



/* ***** JSDOInvoke service implementation code ***** */
JSDOInvokeImpl = function( jsdoInvokeBase ) {

	this._invokeBase = jsdoInvokeBase;

	this.init = function(requestOptions) {
        this._invokeBase.__requestOptions = $.extend({}, requestOptions);
    };

    this.process = function(settings) {

    	if (this._invokeBase.__requestOptions.echo)   
            throw new Error ("Echo not supported");   
        
        var svc_jsdo = this._invokeBase.__requestOptions.service.jsdo;
        var methodName = this._invokeBase.__requestOptions.methodName;  
        
        /* before sending the request, save it away so we execute
           only the function for this DataSource */
        var beforeInvokeFn = function (jsdo, request) {
            jsdo.unsubscribe('beforeInvoke', methodName, beforeInvokeFn);
            settings.request = request;
        };
        
        var afterInvokeFn = function(jsdo, success, request) {
            
            /* if not for the same request saved away on the before
               invoke fn, just return */
            if (request != settings.request)
                return;   
            
            /* unsubscribe so this fn doesn't execute for some other
               Tiggr.DataSource event */                
            jsdo.unsubscribe('afterInvoke', methodName, afterInvokeFn);
            
            var status = 'success';
            if (success) {
                settings.success(request.response);
            } else {
                status = 'error';                
                var cError = settings.service.normalizeError(request);
                
                settings.error(request.xhr, cError);
            }
            settings.complete(request.xhr, status);
        };
        svc_jsdo.subscribe('beforeInvoke', methodName, beforeInvokeFn);
        svc_jsdo.subscribe('afterInvoke', methodName, afterInvokeFn);
        svc_jsdo[methodName](settings.data);            
    }; 

};

/* ***** JSDOSubmit service implementation code ***** */
JSDOSubmitImpl = function (jsdoSubmitBase) {

    this._submitBase = jsdoSubmitBase;

    this.init = function (requestOptions) {
        this._submitBase.__requestOptions = $.extend({}, requestOptions);
    };

    this.process = function (settings) {

        if (this._submitBase.__requestOptions.echo)
            throw new Error("Echo not supported");

        var svc_jsdo = this._submitBase.__requestOptions.service.jsdo;
        
        /* Before sending the request, save it away so we execute
         * only the function for this DataSource */
        var beforeSaveChangesFn = function (jsdo, request) {
            jsdo.unsubscribe('beforeSaveChanges', beforeSaveChangesFn);
            settings.request = request;
        };

        var afterSaveChangesFn = function (jsdo, success, request) {
            /* If not for the same request saved away on the before
             * saveChanges fn, just return */
            if (request != settings.request)
                return;

            /* Unsubscribe so this fn doesn't execute for some other
             * Tiggr.DataSource event */
            jsdo.unsubscribe('afterSaveChanges', afterSaveChangesFn);

            var cStatus = 'success';

            if (success || (request.xhr.status >= 200 && request.xhr.status < 300)) {
                settings.success(request.response);
            } else {
                var cError = settings.service.normalizeError(request);

                settings.error(request.xhr, cError);
                cStatus = cError;
            }
            settings.complete(request.xhr, cStatus);
        };

        svc_jsdo.subscribe('beforeSaveChanges', beforeSaveChangesFn);
        svc_jsdo.subscribe('afterSaveChanges', afterSaveChangesFn);
        svc_jsdo.saveChanges(true);  // set useSubmit param to true
        
    };
};
/* Copyright (c) 2012-2014 Progress Software Corporation and/or its subsidiaries or affiliates.
 * All rights reserved.
 *
 * Redistributable Code.
 *
 */

/* ========================================================
   SessionServices.js -- implementations for Mobile App Builder Session services 
   
    Version: 3.1.2-01 
*/

/* *****  Session service implementation code ***** */
SessionImpl = function( sessionBase ) {
    
    this._sessionBase = sessionBase;
    
    this.init = function(requestOptions) {
        this._sessionBase.pdsession = null;
        this._sessionBase.__requestOptions = $.extend({}, requestOptions); 
        this._sessionBase.serviceSettings = this._sessionBase.__requestOptions.serviceSettings;
    };
    
    this.process = function(settings) {
        if (this._sessionBase.__requestOptions.echo)    
            throw new Error("Echo not supported");
        
        var cError;
        var bSuccess = true;
        
        if (this._sessionBase.pdsession === null)
            this._sessionBase.pdsession = new progress.data.Session();
        
        try {
            // addCatalog() will throw an exception if it fails
            // TODO: support FILE protocol or relative path for loading local catalogs
            // before logging in (need to do a case-insensitive compare below?)
            var catalogURIs = this._sessionBase.serviceSettings.catalogURIs.split(',');
                    
            this._sessionBase.pdsession.authenticationModel = null;            
            for (var i = 0; i < catalogURIs.length; i++) {
                var urlObject = $.mobile.path.parseUrl(catalogURIs[i]);
                if (urlObject.protocol === "file:" || (urlObject.protocol === "" && urlObject.filename.length > 0) )
                    this._sessionBase.pdsession.addCatalog(catalogURIs[i]);
            }
            this._sessionBase.pdsession.authenticationModel = this._sessionBase.serviceSettings.authenticationModel;
        } 
        catch (e) {
            cError = e.message;
            bSuccess = false;
        } 

        var status = bSuccess?'success':'error';        
        if (bSuccess) {
            settings.success({});
        }
        else {
            settings.error(null, cError);
        }

        if ( settings.offline ) {
        	this._sessionBase.pdsession.subscribe( "offline", settings.offline, settings);
        }
    	if ( settings.online ) {
    		this._sessionBase.pdsession.subscribe( "online", settings.online, settings);
    	}

        settings.complete(null, status);
    };
};


/* *****  SessionLogin service implementation code ***** */
SessionLoginImpl = function( sessionLoginBase ) {
		
		this._loginBase = sessionLoginBase;
		
		this.init = function(requestOptions) {
            this._loginBase.pdsession = null;
        	this._loginBase.__requestOptions = $.extend({}, requestOptions); 
        	this._loginBase.serviceSettings = this._loginBase.__requestOptions.service.serviceSettings;
		};    
        
        this.process = function(settings) {
            if (this._loginBase.__requestOptions.echo)    
            	throw new Error("Echo not supported");
            
            var cMsg = "ok";
            var bSuccess = true;
            
            try {
				showSpinner();
 
                if (settings.service.pdsession === null) {
                    cMsg = "Session must be instantiated before calling Login Service.";
                    bSuccess = false;
                }
                else {
                    this._loginBase.pdsession = settings.service.pdsession;
                
                    // This should be set to either "anonymous", "form" or "basic"
                    this._loginBase.pdsession.authenticationModel = 
                             this._loginBase.serviceSettings.authenticationModel;
            
                    this._loginBase.pdsession.xClientProps = 
                        this._loginBase.serviceSettings.xClientProps ? this._loginBase.serviceSettings.xClientProps : null;                        
                    var loginResult = this._loginBase.pdsession.login(this._loginBase.serviceSettings.serviceURI,
                                                  settings.data.username, settings.data.password, 
                                                  this._loginBase.serviceSettings.authenticationResource);

                    if (loginResult != progress.data.Session.LOGIN_SUCCESS) {
                        bSuccess = false;
                        
                        switch (loginResult) {
                            case progress.data.Session.LOGIN_AUTHENTICATION_FAILURE:
                                cMsg = 'Invalid userid or password';
                            break;
                            case progress.data.Session.LOGIN_GENERAL_FAILURE:
                            default:
                                cMsg = 'Service is unavailable';
                            break;
                        };        
                    }
                }
			} 
            catch (e) {
  				cMsg = "Failed to log in. " + e.message;
  				//console.log(e.stack);
                bSuccess = false;
			}
			finally {
                if (cMsg != "ok" && this._loginBase.pdsession) {
                    var loginHttpStatus = this._loginBase.pdsession.loginHttpStatus;
                    if (loginHttpStatus != undefined)
                        cMsg = 'HTTP Status  ' + loginHttpStatus.toString() + ': ' + cMsg;
                }
                    
               	hideSpinner();
            }

            // If login was successful, add any catalog(s) that were specified in settings
            // (If no catalogs have been specified, we will still return success. If invalid
            // catalogs have been specified, it is an error) 
            if (     bSuccess == true 
            	  && (this._loginBase.serviceSettings.catalogURIs != undefined)  
            	  && (this._loginBase.serviceSettings.catalogURIs.length > 0) ) {
                try {
                	// addCatalog() will usually throw an exception if it fails,
                    // but will simply return an error if there's an authentication error
                    var catalogURIs = this._loginBase.serviceSettings.catalogURIs.split(',');
                    var serviceURI = this._loginBase.serviceSettings.serviceURI;
                    for (var i = 0; i < catalogURIs.length; i++) {
                        var urlObject = $.mobile.path.parseUrl(catalogURIs[i]);
                        if (urlObject.protocol === "") {
                            if (catalogURIs[i].charAt(0) === "/")
                                catalogURIs[i] = serviceURI + catalogURIs[i];
                            else
                                catalogURIs[i] = serviceURI + "/" + catalogURIs[i];
                        }
                    }                
                    var addResult = progress.data.Session.SUCCESS;
                    for (var i = 0; i < catalogURIs.length; i++) {
						addResult = this._loginBase.pdsession.addCatalog(catalogURIs[i]);
                        if (addResult !== progress.data.Session.SUCCESS &&
                            addResult !== progress.data.Session.CATALOG_ALREADY_LOADED )
                        {
                            var httpStatus = ".";
                            if (this._loginBase.pdsession.lastSessionXHR) {
                                httpStatus = ". HTTP Status: " +
                                                this._loginBase.pdsession.lastSessionXHR.status;
                            }
                        	throw new Error("addCatalog failed. Return code: " + addResult + httpStatus);    
                        }
                    }
            	} 
                catch (e) {
                    cMsg = e.message;
                    bSuccess = false;
            	} 
        	}
            
            if (bSuccess == true) {
            	settings.success({}); 
            	settings.complete(null, 'success'); 
            }
            else {    
                if ( this._loginBase.pdsession ) {
                    settings.error(this._loginBase.pdsession.lastSessionXHR, cMsg);                    
                }
                else {
                    settings.error(null, cMsg);
                }
        		settings.complete(null, 'error');
            }
                
		}; 
	};
	
	

/* *****  SessionLogout service implementation code ***** */
	SessionLogoutImpl = function( sessionLogoutBase ) {	
		
		this._logoutBase = sessionLogoutBase;
		
		this.init = function(requestOptions) {
			this._logoutBase.__requestOptions = $.extend({}, requestOptions);
		};
		
		this.process = function(settings) {
            var status = 'error';
            if (this._logoutBase.__requestOptions.echo)    
            	throw new Error("Echo not supported");			
        	 
            var pdsession = settings.service.pdsession;
            
            if (pdsession != null) {
            	try 
				{
					pdsession.logout();
                	settings.success({});
                	status = 'success';
				}
				catch(err)
				{
   					var cError = "Error in LogOut: " + err.message;
                	settings.error(pdsession.lastSessionXHR, cError);
				}
            }
            // else pdsession was not set
            else {
            	var cMsg = "Error in LogOut: Can't log out. The Login service was not invoked";
                settings.error(null, cMsg);
            }
			
			settings.complete(null, status);
		}; 
        
	};
	/* Copyright (c) 2013 Progress Software Corporation and/or its subsidiaries or affiliates.
 * All rights reserved.
 *
 * Redistributable Code.
 *
 */

/* ========================================================
   express.js -- support code for Express Projects

    Version: 3.0.0-9
*/

(function () {
if (typeof progress == 'undefined')
    progress = {};
if (typeof progress.ui == 'undefined')
    progress.ui = {};
if (typeof progress.ui.util == 'undefined') {
    progress.ui.util = {};

    progress.ui.util.enableElement = function (elementName, value) {
        var element = $("[dsid="+elementName+"]");
        if (element.length == 0) {
            element = $("#"+elementName);
        }

        if (value === undefined) {
            value = true;
        }
        if (value) {
                element.removeClass("ui-disabled");
        }
        else {
                element.addClass("ui-disabled");
        }
    };

}

/*
 * ExpressUIController
 *
 * Provides functionality a UIExpressProject.
 *
 * Initialization parameters:
 * appconfig: appconfig,
 * listPageName: "ExpressListPage",
 * listViewName: "expressList",                    
 * detailPageName: "ExpressDetailPage",
 * formName: "expressDetailGrid",
 * detailEditPageName: "ExpressDetailEditPage",
 * editFormName: "expressEditableDetailGrid",
 * authenticationModel: progress.data.Session.AUTH_TYPE_ANON,
 *
 * Set to true to use the default list template, false to use the definition in the designer                                        
 * useDefaultListTemplate: true,
 *
 * Set to true to use the default form template, false to use the definition in the designer                            
 * useDefaultFormTemplate: false,
 *                   
 * Set to true to use the table name in the title of the pages                    
 * useTableNameInTitle: true,
 *
 * Set to true to sort records automatically                    
 * sortRecords: true
 */
progress.ui.ExpressUIController = function ExpressUIController() {
	this.useTabletLayout = false;	
	var appconfig = null;

	if ( !arguments[0] ) {
		throw new Error("ExpressUIController: Parameters are required in constructor.");
	}    
    
	if ( typeof(arguments[0]) == "object" ) {
		var args = arguments[0];
		for (var v in args) {
			switch(v) {
			case 'appconfig':
				appconfig = args[v];
				break;
			default:
				this[v] = args[v];
			}
		}
	}

	if (this.autoSave == undefined) {
		this.autoSave = true;
	}
    
	if (!appconfig)
		throw new Error("ExpressUIController: ExpressUIController constructor is missing the value for 'appconfig'");
        
	// Check required appconfig properties
    var props = "catalogURI,serviceURI,resourceName,tableRef".split(',');
    
    for (var i=0;i<props.length;i++) {
        if (!appconfig[props[i]])
			throw new Error("ExpressUIController: appconfig requires a value for '"+props[i]+"'");
    }    
    
	// Check required ExpressUIController properties
    var props = "listPageName,listViewName".split(',');
    
    for (var i=0;i<props.length;i++) {
        if (!this[props[i]])
			throw new Error("ExpressUIController: ExpressUIController constructor is missing the value for '"+props[i]+"'");
    }        

	if (typeof this.swatches == "string") {
		var swatches = this.swatches.split(',');
		if (swatches.length == 2) {
			try {
				this.listItemDataTheme = swatches[0];
				this.inputFieldDataTheme = swatches[1];
			} catch (e) {
				// Ignore exceptions
			}			
		}
	}
	if (this.listItemDataTheme == undefined) this.listItemDataTheme = "f";	
	if (this.inputFieldDataTheme == undefined) this.inputFieldDataTheme = "g";
    
	this.createJSDO = function createJSDO() {
		appconfig.jsdo = new progress.data.JSDO({ name: appconfig.resourceName });
		appconfig.jsdo.subscribe('AfterFill', this.onAfterFill, this);
		appconfig.jsdo.subscribe('AfterSaveChanges', this.onAfterSaveChanges, this);		
    
    	if (this.sortRecords) {
            var fields = [];
            if (appconfig.sortFields)
                fields = appconfig.sortFields.split(',');
            else if (appconfig.listFields) {
            	// AutoSort records using the first field in the list
				fields = appconfig.listFields.split(',');
				if (fields.length > 0)                
                	fields = [ fields[0] ];
            }
			appconfig.jsdo.setSortFields(fields);
    	}    
	};
      
	this.getJSDO = function() {
		return appconfig.jsdo;        
    };
    
	this.initializeUI = function() {
		this.setPageTitle();        
		var expressSubmitButton = $("[dsid=expressSubmitButton]");
		var expressSaveButton = $("[dsid=expressSaveButton]");
		var expressErrorPageButton = $("[dsid=expressErrorPageButton]");
		expressErrorPageButton.hide();
		if (this.autoSave) {
			expressSubmitButton.hide();
		}
		else {
			expressSaveButton.text("Done");			
		}
    };
    
	this.onLoadExpressListPage = function() {
        if (!this.autoSave) {
		    progress.ui.util.enableElement("expressSubmitButton", appconfig.jsdo.hasChanges());
        }
	};

	this.setPageTitle = function() {
		if (!this.useTableNameInTitle)
		return;
        var element;		
		if (typeof appconfig.tableName != 'string' || appconfig.tableName.length === 0)
			return;
		if (this.listPageName) {
			element = $("[dsid="+this.listPageName+"] [dsid=mobileheader]");
            if (typeof element == 'object' && element.length > 0) {				
                element.html((appconfig.tableName.charAt(appconfig.tableName.length - 1) != 's') ? appconfig.tableName + 's' : appconfig.tableName);
			}
		}
		if (this.detailPageName) {
			element = $("[dsid="+this.detailPageName+"] [dsid=mobileheader]");
			if (typeof element == 'object' && element.length > 0) {
                element.html((appconfig.tableName.charAt(appconfig.tableName.length - 1) != 's') ? appconfig.tableName + ' Detail' : 'Detail');
			}
		}    
		if (this.detailEditPageName) {
			element = $("[dsid="+this.detailEditPageName+"] [dsid=mobileheader]");
			if (typeof element == 'object' && element.length > 0) {
				element.html((appconfig.tableName.charAt(appconfig.tableName.length - 1) != 's') ? appconfig.tableName + ' Detail' : 'Detail');
			}
		}            
    };

	this.setFilter = function(filter) {
		this.filter = filter;        
    };
    
	var lastSelected = undefined;        

    this.onSelectItem = function(event, item, jsrecord) {
        // removeClass() seems to only remove the first class 
    	if (lastSelected != undefined) {            
        	var classes = $(lastSelected).attr('class').split(' ');
        	var newclasses = undefined;
            // Exclude classes from data-theme=g which prevents change of style
        	for (var i=0;i<classes.length;i++) {
                if (classes[i] == 'ui-btn-up-g') continue;
                if (classes[i] == 'ui-btn-hover-g') continue;                
            	if (newclasses == undefined) {
					newclasses = classes[i];
            	}
            	else {
                	newclasses += ' ' + classes[i];
            	}
        	}
			$(lastSelected).attr('class', newclasses);
			$(lastSelected).attr('data-theme', 'f').trigger('mouseout');
        }
        if (item && $(item).attr('class')) {
        	var classes = $(item).attr('class').split(' ');
        	var newclasses = undefined;
            // Exclude classes from data-theme=f which prevents change of style
        	for (var i=0;i<classes.length;i++) {
                if (classes[i] == 'ui-btn-up-f') continue;
                if (classes[i] == 'ui-btn-hover-f') continue;                
            	if (newclasses == undefined) {
					newclasses = classes[i];
            	}
            	else {
                	newclasses += ' ' + classes[i];
            	}
        	}
			$(item).attr('class', newclasses);
			$(item).attr('data-theme', 'g').trigger('mouseout');
            if (this.useTabletLayout && jsrecord && (event == undefined)) {                              
				setTimeout(
                    'scrollToItem("'+
            		this.listViewName+
            		'","'+
            		jsrecord.getId()+'");', 500);
            }                    
			lastSelected = item;
        }
	};        
    
	this.createUIHelper = function() {
		var field = null;
		var format = undefined;
		var schema = appconfig.jsdo[appconfig.tableRef].getSchema();
	
		if (this.useDefaultListTemplate) {
        	format = "";
			if (!appconfig.listFields) {
				// Select first string field or first field
				for (var i = 0; i < schema.length; i++) {
					if (schema[i].name == "_id") continue;
                    if (schema[i].name.charAt(0) == "_") continue;
					if (!field)
						field = schema[i];	
					else if (schema[i].type == "string") {
						field = schema[i];
						break;
					}
				}	
	
				if (field) {
					format = '{' + field.name + '}';
				}
			}
			else {
				var fields = appconfig.listFields.split(",");
				for (var i = 0; i < fields.length; i++) {
					format += '{' + fields[i] + '}<br>';
				}
			}
    	}
	
		progress.ui.UIHelper.setItemTemplate('<li data-theme="'+this.listItemDataTheme
			+'" data-id="{__id__}"><a href="#{__page__}" class="ui-link" data-transition="slide">{__format__}</a></li>');
        
		appconfig.uihelper = new progress.ui.UIHelper({ jsdo: appconfig.jsdo });
        if (this.detailPageName) {
			appconfig.uihelper[appconfig.tableRef].setDetailPage({
				name: this.detailPageName
			});				
        }
		appconfig.uihelper[appconfig.tableRef].setListView({
			name: this.listViewName, 
			format: format,
			autoLink: true,
            onSelect: this.useTabletLayout?this.onSelectItem:undefined
		});            

        if (this.useDefaultFormTemplate) {
			var fields = null;        
    	    if (appconfig.formFields) {
        		fields = appconfig.formFields.split(",");
            	fields.push("_id");
			}        
            
			// Use data-theme="g" for fields in edit page
			progress.ui.UIHelper.setFieldTemplate(
				'<div data-role="fieldcontain"><label for="{__name__}">{__label__}</label><input data-theme="'+this.inputFieldDataTheme
				+'" id="{__name__}" name="{__name__}" placeholder="" value="" type="text" /></div>');
    		var formFields = appconfig.uihelper[appconfig.tableRef].getFormFields( fields );

    		var element = undefined;
        	if (this.editFormName) {        
				element = appconfig.uihelper[appconfig.tableRef]._getIdOfElement(this.editFormName);
 				$('#' + element).html(formFields);
        	}            
            
			// Use default field template for detail page
			progress.ui.UIHelper.setFieldTemplate(null);
			formFields = appconfig.uihelper[appconfig.tableRef].getFormFields( fields );
            
        	if (this.formName) {                
				element = appconfig.uihelper[appconfig.tableRef]._getIdOfElement(this.formName);
 				$('#' + element).html(formFields);
			}            
    
    		var fields = appconfig.jsdo[appconfig.tableRef].getSchema();
    		for(var i=0;i<fields.length;i++) {
        		var field = fields[i];
				$('#' + element + ' #' + field.name).attr('readonly', 'true');
	    	}    

			// Force JQuery Mobile to update styles for HTML elements
    		$(".ui-page").trigger("create");
        }
        else {             
			var formFields = appconfig.uihelper[appconfig.tableRef].getFormFields( [ "_id" ] );
                        
        	if (this.editFormName) {        
				var element = appconfig.uihelper[appconfig.tableRef]._getIdOfElement(this.editFormName);
 				$('#' + element).append(formFields);
        	}            
            
        	if (this.formName) {                                
				var element = appconfig.uihelper[appconfig.tableRef]._getIdOfElement(this.formName);
 				$('#' + element).append(formFields);
			}                        
        }
        
		this.detailPageNameId = appconfig.uihelper[appconfig.tableRef]._getIdOfElement(this.detailPageName);
		this.detailEditPageNameId = appconfig.uihelper[appconfig.tableRef]._getIdOfElement(this.detailEditPageName);    
        
	};

    this.onLoginSuccess = function() {
    	// Create JSDO, UIHelper and load records
		this.createJSDO();
		this.createUIHelper();
    
		appconfig.uihelper[appconfig.tableRef].clearItems();
		appconfig.uihelper[appconfig.tableRef].showListView();
    
		showSpinner(); // Call showSpinner() before fill - call hideSpinner() in AfterFill event.
		appconfig.jsdo.fill(this.filter);
    
    	// Navigate to list page
		Tiggr.navigateTo(this.listPageName, {reverse: false});
    };
    
	this.addRecord = function() {
    	appconfig.jsdo[appconfig.tableRef].add();
		appconfig.uihelper[appconfig.tableRef].display(this.detailEditPageNameId);
    	$('#'+this.detailEditPageNameId + ' [dsid=expressDeleteButton]').hide();
    	this.editMode = 'add';
		if (this.useTableNameInTitle && this.detailEditPageName) {
	        var element = $("[dsid="+this.detailEditPageName+"] [dsid=mobileheader]");
    	    if (typeof element == 'object' && element.length > 0) {
				element.html('Add ' + (appconfig.tableName?appconfig.tableName:""));
			}
    	}    
		
		if (this.useTabletLayout) {
			var element = null; 
/*
			if (this.listPageName) {
				element = $("[dsid="+this.listPageName+"]");
			}
*/
			Appery.openPopup(this.detailEditPageName, element);
		}
		else
			Tiggr.navigateTo(this.detailEditPageName, {reverse: false});		
	};

	this.updateRecord = function() {
		appconfig.uihelper[appconfig.tableRef].getFormRecord();
		appconfig.uihelper[appconfig.tableRef].display(this.detailEditPageNameId);
    	$('#'+this.detailEditPageNameId + ' [dsid=expressDeleteButton]').show();
    	// Force JQuery Mobile to update style for button
    	$('#'+this.detailEditPageNameId + ' [dsid=expressDeleteButton]').attr("style","");
    	this.editMode = 'edit';
		if (this.useTableNameInTitle && this.detailEditPageName) {
        	var element = $("[dsid="+this.detailEditPageName+"] [dsid=mobileheader]");
        	if (typeof element == 'object' && element.length > 0 
				&& (typeof appconfig.tableName == 'string') && (appconfig.tableName.length > 0)) {
				element.html((appconfig.tableName.charAt(appconfig.tableName.length - 1) != 's') ? appconfig.tableName + ' Detail' : 'Detail');				
			}
    	}    

		if (this.useTabletLayout) {
			var element = null; 
/*
			if (this.listPageName) {
				element = $("[dsid="+this.listPageName+"]");
			}
*/
			Appery.openPopup(this.detailEditPageName, element);
		}
		else
			Tiggr.navigateTo(this.detailEditPageName, {reverse: false});
	};

	this.refreshErrorPage = function() {
	};

	this.clearErrors = function() {
		appconfig.jsdo._lastErrors = [];
		$("[dsid=expressErrorPageButton]").hide();
		Tiggr.navigateTo(this.listPageName, {reverse: false});              
	};
	
	this.refreshErrorList = function() {
		var listviewElement = $("[dsid=expressErrorList]");
		var listviewContent = "";
		
		for (var i = 0; i < appconfig.jsdo._lastErrors.length; i++) {
			listviewContent += '<li data-theme="'+this.listItemDataTheme+'"><pre style="white-space: normal">' 
							+ appconfig.jsdo._lastErrors[i].errorString + '</pre></li>';
		}		
		listviewElement.html(listviewContent);
		try {
			listviewElement.listview("refresh");
		}
		catch(e) {
			// Workaround for issue with JQuery Mobile throwning exception on refresh
		}		
	};
	
	this.navigateToErrorPage = function() {
		this.refreshErrorList();
        if (this.useTabletLayout) {
			var element = null; 
/*
			if (this.listPageName) {
				element = $("[dsid="+this.listPageName+"]");
			}
*/
			Appery.openPopup("ExpressErrorPage", element);
		}
        else
			Tiggr.navigateTo("ExpressErrorPage", {reverse: false});
	};
	
	this.navigateToListPage = function() {
		if (this.autoSave) {
			if (this.editMode == 'add') {
				Tiggr.navigateTo(this.listPageName, {reverse: false});			
			}
			else {
				if (this.useTabletLayout)
					Tiggr.navigateTo(this.listPageName, {reverse: false});              
				else
					Tiggr.navigateTo(this.detailPageName, {reverse: false});
			}					
		}
		else {
			// Submit
			Tiggr.navigateTo(this.listPageName, {reverse: false});
		}
	};
	
    this.cancelRecord = function() {
    	if (this.editMode == 'add') {
    		appconfig.uihelper[appconfig.tableRef].getFormRecord(this.detailEditPageNameId);  
		    appconfig.jsdo[appconfig.tableRef]._remove(false);  	
		    Tiggr.navigateTo(this.listPageName, {reverse: false});
    	}
    	else {
    		if (this.useTabletLayout)
    			Tiggr.navigateTo(this.listPageName, {reverse: false});    			
    		else
    			Tiggr.navigateTo(this.detailPageName, {reverse: false});
		}
	};

	this.saveRecord = function() {
		showSpinner();        		    
    	appconfig.uihelper[appconfig.tableRef].getFormRecord(this.detailEditPageNameId);
		appconfig.uihelper[appconfig.tableRef].assign(this.detailEditPageNameId);
		
		if (this.autoSave) {
			appconfig.jsdo.saveChanges();
		}
		else {
			// Submit
			$("[dsid=expressErrorPageButton]").hide();
			progress.ui.util.enableElement("expressSubmitButton", true);
			this.refreshList();			
			this.navigateToListPage();
		}
    };
    
	this.submitChanges = function() {
		if (appconfig.jsdo.hasChanges()) {
			$("[dsid=expressErrorPageButton]").hide();			
		    progress.ui.util.enableElement("expressSubmitButton", false);
			showSpinner();
			appconfig.jsdo.saveChanges( appconfig.jsdo._hasSubmitOperation );
		}
	};

	this.deleteRecord = function() {
		showSpinner();
    	var jsrecord = appconfig.uihelper[appconfig.tableRef].getFormRecord(
			this.useTabletLayout?this.detailPageNameId:this.detailEditPageNameId);
        
        // Calculate id of the next record
        try {
        	var id = jsrecord.getId();
            var element = $('[data-id='+id+']');
        	var index = element.index();
            if (index > 0) {
            	var elements = element.parent().children();
                this._nextRecord = $(elements[index-1]).attr('data-id');
            }            
        } catch (e) {
            // Ignore exceptions
        }            
        
        appconfig.jsdo[appconfig.tableRef].remove();		
		if (this.autoSave) {
			appconfig.jsdo.saveChanges();
		}
		else {
			// Submit
			$("[dsid=expressErrorPageButton]").hide();			
			progress.ui.util.enableElement("expressSubmitButton", true);
			this.refreshList();			
			this.navigateToListPage();
		}		
    };
       
    this.refresh = function() {
		if (!this.autoSave && appconfig.jsdo.hasChanges()) {
			localStorage.setItem('locMessageText', 'There are pending changes.\n\nPlease submit changes before reloading the data.');
			var element = null; 
/*
			if (this.listPageName) {
				element = $("[dsid="+this.listPageName+"]");
			}
*/
			Appery.openPopup('MessagePopup', element);			
		}
		else {
			if (!this.autoSave) {
				$("[dsid=expressErrorPageButton]").hide();
			}			
			showSpinner();    
			appconfig.uihelper[appconfig.tableRef].clearItems();
			appconfig.uihelper[appconfig.tableRef].showListView();    
			appconfig.jsdo.fill(this.filter);
		}
    };

	this.refreshList = function() {
		showSpinner();
    	try {
            /* First clear out search filter if listview has search filter on */
            var hasSearch = 'false';
            try {
            	hasSearch = $('[dsid=expressList]').getAttr('data-filter');
            }
            catch(e) {
				// Ignore exception. If data-filter not set, hasSearch will be false
			}
            if (hasSearch == 'true') {
				$('[dsid=expressList]').prev().find('input').val("");
            }
            
			appconfig.uihelper[appconfig.tableRef].clearItems();
            var recordId = arguments[0];
			appconfig.jsdo[appconfig.tableRef].foreach(function(record) {
                if (!recordId) {
                    recordId = appconfig.jsdo[appconfig.tableRef].getId();
                }
				appconfig.uihelper[appconfig.tableRef].addItem();        			        			
			});
			appconfig.uihelper[appconfig.tableRef].showListView();
            
            if (recordId) {
				var jsrecord = appconfig.jsdo[appconfig.tableRef].findById(recordId);
                if (jsrecord) {
                    var elements = $('[data-id='+recordId+']');
                    if (this.useTabletLayout && elements.length > 0) {
                        this.onSelectItem(null, elements[0], jsrecord);
                    }
					appconfig.uihelper[appconfig.tableRef].display();
                }
            }
    	}
    	finally {
			hideSpinner();        
    	}
	};

	this.onAfterFill = function(jsdo, success, request) {
		this.refreshList();        
	};
	

	this.onAfterSaveChanges = function(jsdo, success, request) {
		hideSpinner();    
        if (!this.autoSave) {
		    progress.ui.util.enableElement("expressSubmitButton", false);
        }
		
		try {    
            if (success) {
				if (!this.autoSave) {
					this._nextRecord = null;
                    this.refreshList(null);										
				}
                else if (request.batch && request.batch.operations && request.batch.operations.length == 1) {
            		switch (request.batch.operations[0].operation) {
                		case progress.data.JSDO._OP_CREATE:
							Tiggr.navigateTo(this.listPageName, {reverse: false});
                            var jsrecord = request.batch.operations[0].jsrecord;
        					this.refreshList(jsrecord?jsrecord.getId():null);                          
                        	break;
						case progress.data.JSDO._OP_UPDATE:
					    	appconfig.uihelper[appconfig.tableRef].getFormRecord();
					    	appconfig.uihelper[appconfig.tableRef].display();
							if (this.useTabletLayout) {
								Tiggr.navigateTo(this.listPageName, {reverse: false});
								var jsrecord = appconfig.uihelper[appconfig.tableRef].getFormRecord();                  
								this.refreshList(jsrecord?jsrecord.getId():null);								
							}
							else
								Tiggr.navigateTo(this.detailPageName, {reverse: false});                        
                        	break;
						case progress.data.JSDO._OP_DELETE:
							Tiggr.navigateTo(this.listPageName, {reverse: false});
                            var id = this._nextRecord;
                            this._nextRecord = null;
        					this.refreshList(id);
                        	break;                    
            		}
        		}
			}
			else {
			    var exception = null;
			    var errors = null;
				if (request.batch && request.batch.operations) {					
            	if (request.batch.operations.length == 1) {
            		switch (request.batch.operations[0].operation) {
                		case progress.data.JSDO._OP_CREATE:
                		    appconfig.jsdo[appconfig.tableRef].add(request.batch.operations[0].jsrecord.data);
                            // This ensures that new _id (created by add()) is written out to edit page
		    	            appconfig.uihelper[appconfig.tableRef].display(this.detailEditPageNameId);     
                		    break;
                		case progress.data.JSDO._OP_UPDATE:
                		    break;
						case progress.data.JSDO._OP_DELETE:
						    // Navigate back to edit page to remove popup
							if (this.useTabletLayout)
			                    Appery.closePopup();
		                    else
			                    Appery.navigateTo(this.detailEditPageName, {reverse: false});
                        	break;
            		}
					if (request.batch.operations[0].exception) {
						exception = request.batch.operations[0].exception;                            
                    }
		            if (request.batch.operations[0].xhr.status == 500) {
		                try {
		                    errors = "";
		                    var responseObject = JSON.parse(request.batch.operations[0].xhr.responseText);
		                    if (responseObject._errors instanceof Array) {
		                        for (var i = 0; i < responseObject._errors.length; i++) {
		                            errors += responseObject._errors[i]._errorMsg + '\n';
		                        }
		                    }
		                    if (responseObject._retVal) {
		                        errors += responseObject._retVal;
		                    }
		                }
		                catch (e) {
		                    // Ignore exceptions
		                }
		            }
					}
					else {
						errors = "";
						for (var i = 0; i < request.batch.operations.length; i++) {
							if (!request.batch.operations[i].success 
								&& request.batch.operations[i].xhr
								&& request.batch.operations[i].xhr.status == 500) {
								try {
									errors += "\n";
									var responseObject = JSON.parse(request.batch.operations[i].xhr.responseText);
					
									if (responseObject._errors instanceof Array) {
										for (var j = 0; j < responseObject._errors.length; j++) {
											errors += responseObject._errors[j]._errorMsg + '\n';
										}
									}
									if (responseObject._retVal) {
										errors += responseObject._retVal;
									}					
								}
								catch (e) {
									// Ignore exceptions
								}
							}							
							if (request.batch.operations[i].exception) {
								if (errors.length == 0)
									errors = request.batch.operations[i].exception;
								else
									errors += "\n" + request.batch.operations[i].exception;
							}														
						}						
					}
				}
				else if (request.xhr && request.xhr.status == 500) {
					try {
						errors = "";
						var responseObject = JSON.parse(request.xhr.responseText);
						if (responseObject._errors instanceof Array) {
							for (var i = 0; i < responseObject._errors.length; i++) {
								errors += responseObject._errors[i]._errorMsg + '\n';
							}
						}
						if (responseObject._retVal) {
							errors += responseObject._retVal;
						}
					}
					catch (e) {
						// Ignore exceptions
					}
				}
                var message = "";
				if (exception) {
            		if (exception.stack)
  						message = exception.stack;
            		else
                		message = exception.message;
                }
                if (errors) {
                    if (message.length > 0) {
                        message += '\n' + errors;
                    }
                    else
                      message = errors;
                }
                
				if (!this.autoSave && jsdo._lastErrors.length > 0) {
					$("[dsid=expressErrorPageButton]").show();
					if (message.length == 0 && jsdo._lastErrors.length == 1) {
						message = jsdo._lastErrors[0].errorString;
					}
					else {
						if (message.length > 0) message += "\n\n";
						message += "Submit failed with " + jsdo._lastErrors.length + (jsdo._lastErrors.length == 1 ? " error." : " errors.");
					}
					message += "\n\nPlease use Errors button to see a list of errors.";					
				}
				if (message.length > 0) {
					console.log(message);
				}
                alert('ERROR while saving changes:\n\n'+ message);
				if (!this.autoSave) {
					this._nextRecord = null;
                    this.refreshList(null);										
				}				
            }    
        }
		finally {				
		}
	};                            
    
};                                                           
})();
                            
function scrollToItem(listViewName, id) {
	try {                            
		var elements = $('[data-id='+id+']');
    	if (elements.length > 0) {
			var container = $('[dsid='+listViewName+']').parents('[data-scroll=y]')[0];
			var height = $(container).parents('[data-role=page]').height();
			var scrollview = $(container).data('mobile-scrollview');
			if (elements[0].offsetTop < (height * 0.75)) {
				scrollview.scrollTo(0,0);
            }
			else {
				scrollview.scrollTo(0,-(elements[0].offsetTop)); 
			}
    	}
	}
	catch(e) {
		// Ignore exceptions
		// console.log(e);
	}
}

function AppConfigProcessor() {
    if (typeof appconfig == 'object') {
        
        if (SessionService_Session.serviceSettings.serviceURI === "") SessionService_Session.serviceSettings.serviceURI = (appconfig.serviceURI !== undefined) ? appconfig.serviceURI : "";
        
        if (SessionService_Session.serviceSettings.catalogURIs === "") SessionService_Session.serviceSettings.catalogURIs = (appconfig.catalogURIs !== undefined) ? appconfig.catalogURIs : "";
        
        if (SessionService_Session.serviceSettings.authenticationModel.toUpperCase() === "ANONYMOUS") SessionService_Session.serviceSettings.authenticationModel = (appconfig.authenticationModel !== undefined) ? appconfig.authenticationModel : "ANONYMOUS";
        
        if (appconfig.xClientProps) SessionService_Session.serviceSettings.xClientProps = appconfig.xClientProps;
    }
}

