/* Copyright (c) 2012-2013 Progress Software Corporation and/or its subsidiaries or affiliates.
 * All rights reserved.
 *
 * Redistributable Code.
 *
 */

/* 
   JSDO.js -- wrapper for Mobile App Builder JSDO services implementation code 
   
    Version: 2.0.0-1 
*/

$t.JSDO = $t.createClass(null, {

     init: function(requestOptions) {
         this._impl = new JSDOImpl( this );
         this._impl.init(requestOptions);
     },

     process: function(settings) {
         this._impl.process(settings);
     }
});
