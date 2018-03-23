import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import styles from './TabView.less';

class RangeGroup extends Component {
  static displayName = 'Range';

  constructor(props) {
    super(props);
  }

  notifyChange(id, val) {
    var w = this.props.weights;
    w[id] = val;
    this.props.store.actions.changeWeights(w);
  }

  render() {
    return (
      <ul>
        {
          this.props.metrics.map((curr, index) => {
            return (
              <li>
                <Range
                  metricName={curr.props.title}
                  value={this.props.weights[curr.props.engine]}
                  absValue={this._toAbsoluteWeights(this.props.weights)[curr.props.engine]}
                  owner={this}
                  id={curr.props.engine}
                />
              </li>
            );
          })
        }
      </ul>
    );
  }

  //NOTE: This is a duplication from the store
  _toAbsoluteWeights(relWeights) {
    var sum = 0.0;
    for (var key in relWeights) {
      sum += relWeights[key];
    }
    var x = 0.0;
    if (sum > 0.0) {
      x = 1.0/sum;
    }

    var absWeights = {};
    for (var key in relWeights) {
      absWeights[key] = relWeights[key] * x;
    }

    return absWeights;
  }
}

class Range extends Component {
  static displayName = 'Range';

  constructor(props) {
    super(props);
  }

  handleChange(event) {
    this.setVal(event.currentTarget.valueAsNumber);
  }

  setVal(val) {
    var last = this.props.value;

    if (last != val) {
      this.props.owner.notifyChange(this.props.id, val);
    }
  }

  render() {
    return (
      <div style={{"opacity": this.props.value > 0.0 ? 1.0 : 0.4}} className={ classnames(styles.weightBlock) }>
        <span>{ this.props.metricName }</span>
        <input className={ classnames(styles.weightRange) }
              type="range"
              value={ this.props.value }
              min="0.0"
              max="1.0"
              step="0.01"
              onChange={this.handleChange.bind(this)}/>
        <span className={ classnames(styles.weightLabel) }>{ this.props.absValue.toFixed(2) }</span>
      </div>
    );
  }
}

class Tab extends Component {
  static displayName = 'Tab';

  static propTypes = {
    title: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  renderHeader() {
    // Override me
  }

  renderContent() {
    // Override me
  }

  renderFooter() {
    // Override me
  }

  render() {
    return (
      <div>
        <div className={styles.tabheader}>
          { this.renderHeader() }
        </div>
        <div className={styles.tabcontent}>
          { this.renderContent() }
        </div>
        <div className={styles.tabheader}>
          { this.renderFooter() }
        </div>
      </div>
    );
  }
}

class MetricTab extends Tab
{
  static displayName = 'MetricTab';

  constructor(props) {
    super(props);
  }

  renderContent() {
    return (
      <div>
        Test Metric
      </div>
    );
  }

  renderFooter() {
    return (
      <input type="button" onClick={this._compute.bind(this)} value="Compute"/>
    );
  }

  _compute() {
    console.log("click", this.props.title);
    this.props.compute({});
  }
}

export default MetricTab;
export { Tab, RangeGroup };
