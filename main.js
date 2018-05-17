/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
var request = require('request');
var csv = require('csv-stream');

// All of these arguments are optional.
var options = {
    endLine : '\n', // default is \n,
    enclosedChar : '"' // default is an empty string
}

var csvStream = csv.createStream(options);


var adapter = new utils.Adapter('brother_hl-4150');



adapter.on('ready', function () {
    main();
});


function main() {
      var url_type = adapter.config.url_type;
      var printer_ip = adapter.config.printer_ip;
      var printer_url = url_type + "://" + printer_ip + "/etc/mnt_info.csv";
    adapter.log.info('url_type: ' + url_type);
    adapter.log.info('printer_ip: ' + printer_ip);
    adapter.log.info('printer_url: ' + printer_url);
   
   if (url_type == "https") {
           adapter.log.info('https request');
   
           request({
                 url: printer_url,
                  rejectUnauthorized: false
                 }).pipe(csvStream)
           .on('error',function(err){
                 adapter.log.info(err);
           })
//           .on('header', function(columns) {
//                 adapter.log.info(columns);
//           })
//           .on('data',function(data){
                 // outputs an object containing a set of key/value pair representing a line found in the csv file.
//                 adapter.log.info(data);
//           })
           .on('column',function(key,value){
                 // outputs the column name associated with the value found
                 
                 key = key.replace(/\.|\ |\\/gi, "_"); 
                 
                 var data_type
                 
                 
                 if (value == parseInt(value)) 
                 {
                 data_type = 'number';
                 }
                 else if (value == parseFloat(value)) 
                 {
                 data_type = 'number';
                 }
                 else
                 {
                 data_type = 'string';
                 }
                 
                 
                 
                 
                 
                 
                 
                                  
                 adapter.log.info('#' + key + ' = ' + value + '    ---   type =' + data_type);
                 
                 
                 
                 adapter.setObjectNotExists(key, {
                     type: 'state',
                     common: {
                         name: key,
                         type: data_type,
                         role: 'value'
                     },
                     native: {}
                 });
                 
                 adapter.setState(key, {val: String(value), ack: true});
                 
                 
           })
   
           
  /* 
                  if (!error && response.statusCode == 200) {
   
                       for (var key in content.sensordatavalues) {
                           
   
                          
                       }
   
                   } else {
                       adapter.log.error(error);
                   }
   
               }
           );
   */
   
       } else if (url_type == "http") {
           adapter.log.info('http request');
   
           request(
               {
                   url: "http://api.luftdaten.info/v1/sensor/" + sensorIdentifier + "/",
                   json: true
               },
               function(error, response, content) {
                   adapter.log.debug('Request done');
   
                   if (!error && response.statusCode == 200) {
   
                       for (var key in content[0].sensordatavalues) {
                           var obj = content[0].sensordatavalues[key];
   
                           adapter.setObjectNotExists('SDS_' + obj.value_type, {
                               type: 'state',
                               common: {
                                   name: 'SDS_' + obj.value_type,
                                   type: 'number',
                                   role: 'value'
                               },
                               native: {}
                           });
   
                           adapter.setState('SDS_' + obj.value_type, {val: obj.value, ack: true});
                       }
   
                   } else {
                       adapter.log.error(error);
                   }
               }
           );
   
       }
   
       setTimeout(function () {
           adapter.stop();
       }, 60000);
   



   }