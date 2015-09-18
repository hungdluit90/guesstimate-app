import math from 'mathjs';

let metricId = (m) => { return m.readableId };
let metricMean = (m) => { return m.distribution.mean };

export function inputMetrics(str, metrics) {
  return metrics.filter((m) => { return str.includes(m.readableId)});
}

export function replaceReadableIdsWithMeans(str, metrics) {
  let tmpStr = str;
  for (let metric of metrics) {
    tmpStr = tmpStr.replace(metricId(metric), metricMean(metric));
    //console.log(tmpStr, metricId(metric), metricMean(metric))
  }
  return tmpStr;
}

export default class FunctionForm{
  constructor(state, metrics = []){
    this.state = state;
    this.metrics = metrics;
  }
  isValid(){
    let isFunction = () => { return this.state[0] === '='; };
    let isParseable = () => { return this.calculate() !== false; };
    return (isFunction() && isParseable());
  }
  toGuesstimate(){
    return {funct: {textField: this.state}};
  }
  toDistribution(){
    return {mean: this.calculate(), stdev: 0};
  }
  calculate(){
    try {
      return this._calculate();
    } catch (exception) {
      if (exception.name !== 'SyntaxError'){
        console.log('calculate unexpected exception', exception);
      }
      return false;
    }
  }
  _calculate(){
    let shorten = (str) => { return str.substring(1, str.length); };
    let shortened = shorten(this.state);
    let replaced = replaceReadableIdsWithMeans(shortened, this._inputs());
    let correct = math.eval(replaced);
    return correct;
  }
  _inputs(){
    return inputMetrics(this.state, this.metrics);
  }
}
