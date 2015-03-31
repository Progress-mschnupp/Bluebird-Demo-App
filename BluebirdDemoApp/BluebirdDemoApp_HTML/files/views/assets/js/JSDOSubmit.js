/* Copyright (c) 2014 Progress Software Corporation and/or its subsidiaries or affiliates.
 * All rights reserved.
 *
 * Redistributable Code.
 *
 */

/* 
   JSDOSubmit.js -- wrapper for JSDOSubmit service implementation code 
  
    Version: 2.3.0-1 
*/

$t.JSDOSubmit = $t.createClass(null, {

    init: function(requestOptions) {
    	this._impl = new JSDOSubmitImpl( this );
    	this._impl.init( requestOptions );
    },

    process: function(settings) {
        this._impl.process(settings);
    }

});
