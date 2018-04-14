import Reflux from 'reflux';

const QualityActions = Reflux.createActions([
  /**
   * define your actions as strings below, for example:
   */
  'toggleStatus',
  //'showKeyValues',
  'randomRequestFunct', //sampling
  //'showRandKeyValues',

  'queryRequestFunct',  //find

  //'showQueryKeyValues',
  'resetCollection',
  //'profile',
  'computeMetric',
  'changeWeights'
]);

export default QualityActions;
export { QualityActions };
