// Generated by CoffeeScript 1.9.0
(function() {
  var async, autoable, clone, convert, defaults, extend, openLogFile, port, portscanner, spawn, subprocess, verify;

  portscanner = require('portscanner');

  async = require('async');

  clone = require('lodash').clone;

  extend = require('deep-extend');

  port = require('./port');

  openLogFile = require('./log');

  spawn = require('./spawn');

  verify = require('./verify');

  convert = function(proc) {
    var _base;
    proc = extend({}, defaults(proc.name), proc);
    if ((_base = proc.spawnOpts).cwd == null) {
      _base.cwd = process.cwd();
    }
    return function(callback) {
      return openLogFile(proc.spawnOpts.cwd, proc.logFilePath, function(error, results) {
        var logHandle, logPath, spawnOpts;
        if (error != null) {
          return callback(error);
        }
        logHandle = results.fd, logPath = results.filename;
        spawnOpts = {
          stdio: ['ignore', logHandle, logHandle],
          env: process.env
        };
        extend(spawnOpts, proc.spawnOpts);
        return port.findOpen(proc.port, function(error, availablePort) {
          var child;
          if (error != null) {
            return callback(error);
          }
          child = spawn(proc.name, proc.command, availablePort, logPath, logHandle, spawnOpts);
          return verify(child, proc.verify, proc.verifyInterval, proc.verifyTimeout, availablePort, function(error) {
            if (error != null) {
              return callback(error);
            }
            return callback(null, child);
          });
        });
      });
    };
  };

  autoable = function(name, proc) {
    var array, func, _ref;
    proc.name = name;
    func = convert(proc);
    if (((_ref = proc.dependsOn) != null ? _ref.length : void 0) > 0) {
      array = clone(proc.dependsOn);
      array.push(func);
      return array;
    } else {
      return func;
    }
  };

  defaults = function(procName) {
    return {
      port: 0,
      logFilePath: "./log/" + procName + ".log",
      spawnOpts: {},
      verifyInterval: 100,
      verifyTimeout: 3000,
      verify: function(port, callback) {
        return portscanner.checkPortStatus(port, '127.0.0.1', function(error, status) {
          if (error != null) {
            return callback(error);
          }
          if (status === 'closed') {
            return callback(null, false);
          }
          return callback(null, true);
        });
      }
    };
  };

  subprocess = function(processConfig, callback) {
    var config, key, _i, _len, _ref;
    config = {};
    _ref = Object.keys(processConfig);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      config[key] = autoable(key, processConfig[key]);
    }
    return async.auto(config, function(error, procs) {
      if (error != null) {
        return callback(error);
      }
      return callback(null, procs);
    });
  };

  subprocess.killAll = function(procs) {
    var key, value, _results;
    _results = [];
    for (key in procs) {
      value = procs[key];
      _results.push(value.rawProcess.kill());
    }
    return _results;
  };

  module.exports = subprocess;


  /*
  Copyright (c) 2015, Groupon, Inc.
  All rights reserved.
  
  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions
  are met:
  
  Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.
  
  Redistributions in binary form must reproduce the above copyright
  notice, this list of conditions and the following disclaimer in the
  documentation and/or other materials provided with the distribution.
  
  Neither the name of GROUPON nor the names of its contributors may be
  used to endorse or promote products derived from this software without
  specific prior written permission.
  
  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
  TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
  PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
  HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
  TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   */

}).call(this);
