import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import {Tab, RangeGroup} from './Tab';

import styles from './TabView.less';

class Donut extends Component {
  static displayName = 'PluginTabBar';

  constructor(props) {
    super(props);
  }

  _getOffset(score) {
    console.assert(score >= 0.0 && score <= 1.0);
    //0.50*full = 180° = 1.0 score
    //0.75*full =  90° = 0.5 score
    //1.00*full =   0° = 0.0 score
    const full = 440;   //NOTE: HARDCODED value refer to css .donut stroke-dasharray: 440

    return full - (full*0.5)*score;
  }

  // Shamelessly copy and pasted from the stackoverflow
  // https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
  _HSVtoRGB(h, s, v) {
    var r, g, b;
    var i, f, p, q, t;

    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
  }

  _score2RGB(score) {
    console.assert(score >= 0.0 && score <= 1.0);
    return this._HSVtoRGB(0.3 * score, 0.9, 1.0)
  }

  render() {
    const color = this._score2RGB(this.props.score);
    return (
      <div className={classnames(styles.donutContainer)}>
        <span style={{"color": "#555", "font-weight": "bold", "line-height": "90px"}}>
          { this.props.score == null ? "undefined" : (this.props.score * 100).toFixed(0) + "%"}
        </span>
        <span>
          {this.props.name}
        </span>

        <svg width="165" height="165" xmlns="http://www.w3.org/2000/svg">
          <g>
            <title>Layer 1</title>
            <circle
              style={{"stroke-dashoffset": 220}}
              className={classnames(styles.donut2)}
              r="70" cy="81" cx="81"
            />
            <circle
              style={{"stroke-dashoffset": this._getOffset(this.props.score),
                      "stroke": "rgb(" + color.r + "," + color.g + "," + color.b + ")"
              }}
              className={classnames(styles.donut)}
              r="70" cy="81" cx="81"
            />
          </g>
        </svg>
      </div>
    );
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
    return (
      <div>
        <p className={ classnames(styles.dashboardScore) }>
          Quality score: { this.props.store.collectionScore.toFixed(1) + "%"}
        </p>
        <p>Change weights for the metrics:</p>

        <RangeGroup
          metrics={this.props.metrics}
          store={this.props.store}
          weights={this.props.store.weights}
        />

        <div className={ classnames(styles.donutsblock) }>
          {
            this.props.metrics.map((item) => {
              return (
                <Donut name={item.props["title"]} score={item.props["score"]}/>
              );
            })
          }
        </div>
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
    this._renderFigure = this._renderFigure.bind(this);

    this.state["currFreqData"] = {};
    this.state["currKey"] = "";
  }

  renderContent() {

    if (this.props.store.computingMetadata == true) {
      return (
        <span>
        Computing... please wait...
        </span>
      );
    } else {
      if (this.props.store.collectionsValues.length == 0) {
        return (
          <span>
          No keys found.
          </span>
        );
      }
    }

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
      this._renderSubTable(this.props.store.collectionsValues, this.props.store.collectionValuesByKey, 0, [])
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
          <div className="col-md-1"><b>Completeness</b></div>
          <div className="col-md-1"><b>Type</b></div>
          <div className="col-md-1"><b>MultipleTypes</b></div>
          <div className="col-md-1"><b>Closed World Assuption</b></div>
          <div className="col-md-1"><b>Candidate Primary key</b></div>
        </div>

        {
          Object.keys(subcollection).map((key, index) => {
            var collection = subcollection[key];
            var freqData = subfreqdata[key];

            var keyp = _.clone(keypath);
            keyp.push(key);
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
                            this.setState({currFreqData: freqData, currKey: keyp});
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
                    <div className="col-md-1">
                      <span className="cpk-collection">{collection.cpk ? "\u2714": "\u2718"}</span>
                    </div>
                  </div>
                </div>
                {
                  Object.keys(collection["children"]).length > 0 && Object.keys(freqData["children"]).length > 0 ?
                    <div className={styles.subtree}>
                      { this._renderSubTable(collection["children"], freqData["children"], level + 1, keyp) }
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
    if (this.state && "values" in this.state.currFreqData) {
      // Sort frequencies...
      var pairs = Object.keys(this.state.currFreqData["values"]).map((key) => {
        return [key, this.state.currFreqData["values"][key]];
      });
      pairs.sort(function(a, b) {
        return b[1]["count"] - a[1]["count"];
      });

      // Normalize frequencies
      var maxFreq = 0;
      for (var i in pairs) {
        if (pairs[i][1].count > maxFreq) {
          maxFreq = pairs[i][1].count;
        }
      }
      console.assert(maxFreq != 0.0);
      pairs = pairs.map((item) => {
        return (
          [item[0], item[1], item[1].count / maxFreq]
        );
      });

      return (
        <div>
          <b>
            {Object.keys(this.state.currFreqData).length > 0 ? 'Below are listed all values for the key \'' + this.state.currKey.join('.') + '\'' : ''}
          </b>

          {
            pairs.map((item) => {
              // item[0] is value
              // item[1] is {count, type}
              // item[2] is relative frequency
              return (
                <div style={ {display: "flex"} }>
                  <div style={{width: Math.max(20*item[2], 0.1) + 'em'}} className={ classnames(styles.barrect) }></div>
                  <div>
                    {
                      (() => {
                        const elisionThreshold = 64;
                        if (item[0].length > elisionThreshold) { // elision for visual appearance
                          return item[0].slice(0, elisionThreshold).toString() + "...";
                        }

                        return item[0];
                      })()
                    } has appeared {item[1].count} times of type {item[1].type}
                  </div>
                </div>
              );
            })
          }
        </div>
      );
    }
  }

  //TODO: Refactor: move out the style
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
      <div>
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

    this.tabs.push(<ProfileTab title="Profile" store={ props.store }/>);
    this.tabs.push(<DashBoard title="Dashboard" store={ props.store } metrics={ props.metrics }/>);
    for (var i in props.metrics) {
      this.tabs.push(props.metrics[i]);
    }
  }
}

export default PluginTabBar;
