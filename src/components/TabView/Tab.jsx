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
      <table>
        {
          this.props.metrics.map((curr, index) => {
            return (
              <Range
                metricName={curr.props.title}
                value={this.props.weights[curr.props.engine]}
                absValue={this._toAbsoluteWeights(this.props.weights)[curr.props.engine]}
                owner={this}
                id={curr.props.engine}
              />
            );
          })
        }
      </table>
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
      <tr style={{"opacity": this.props.value > 0.0 ? 1.0 : 0.4}}>
        <td className={ classnames(styles.weightLabel) }>
          { this.props.metricName }
        </td>
        <td>
          <input
            type="range"
            value={ this.props.value }
            min="0.0"
            max="1.0"
            step="0.01"
            onChange={this.handleChange.bind(this)}
          />
        </td>
        <td>
          { this.props.absValue.toFixed(2) }
        </td>
      </tr>
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

    this.state = {
      disabled: false
    };
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
      <div className={ this.state.disabled ? styles.disabled : {} }>
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

    this.state["options"] = this.props.options;
    this.state["_currComputationState"] = "start";
    this.state["success"] = true;
    this.state["errorMsg"] = "";
  }

  renderContent() {
    return (
      <div>
      </div>
    );
  }

  renderFooter() {
    return (
      <div>
        <input type="button" onClick={this._compute.bind(this)} value="Compute"/>
        {
          this.state["_currComputationState"] == "computing" ?
            <span>
              Computing please wait...
            </span>
          :
            <span>
            </span>
        }

        {
          this.state["success"] == false ?
            <div className={classnames(styles.alertbox, styles.error)}>
              <span>error:</span>
              { this.state["errorMsg"] }
            </div>
          : this.state["_currComputationState"] == "end" ?
            <div className={classnames(styles.alertbox, styles.success)}>
              <span>success:</span>
              Finished.
            </div>
            : ""
        }
      </div>
    );
  }

  _compute() {
    this.setState({disabled: true, _currComputationState: "computing"});


    var onComputationEnd = (success) => {
      this.setState({
        disabled: false,
        _currComputationState: "end",
        success: success
      });
    };

    var onComputationError = (msg) => {
      this.setState({
        errorMsg: msg
      });
    };

    this.props.compute(this.state.options, onComputationEnd, onComputationError);
  }
}

export default MetricTab;
export { Tab, RangeGroup };
