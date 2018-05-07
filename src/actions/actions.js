import Reflux from 'reflux';

const QualityActions = Reflux.createActions([
  'randomRequestFunct', //sampling
  'queryRequestFunct',  //find
  'resetCollection',
  'computeMetric',
  'changeWeights',
  'loadLastSave'
]);

export default QualityActions;
export { QualityActions };
