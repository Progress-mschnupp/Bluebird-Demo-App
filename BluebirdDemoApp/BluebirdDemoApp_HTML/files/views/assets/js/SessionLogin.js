/* Copyright (c) 2012-2013 Progress Software Corporation and/or its subsidiaries or affiliates.
 * All rights reserved.
 *
 * Redistributable Code.
 *
 */

/* SessionLogin.js  -- wrapper for Mobile App Builder SessionLogin service implementation code 
   
   Version: 2.0.0-1 

*/

$t.SessionLogin = $t.createClass(null, {
		
		init : function(requestOptions) {
			this._impl = new SessionLoginImpl( this );
            this._impl.init(requestOptions);
		},    
        
        process : function(settings) {

        	this._impl.process(settings);
        }
	});
