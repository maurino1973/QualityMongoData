import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ToggleButton from 'components/toggle-button';

import styles from './Quality.less';

import PluginTabBar, {MetricTab} from 'components/TabView';

class CompletenessMetricTab extends MetricTab {
  static displayName = 'CompletenessMetricTab';

  constructor(props) {
    super(props);
  }

  renderContent() {
    return (
      <div>
        <p>
          The completeness metric scores the existence of attributes in each document of the current collection.
        </p>
        <p>
          The score would be low if the same attributes are used sparingly across the documents.
          On opposite it would be high if the same attributes are frequently present.
        .</p>
      </div>
    );
  }
}

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
        <div className={classnames(styles.root)}>
          <this.queryBar
            buttonLabel="Find"
            onApply={this.onApplyClicked.bind(this)}
            onReset={this.onResetClicked.bind(this)}
          />
          <div className={ classnames(styles.menu) }>
            <input type="button" value="Sample"/>
          </div>

          <PluginTabBar
            store={this.props}
            metrics={this._makeMetricComponents(this.props.metrics)}>
          </PluginTabBar>
        </div>
    );
  }

  _makeMetricComponents(engines) {
    var metricComp = [];

    //NOTE: Be careful with names...
    //NOTE: Format is <EngineName>: [<ComponentTab>, <TabName>]
    //TODO: Place this in ctor
    var metricCompMap = {
      "CompletenessMetric": [CompletenessMetricTab, "Completeness"],
      "TestMetric1":        [MetricTab, "Test Metric 1"],
      "TestMetric2":        [MetricTab, "Test Metric 2"]
    };

    for (const key in engines) {
      if (key in metricCompMap) {
        const CustomMetric = metricCompMap[key][0];
        const title = metricCompMap[key][1]
        metricComp.push(<CustomMetric title={ title } engine={key} score={engines[key]} compute={
          (props) =>
            this.props.actions.computeMetric(key, props)
          }/>);
      } else {
        console.assert("Engine ", key, " not supported");
      }
    }

    return metricComp;
  }
}

export default Quality;
export { Quality };
