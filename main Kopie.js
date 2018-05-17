/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
var request = require('request');
var csv = require('csv-stream');

// All of these arguments are optional.
var options = {
    delimiter : '\t', // default is ,
    endLine : '\n', // default is \n,
    columns : ['columnName1', 'columnName2'], // by default read the first line and use values found as columns
    columnOffset : 2, // default is 0
    escapeChar : '"', // default is an empty string
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
   
           request(
               {
                   url: printer_url,
                   rejectUnauthorized: false,
                   pipe: csvStream
               },
   
   
               function(error, response, content) {
   
                   adapter.log.debug(content);
  /* 
                  if (!error && response.statusCode == 200) {
   
                       for (var key in content.sensordatavalues) {
                           var obj = content.sensordatavalues[key];
   
                           adapter.setObjectNotExists(obj.value_type, {
                               type: 'state',
                               common: {
                                   name: obj.value_type,
                                   type: 'number',
                                   role: 'value'
                               },
                               native: {}
                           });
   
                           adapter.setState(obj.value_type, {val: obj.value, ack: true});
                       }
   
                   } else {
                       adapter.log.error(error);
                   }
   */
               }
           );
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