import Reflux from 'reflux';

const QualityActions = Reflux.createActions([
  /**
   * define your actions as strings below, for example:
   */
  'toggleStatus',
  'profile',
  'computeMetric',
  'changeWeights',
  'showKeyValues'
]);

export default QualityActions;
export { QualityActions };
