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

            .on('column',function(key,value){
                  key = key.replace(/\.|\ |\\/gi, "_"); 
                  key = key.replace(/__/gi, "_");
                  if (key.slice(-1) == "_") key = key.slice(0,key.length-1);
                  var data_type;
                  if (value == parseInt(value)) {
                        data_type = 'number';
                  } else if (value == parseFloat(value)) {
                        data_type = 'number';
                  } else {
                        data_type = 'string';
                  }
                  adapter.log.info('ID: ' + key + '    Value: ' + value + '    Type: ' + data_type);

                  adapter.setObjectNotExists(key, {
                        type: 'state',
                        common: {
                              name: key,
                              type: data_type,
                              role: 'value'
                        },
                        native: {}
                  });

                  adapter.setState(key, {val: value, ack: true});


            })



      } else if (url_type == "http") {
            adapter.log.info('http request');

            request({
                  url: printer_url,
                  rejectUnauthorized: true
            }).pipe(csvStream)
            .on('error',function(err){
                  adapter.log.info(err);
            })
      
            .on('column',function(key,value){
                  key = key.replace(/\.|\ |\\/gi, "_"); 
                  key = key.replace(/__/gi, "_");
                  if (key.slice(-1) == "_") key = key.slice(0,key.length-1);
                  var data_type;
                  if (value == parseInt(value)) {
                        data_type = 'number';
                  } else if (value == parseFloat(value)) {
                        data_type = 'number';
                  } else {
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
      
                  adapter.setState(key, {val: value, ack: true});
      
            })
      
      }

      setTimeout(function () {
            adapter.stop();
      }, 60000);
}