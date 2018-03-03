import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import styles from './TabView.less';

class Range extends Component {
  static displayName = 'Range';

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.startValue
    };
  }

  handleChange(event) {
    this.setState({value: event.currentTarget.valueAsNumber});
  }

  render() {
    return (
      <div className={ classnames(styles.weightBlock) }>
        <span>{ this.props.metricName }</span>
        <input className={ classnames(styles.weightRange) }
              type="range"
              value={ this.state.value }
              min="0.0"
              max="1.0"
              step="0.01"
              onChange={this.handleChange.bind(this)}/>
        <span className={ classnames(styles.weightLabel) }>{ this.state.value.toFixed(2) }</span>
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

  renderFooter() {
    return (
      <input type="button" onClick={this._compute.bind(this)} value="Compute"/>
    );
  }

  _compute() {
    // TODO: send notification to store
    console.log("click", this.props.title);
    this.props.compute({"test": this.props.title});
  }
}

class DashBoard extends Tab {
  static displayName = 'DashBoard';
  static propTypes = {
    store: PropTypes.Array
  };

  constructor(props) {
    super(props);
  }

  renderContent() {
    //TODO: extract style
    return (
      <div>
        <p>Shows global stats.</p>
        <p>Registered metrics are:</p>
        <ul>
          {
            this.props.metrics.map((curr) => {
              return (
                <li>
                  <Range metricName={curr.props.title} startValue={1.0/this.props.metrics.length}/>
                </li>
              );
            })
          }
        </ul>

        <div className={ classnames(styles.dashboardScore) }>
          Quality score: { this.props.store.collectionScore.toFixed(2) }
        </div>

        Other stats here.
      </div>
    );
  }
}

class ProfileTab extends Tab
{
  static displayName = 'ProfileTab';
  static propTypes = {
    store: PropTypes.Array
  };

  constructor(props) {
    super(props);
    this.getValuesByKey = this.getValuesByKeyImpl.bind(this);
  }

  getValuesByKeyImpl (event) {
   this.props.store.actions.showKeyValues(event.target.innerHTML,
                                          event.target.parentNode.parentNode.parentNode.getElementsByClassName("type-collection")[0].getElementsByTagName("i")[0].innerHTML,
                                          event.target.parentNode.parentNode.parentNode);
  }

  renderContent() {
    return (
      <div>
        Shows documents profiling.

        { this._renderTable() }
        { this._renderFigure() }
      </div>
    );
  }

  _renderTable() {
    return (
      <div>
        <div className="row">
          <div style={ {background:'rgba(0,0,0,0)'} } className={ classnames(styles.rowscore) }></div>
          <div className="col-md-2"><b>Key</b></div>
          <div className="col-md-1"><b>Occurrences</b></div>
          <div className="col-md-1"><b>Completness</b></div>
          <div className="col-md-1"><b>Type</b></div>
          <div className="col-md-1"><b>MultipleTypes</b></div>
          <div className="col-md-1"><b>Closed World Assuption</b></div>
          <div className="col-md-1"><b>Candidate Primary key</b></div>
        </div>

        {
          this.props.store.collectionsValues.map((collection) => {
            return (
              <div className="row">
                <div className="key-collection col-md-2">
                  <b><a href="#" onClick={this.getValuesByKey}>{collection.key}</a></b>
                </div>
                <div className="col-md-1">
                  <span className="counter-collection">{collection.count}</span>
                </div>
                <div className="col-md-1">
                  <span className="percentage-collection">{collection.percentage}%</span>
                </div>
                <div className="col-md-1">
                  { this._renderTypeLabels(collection.type) }
                </div>
                <div className="col-md-1">
                  <span className="multiple-collection">{collection.multiple}</span>
                </div>
                <div className="col-md-1">
                  <span className="cwa-collection">{collection.cwa}</span>
                </div>
              </div>
            );
          })
        }
      </div>
    );
  }

  _renderFigure() {
    return (
      <div>
        <b>
          {this.props.store.collectionValuesByKey.length > 0 ? 'Below are listed all values for the key selected' : ''}
        </b>
        {
          this.props.store.collectionValuesByKey.map((currentValue, index) => {
            return (
              <div style={ {display: "flex"} }>
                <div style={{width: currentValue.count + 'em'}} className={ classnames(styles.barrect) }>
                </div>
                <div>
                  {currentValue.key} has appeared {currentValue.count} times of type {currentValue.type}
                </div>
              </div>
            );
          })
        }
      </div>
    );
  }

  _renderTypeLabels(types) {
    var typeStyle = function(type) {
      var tcolordict = {
        'number': {'color': 'cornflowerblue'},
        'string': {'color': 'deeppink', 'font-weight': 'bold'},
        'null':   {'color': 'darkblue', 'font-style':'italic'},
        'date':   {'color': 'forestgreen', 'font-weight': 'bold'},
      };

      if (type in tcolordict) {
        return (tcolordict[type]);
      }

      return ({'color': 'black'});
    }

    var elements = [];
    for (let i=0; i < types.length; ++i) {
      elements.push(<span style={ typeStyle(types[i]) }>{types[i]}</span>);

      if (i < types.length - 1) {
        elements.push(<span>,</span>);
      }
    }

    return (
      <span className="type-collection">
        <i style={{display:'none'}}>{types.join(",")}</i>
        {
          elements
        }
      </span>
    );
    //TODO: Remove join: needed for interaction
  }
}

class PluginTabBar extends Component {
  static displayName = 'PluginTabBar';

  static propTypes = {
    store: PropTypes.Array,
    metrics: PropTypes.Array
  };

  constructor(props) {
    super(props);

    this.state = {
      activeTab: 0
    };

    this._updateState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this._updateState(nextProps);
  }

  handleOnClick(key, event) {
    event.preventDefault();

    this.setState({
      activeTab: key
    });
  }

  renderTabBar(key) {
    const tab = this.tabs[key];
    return (
      <li className={ this.state.activeTab == key ? styles.activetab : styles.tab}>
        <div onClick={ this.handleOnClick.bind(this, key) }>
          { tab.props.title }
        </div>
      </li>
    );
  }

  render() {
    let activeTab = this.tabs[this.state.activeTab];

    return (
      <div className={styles.tabcontentback}>
        <ul className={styles.tabbar}>
          { Object.keys(this.tabs).map(this.renderTabBar.bind(this)) }
        </ul>
        <div>
          { activeTab }
        </div>
      </div>
    );
  }

  _updateState(props) {
    this.tabs = [];

    for (var i in props.metrics) {
      this.tabs.push(props.metrics[i]);
    }

    this.tabs.push(<ProfileTab title="Profile"   store={ props.store }/>);
    this.tabs.push(<DashBoard  title="Dashboard" store={ props.store } metrics={ props.metrics }/>);
  }
}

export default PluginTabBar;
export { MetricTab };