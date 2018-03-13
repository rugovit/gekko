/*

  MACD - DJM 31/12/2013

  (updated a couple of times since, check git history)

 */
/*
* start: first.start,
      open: first.open,
      high: _.max([first.high, second.high]),
      low: _.min([first.low, second.low]),
      close: second.close,
      volume: first.volume + second.volume,
      vwp: (first.vwp * first.volume) + (second.vwp * second.volume),
      trades: first.trades + second.trades*/
// helpers
var _ = require('lodash');
var log = require('../core/log.js');
var extend = require('util')._extend;
var longPrice;
var maxPrice;
var curantCandle;
var lastCandle;
// let's create our own method
var method = {};
var tickUp = 0;
var tickDown = 0;
// prepare everything our method needs
method.init = function () {
  // keep state about the current trend
  // here, on every new candle we use this
  // state object to check if we need to
  // report it.
  this.name = 'STRAIGHT_FOWARD'
  this.trend = {
    direction: 'none',
    duration: 0,
    persisted: false,
    adviced: false
  };

  // how many candles do we need as a base
  // before we can start giving advice?
  this.requiredHistory = this.tradingAdvisor.historySize;

  // define the indicators we need
  this.addIndicator('macd', 'MACD', this.settings);
}

// what happens on every new candle?
method.update = function (candle) {
  log.debug('////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////');
  log.debug('Update!!!!');
  lastCandle =extend( curantCandle);
  curantCandle = candle;
 /* if (maxPrice < candle.close) {
    maxPrice = candle.close;
  }
  if (lastCandle) {
    if (lastCandle.close < curantCandle.close) {
      tickDown++;
      log.debug('Tik down ++ = ' +tickDown);
    }
    else {
      tickUp++;
      log.debug('Tik up ++ = ' +tickUp);
    }
    if (tickDown ===10) {
      log.error("Tik up reset ");
      tickUp = 0;
    }
    if (tickUp === 10) {
      log.error("Tik down reset ");
      tickDown = 0;
    }
    log.debug('////////////////////');
  }*/

  // nothing!
}

// for debugging purposes: log the last calculated
// EMAs and diff.
method.log = function () {
  var digits = 8;
  var macd = this.indicators.macd;

  var diff = macd.diff;
  var signal = macd.signal.result;

  log.debug('calculated MACD properties for candle:');
  log.debug('\t', 'short:', macd.short.result.toFixed(digits));
  log.debug('\t', 'long:', macd.long.result.toFixed(digits));
  log.debug('\t', 'macd:', diff.toFixed(digits));
  log.debug('\t', 'signal:', signal.toFixed(digits));
  log.debug('\t', 'macdiff:', macd.result.toFixed(digits));
}

method.check = function () {
  /*var macddiff = this.indicators.macd.result;

   if(macddiff > this.settings.thresholds.up) {

     // new trend detected
     if(this.trend.direction !== 'up') {
       // reset the state for the new trend
       this.trend = {
         duration: 0,
         persisted: false,
         direction: 'up',
         adviced: false
       };
       maxPrice=0;
     }
     this.trend.duration++;

     log.debug('In uptrend since', this.trend.duration, 'candle(s)');

     if(this.trend.duration >= this.settings.thresholds.persistence)
       this.trend.persisted = true;

     if(this.trend.persisted && !this.trend.adviced) {
       this.trend.adviced = true;
       this.advice('long');
       log.error('STRAIGHT FOWORD ', "buy price: "+curantCandle.close );
       longPrice=curantCandle.close;
     } else
       this.advice();

   }else if(macddiff < this.settings.thresholds.down) {

     // new trend detected
     if(this.trend.direction !== 'down')
     // reset the state for the new trend
       this.trend = {
         duration: 0,
         persisted: false,
         direction: 'down',
         adviced: false
       };

     this.trend.duration++;

     log.debug('In downtrend since', this.trend.duration, 'candle(s)');

     if(this.trend.duration >= this.settings.thresholds.persistence)
       this.trend.persisted = true;

     if(this.trend.persisted && !this.trend.adviced) {
       this.trend.adviced = true;
       //this.advice('short');
     } else
       this.advice();

   } else {

     log.debug('In no trend');

     // we're not in an up nor in a downtrend
     // but for now we ignore sideways trends
     //
     // read more @link:
     //
     // https://github.com/askmike/gekko/issues/171

     // this.trend = {
     //   direction: 'none',
     //   duration: 0,
     //   persisted: false,
     //   adviced: false
     // };

     this.advice();
   }*/
  log.debug('////////////////////');
  log.debug('Check!!!!');
  if (lastCandle.close < curantCandle.close) {
    // new trend detected
    if (this.trend.direction !== 'up') {
      // reset the state for the new trend
      this.trend = {
        duration: 0,
        persisted: false,
        direction: 'up',
        adviced: false
      };

    }
    this.trend.duration++;

    log.debug('In uptrend since', this.trend.duration, 'candle(s)');

    if (this.trend.duration > this.settings.straight_foward.upTreshold)
      this.trend.persisted = true;

    if (this.trend.persisted && !this.trend.adviced) {
      this.trend.adviced = true;
      this.advice('long');
    } else
      this.advice();
  }
  else {
    // new trend detected
    if(this.trend.direction !== 'down')
    // reset the state for the new trend
      this.trend = {
        duration: 0,
        persisted: false,
        direction: 'down',
        adviced: false
      };

    this.trend.duration++;

    log.debug('In downtrend since', this.trend.duration, 'candle(s)');

    if(this.trend.duration > this.settings.straight_foward.downTreshold)
      this.trend.persisted = true;

    if(this.trend.persisted && !this.trend.adviced) {
      this.trend.adviced = true;
      this.advice('short');
    } else
      this.advice();
  }
/*
  var tresholdDiffDown = this.settings.straight_foward.downTreshold * (maxPrice - longPrice) / 100;

  var comparePriceDown = maxPrice - tresholdDiffDown;

  if (curantCandle.close < comparePriceDown) {
    this.advice('short');
    log.error('STRAIGHT FOWORD ', "sell price: " + curantCandle.close);
    this.trend = {
      duration: 0,
      persisted: false,
      direction: 'down',
      adviced: false
    };
  }
  else {
    this.advice('short');
    log.error('STRAIGHT FOWORD ', "sell price: " + curantCandle.close);
    this.trend = {
      duration: 0,
      persisted: false,
      direction: 'down',
      adviced: false
    };
  }
*/
  log.debug('/////////////////////////////////////////////////////////////////////////////////////////////////////////////');
}

module.exports = method;
