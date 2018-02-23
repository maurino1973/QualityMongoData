import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ToggleButton from 'components/toggle-button';

import styles from './Quality.less';

import TabBar, { Tab } from 'components/TabView';

function dashboard() {
  return (
    <div>
      <div>
        This is a <b>dashboard</b>.
        It shows collection score and gives some settings.
      </div>
    </div>
  )
}

function metric1() {
  return (
    <div>
      Metric 1
    </div>
  );
}

function metric2() {
  return (
    <div>
      Metric 2
    </div>
  );
}

class Quality extends Component {
  static displayName = 'QualityComponent';

  static propTypes = {
    status:   PropTypes.oneOf(['enabled', 'disabled']),
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
  }

  onResetClicked() {
    console.log("onResetClicked");
  }

  render() {
    return (
      <div>
        <this.queryBar
          buttonLabel="Find"
          onApply={this.onApplyClicked.bind(this)}
          onReset={this.onResetClicked.bind(this)}
        />

        <TabBar>
          <Tab title="DashBoard" contentFactory={dashboard}/>
          <Tab title="Metric1"   contentFactory={metric1}/>
          <Tab title="Metric2"   contentFactory={metric2}/>
        </TabBar>
      </div>
    );
  }
}

/*
class Quality extends Component {
  static displayName = 'QualityComponent';

  constructor(props) {
    super(props);
    this.getValuesByKey = this.getValuesByKeyImpl.bind(this);
  }
  static propTypes = {
    status: PropTypes.oneOf(['enabled', 'disabled']),
    database: PropTypes.string
  };


  getValuesByKeyImpl (event) {
   this.props.actions.showKeyValues(event.target.innerHTML,event.target.parentNode.parentNode.parentNode.getElementsByClassName("type-collection")[0].getElementsByTagName("i")[0].innerHTML,event.target.parentNode.parentNode.parentNode);
  }

  render() {
    return (
      <div className={classnames(styles.root)}>
        <h2 className={classnames(styles.title)}>Quality Assement and Profile</h2>
        <div className="plugin-description-text"><b>The scope of this plugin is to measure data quality of your MongoDB data.<p/>
        Below will be shown a JSON object retrieved from this collection, which has every key for every documents. <p/>
        You can find JSON values for a key simply by clicking it.<p/>
		For suggestion and comments please contact Andrea Maurino (maurino@disco.unimib.it)</b><p/></div>
        <div className="row">
        <div className="col-md-2"><b>Key</b></div>
        <div className="col-md-1"><b>Occurrences</b></div>
		<div className="col-md-1"><b>Completness</b></div>
		<div className="col-md-1"><b>Type</b></div>
		<div className="col-md-1"><b>MultipleTypes</b></div>
		<div className="col-md-1"><b>Closed World Assuption</b></div>
		<div className="col-md-1"><b>Candidate Primary key</b></div>

        </div>
          {
            this.props.collectionsValues.map((collection) => {
                return (
                <div className="row">
                    <div className="key-collection col-md-2"><b><a href="#" onClick={this.getValuesByKey}>{collection.key}</a></b></div>
                    <div className="col-md-1"><span className="counter-collection">{collection.count}</span></div>
                    <div className="col-md-1"><span className="percentage-collection">{collection.percentage}%</span></div>
					<div className="col-md-1"><span className="type-collection"><i>{collection.type.join(",")}</i></span></div>
					<div className="col-md-1"><span className="multiple-collection">{collection.multiple}</span></div>
					<div className="col-md-1"><span className="cwa-collection">{collection.cwa}</span></div>


                </div>
                 );
            })
          }
 <figure><figcaption>{this.props.collectionValuesByKey.length > 0 ? 'Below are listed all values for the key selected' : ''}</figcaption><svg className="chart" width="100%" height="10000" aria-labelledby="title" role="img">
   <title id="title">A bart chart showing information</title>
        {
        this.props.collectionValuesByKey.map((currentValue,index) =>
          {
          return(
  <g className="bar">
    <rect width={currentValue.count * 10} height="19" y={index == 0 ? 0 : (20 * index)}></rect>
    <text x={currentValue.count * 10} y={index == 0 ? 9.5 : (8 + 20 * index)} dy=".35em"> " {currentValue.key} " has appeared {currentValue.count} times of type {currentValue.type}</text>
  </g>
            );
          })
        }
        </svg></figure>
      </div>
    );
  }
}
*/

export default Quality;
export { Quality };
