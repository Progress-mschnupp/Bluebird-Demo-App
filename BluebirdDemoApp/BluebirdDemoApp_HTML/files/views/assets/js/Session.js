/* Copyright (c) 2012-2014 Progress Software Corporation and/or its subsidiaries or affiliates.
 * All rights reserved.
 *
 * Redistributable Code.
 *
 */

/* Session.js  -- wrapper for Mobile App Builder Session service implementation code 
   
   Version: 2.0.0-1 

 */

$t.Session = $t.createClass(null, {

    init : function(requestOptions) {
        this._impl = new SessionImpl( this );
		this._impl.init(requestOptions);        
    },

    process : function(settings) {
		this._impl.process(settings);        
    }

});
