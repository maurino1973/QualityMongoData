import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import {Tab, RangeGroup} from './Tab';

import styles from './TabView.less';

class DashBoard extends Tab {
  static displayName = 'DashBoard';
  static propTypes = {
    store: PropTypes.Array
  };

  constructor(props) {
    super(props);
  }

  renderContent() {
    return (
      <div>
        <div className={ classnames(styles.dashboardScore) }>
          Quality score: { this.props.store.collectionScore.toFixed(1) }
        </div>
        <p>Change weights for the metrics:</p>
        {
          <RangeGroup
            metrics={this.props.metrics}
            store={this.props.store}
            weights={this.props.store.weights}
          />
        }
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
    //TODO: Remove join: old way to do interaction
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

    this.tabs.push(<DashBoard title="Dashboard" store={ props.store } metrics={ props.metrics }/>);
    for (var i in props.metrics) {
      this.tabs.push(props.metrics[i]);
    }
    this.tabs.push(<ProfileTab title="Profile" store={ props.store }/>);
  }
}

export default PluginTabBar;
