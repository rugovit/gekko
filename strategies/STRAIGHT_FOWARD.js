/*

  MACD - DJM 31/12/2013

  (updated a couple of times since, check git history)

 */

// helpers
var _ = require('lodash');
var log = require('../core/log.js');
var extend = require('util')._extend;
var lastShort;
var currentShort;
var curantCandle;
var lastCandle;

var method = {};

// prepare everything our method needs
method.init = function () {
  // keep state about the current trend
  // here, on every new candle we use this
  // state object to check if we need to
  // report it.
  this.name = 'STRAIGHT_FOWARD'
  this.trend = {
    direction: 'none',
    durationUp: 0,
    durationDown: 0,
    persisted: false,
    adviced: false
  };

  // how many candles do we need as a base
  // before we can start giving advice?
  this.requiredHistory = this.settings.straight_foward.short;

  //TMA
  this.addIndicator('short', 'SMA', this.settings.straight_foward.short)
  this.addIndicator('medium', 'SMA', this.settings.straight_foward.medium)
  this.addIndicator('long', 'SMA', this.settings.straight_foward.long)

}

// what happens on every new candle?
method.update = function (candle) {
  log.debug('////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////');
  log.debug('Update!!!!');
  log.debug( "required History",this.requiredHistory);
  lastCandle = extend(curantCandle);
  curantCandle = candle;

  //TMA
  this.indicators.short.update(candle.close)
  this.indicators.medium.update(candle.close)
  this.indicators.long.update(candle.close)

  lastShort = extend(currentShort);
  var short = this.indicators.short.result;
  var medium = this.indicators.medium.result;
  var long = this.indicators.long.result;
  currentShort = short;


}

// for debugging purposes: log the last calculated
// EMAs and diff.
method.log = function () {
  log.debug( "required History",this.requiredHistory);
}

method.check = function () {
  log.debug('////////////////////');
  log.debug('Check!!!!');

  //TMA
  const short = this.indicators.short.result;
  const medium = this.indicators.medium.result;
  const long = this.indicators.long.result;
  /*
  if((short > medium) && (medium > long)) {
    this.advice('long')
  } else if((short < medium) && (medium > long)) {
    this.advice('short')
  } else if(((short > medium) && (medium < long))) {
    this.advice('short')
  } else {
    this.advice();
  }*/


  //if (lastCandle.close < curantCandle.close) {  ////up
  log.debug("last short",lastShort );
  log.debug("current short",currentShort );
  if (lastShort  < currentShort) {  ////up
    // new trend detected

    this.trend.durationUp++;

    log.debug('In uptrend since', this.trend.duration, 'candle(s)');

    if (this.trend.durationUp > this.settings.straight_foward.upTreshold) {

      if (this.trend.direction !== 'up') {
        // reset the state for the new trend
        this.trend = {
          durationUp: 0,
          durationDown: 0,
          persisted: false,
          direction: 'up',
          adviced: false
        };

      }

      this.trend.persisted = true;
    }

    if (this.trend.persisted && !this.trend.adviced) {
      this.trend.adviced = true;
      this.advice('long');
    } else
      this.advice();
  }
  else {
    // new trend detected
    this.trend.durationDown++;

    log.debug('In downtrend since', this.trend.duration, 'candle(s)');

    if (this.trend.durationDown > this.settings.straight_foward.downTreshold) {
      if (this.trend.direction !== 'down')
      // reset the state for the new trend
        this.trend = {
          durationUp: 0,
          durationDown: 0,
          persisted: false,
          direction: 'down',
          adviced: false
        };
      this.trend.persisted = true;

    }

    if (this.trend.persisted && !this.trend.adviced) {
      this.trend.adviced = true;
      this.advice('short');
    } else
      this.advice();
  }
  log.debug('/////////////////////////////////////////////////////////////////////////////////////////////////////////////');
}

module.exports = method;
