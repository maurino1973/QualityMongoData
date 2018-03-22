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

var Check = function(renderSubTable, collection, level) {
  return (
    <div>
      <input id="check" type="checkbox" className={ classnames(styles.profilemenu) }/>
      <ol>
        <li>
          { renderSubTable(collection["children"], level + 1) }
        </li>
      </ol>
    </div>
  );
}

class ProfileTab extends Tab
{
  static displayName = 'ProfileTab';
  static propTypes = {
    store: PropTypes.Array
  };

  constructor(props) {
    super(props);
    this._renderFigure = this._renderFigure.bind(this);

    this.setState({
      currFreqData: {},
    });
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
      this._renderSubTable(this.props.store.collectionsValues, this.props.store.collectionValuesByKey, 0)
    );
  }

  _renderSubTable(subcollection, subfreqdata, level, keypath) {
    const tuning = level == 0 ? 0 : 1;
    return (
      <div style={{"margin-left": 2*tuning + "em", "margin-right": "0em", "box-shadow": "-2px 2px 10px rgba(0, 0, 0, 0.2}"}} className={styles.tabcontent}>
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
          Object.keys(subcollection).map((key, index) => {
            var collection = subcollection[key];
            var freqData = subfreqdata[key];
            return (
              <div>
                {
                  Object.keys(collection["children"]).length > 0 ?
                    <input type="checkbox" id={key + "_id"}/>
                  : null
                }
                <div className={styles.menu}>
                  <div className="row">
                    <div className="key-collection col-md-2">
                      <b>
                        <label className={styles.keylabel} htmlFor={key + "_id"} onClick = {
                          () => {
                            this.setState({currFreqData: freqData});
                          }
                        }>
                          {key}
                        </label>
                      </b>
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
                      <span className="multiple-collection">{collection.multiple ? "\u2714": "\u2718"}</span>
                    </div>
                    <div className="col-md-1">
                      <span className="cwa-collection">{collection.cwa ? "\u2714": "\u2718"}</span>
                    </div>
                  </div>
                </div>
                {
                  Object.keys(collection["children"]).length > 0 ?
                    <div className={styles.subtree}>
                      { this._renderSubTable(collection["children"], freqData["children"], level + 1) }
                    </div>
                  : null
                }

              </div>
            );
          })
        }

      </div>
    );
  }

  _renderFigure() {
    //NOTE: possible bug...
    if (this.state) {
      // Sort frequencies...
      var pairs = Object.keys(this.state.currFreqData["values"]).map((key) => {
        return [key, this.state.currFreqData["values"][key]];
      });
      pairs.sort(function(a, b) {
        return b[1]["count"] - a[1]["count"];
      });

      return (
        <div>
          <b>
            {Object.keys(this.state.currFreqData).length > 0 ? 'Below are listed all values for the key selected' : ''}
          </b>

          {
            //Object.keys(this.state.currFreqData["values"]).map((key, index) => {
            pairs.map((item) => {
              var currentValue = item//this.state.currFreqData["values"][key];
              return (
                <div style={ {display: "flex"} }>
                  <div style={{width: currentValue[1].count + 'em'}} className={ classnames(styles.barrect) }></div>
                  <div>
                    {
                      (() => {
                        const elisionThreshold = 64;
                        if (currentValue[0].length > elisionThreshold) { // elision for visual appearance
                          return currentValue[0].slice(0, elisionThreshold).toString() + "...";
                        }

                        return currentValue[0];
                      })()
                    } has appeared {currentValue[1].count} times of type {currentValue[1].type}
                  </div>
                </div>
              );
            })
          }
        </div>
      );
    }
  }

  _renderTypeLabels(types) {
    var typeStyle = function(type) {
      var tcolordict = {
        'number': {'color': 'cornflowerblue'},
        'string': {'color': 'deeppink', 'font-weight': 'bold'},
        'null':   {'color': 'darkblue', 'font-style':'italic'},
        'date':   {'color': 'forestgreen', 'font-weight': 'bold'},
        'bool':   {'color': '#ffc107', 'font-weight': 'bold'}
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
