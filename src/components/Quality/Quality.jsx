import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ToggleButton from 'components/toggle-button';

import styles from './Quality.less';

import TabBar, { Tab } from 'components/TabView';

function scoreToColor(score) {
  console.assert(score >= 0 && score <= 100);

  const colors = ['orangered', 'orange', 'limegreen'];
  var index = Math.floor(colors.length * score/101);  //FIXME

  console.assert(index >= 0 && index < colors.length);
  return colors[index];
}

function CollectionScore(prop) {
  //TODO: extract style
  return (
    <div style={ {"font-size": "xx-large", color: "cornflowerblue"} }>
      Quality score: {prop.score.toFixed(2)}
    </div>
  );
}

class DashBoard extends Tab {
  static displayName = 'DashBoard';

  constructor(props) {
    super(props);
    this.getValuesByKey = this.getValuesByKeyImpl.bind(this);
  }

  renderContent() {
    return (
      <div>
        <CollectionScore
          score={ this.props.store.collectionScore }
        />

        { this._renderTable() }
        { this._renderFigure() }
      </div>
    )
  }

  getValuesByKeyImpl (event) {
   this.props.store.actions.showKeyValues(event.target.innerHTML,
                                          event.target.parentNode.parentNode.parentNode.getElementsByClassName("type-collection")[0].getElementsByTagName("i")[0].innerHTML,
                                          event.target.parentNode.parentNode.parentNode);
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
                <div style={{background:scoreToColor(collection.score)}} className={classnames(styles.rowscore, styles.tooltip)}>
                  <span className={styles.tooltiptext}>
                    {collection.score.toFixed(2)}
                  </span>
                </div>
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
        {
          elements
        }
        <i style={{display:"none"}}><span>{types.join(",")}</span></i>
      </span>
    );
    //TODO: Remove join: needed for interaction
  }
}

class Metric extends Tab
{
  static displayName = 'Metric';

  constructor(props) {
    super(props);
  }

  renderContent() {
    return (
      <div>
        { this.props.title }
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
        <div>
          <this.queryBar
            buttonLabel="Find"
            onApply={this.onApplyClicked.bind(this)}
            onReset={this.onResetClicked.bind(this)}
          />

          <TabBar>
            <DashBoard title="Dashboard" store={ this.props }/>
            <Metric title="Metric1"/>
            <Metric title="Metric2"/>
          </TabBar>

        </div>
    );
  }
}

export default Quality;
export { Quality };
