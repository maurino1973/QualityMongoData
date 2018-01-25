import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ToggleButton from 'components/toggle-button';

import styles from './Quality.less';

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
 


  /**
   * Render Quality component.
   *
   * @returns {React.Component} The rendered component.
   */
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
    <text x={currentValue.count * 10} y={index == 0 ? 9.5 : (8 + 20 * index)} dy=".35em">\"{currentValue.key}\" has appeared {currentValue.count} times of type {currentValue.type}</text>
  </g>
            );
          })
        } 
        </svg></figure>
      </div>
    );
  }
}

export default Quality;
export { Quality };
