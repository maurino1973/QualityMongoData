import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ToggleButton from 'components/toggle-button';

import styles from './Quality.less';

import PluginTabBar, { MetricTab } from 'components/TabView';

class Quality extends Component {
  static displayName = 'QualityComponent';
  static propTypes = {
    status: PropTypes.oneOf(['enabled', 'disabled']),
    database: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.queryBar = window.app.appRegistry.getComponent('Query.QueryBar');
  }

  onApplyClicked() {
    console.log("onApplyClicked");
    this.props.actions.profile();
  }

  onResetClicked() {
    console.log("onResetClicked");
  }

  /**
   * Render Quality component.
   *
   * @returns {React.Component} The rendered component.
   */
  render() {
    console.log("rendering");
    return (
        <div>
          <this.queryBar
            buttonLabel="Find"
            onApply={this.onApplyClicked.bind(this)}
            onReset={this.onResetClicked.bind(this)}
          />

          <PluginTabBar
            store={this.props}
            metrics={this._makeMetricComponents(this.props.metrics)}>
          </PluginTabBar>

        </div>
    );
  }

  _makeMetricComponents(engines) {
    var metricComp = [];

    for (var i in engines) {
      if (engines[i] == "TestMetric1") {
        metricComp.push(<MetricTab title={ engines[i] } compute={
          (props) =>
            this.props.actions.computeMetric("TestMetric1", props)
          }/>);
      } else if (engines[i] == "TestMetric2") {
        metricComp.push(<MetricTab title={ engines[i] } compute={
          (props) =>
            this.props.actions.computeMetric("TestMetric2", props)
          }/>);
      } else if (engines[i] == "TestMetric3") {
        metricComp.push(<MetricTab title={ engines[i] } compute={
          (props) =>
            this.props.actions.computeMetric("TestMetric3", props)
          }/>);
      } else {
        console.assert("Engine ", engines[i], " not supported");
      }
    }

    /*
    for (var name in engines) {
      if (name == "TestMetric1") {
        metricComp.push(<MetricTab title={ name } />);
      } else if (name == "TestMetric2") {
        metricComp.push(<MetricTab title={ name } />);
      } else if (name == "TestMetric3") {
        metricComp.push(<MetricTab title={ name } />);
      } else {
        console.assert("Engine ", name, " not supported");
      }
    }
    */

    return metricComp;
  }
}

export default Quality;
export { Quality };
