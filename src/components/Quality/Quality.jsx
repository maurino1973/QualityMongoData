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
    /**random request*/
    this.getRandSubset = this.getRandSubsetImpl.bind(this);
    this.getRandValuesByKey = this.getRandValuesByKeyImpl.bind(this);
    /**query request*/
    this.getSubsetByQuery = this.getSubsetByQueryImpl.bind(this);
    this.getQueryValuesByKey = this.getQueryValuesByKeyImpl.bind(this);
    /**reset*/
    this.resetSubset = this.resetSubsetImpl.bind(this);
  }

  static propTypes = {
    status: PropTypes.oneOf(['enabled', 'disabled']),
    database: PropTypes.string
  };


  getValuesByKeyImpl (event) {
   this.props.actions.showKeyValues(event.target.innerHTML,event.target.parentNode.parentNode.parentNode.getElementsByClassName("type-collection")[0].getElementsByTagName("i")[0].innerHTML,event.target.parentNode.parentNode.parentNode);
  }

  /**random request*/

  getRandSubsetImpl(event){
    this.props.actions.randomRequestFunct(document.getElementById("nRandom").value);
  }

  getRandValuesByKeyImpl(event){
    this.props.actions.showRandKeyValues(event.target.innerHTML,event.target.parentNode.parentNode.parentNode.getElementsByClassName("type-collection")[0].getElementsByTagName("i")[0].innerHTML,event.target.parentNode.parentNode.parentNode, document.getElementById("nRandomHidden").value);
  }

  /**query request*/

  componentWillMount() {
    this.queryBar = window.app.appRegistry.getComponent('Query.QueryBar');
  }

  getSubsetByQueryImpl(event){
    this.props.actions.queryRequestFunct();
  }

  getQueryValuesByKeyImpl(event){
    this.props.actions.showQueryKeyValues(event.target.innerHTML,event.target.parentNode.parentNode.parentNode.getElementsByClassName("type-collection")[0].getElementsByTagName("i")[0].innerHTML,event.target.parentNode.parentNode.parentNode);
  }

  /**reset*/

  resetSubsetImpl(event){
    this.props.actions.resetCollection();
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
    		For suggestion and comments please contact Andrea Maurino (maurino@disco.unimib.it)<p/>
        ----------------------------------------------------------------------
        <p/>Here you could insert an integer number (n) to analyze the quality on a n-size subset of documents.<p/>
        <input type="text" id="nRandom"/>
        &nbsp;&nbsp;<a href="#" onClick={this.getRandSubset}>Get the subset</a><p/>
        {<input type="hidden" id="nRandomHidden" value={this.props.numRequested}/>}
        ----------------------------------------------------------------------
        <p/>Here you could insert a query and analyze the quality on the result.<p/>
        <this.queryBar buttonLabel="Analyze" onApply={this.getSubsetByQuery} onReset={this.resetSubset}/>
        ----------------------------------------------------------------------
        <p/><a href="#" onClick={this.resetSubset}>Reset</a><p/>
        ----------------------------------------------------------------------
        <p/></b></div>

        <div className="row">
          <div className="col-md-2"><b>Key</b></div>
          <div className="col-md-1"><b>Occurrences</b></div>
        	<div className="col-md-1"><b>Completness</b></div>
        	<div className="col-md-1"><b>Type</b></div>
        	<div className="col-md-1"><b>MultipleTypes</b></div>
        	<div className="col-md-1"><b>Closed World Assuption</b></div>
        	<div className="col-md-1"><b>Candidate Primary key</b></div>
        </div>

        { this.props.randomRequest ? (
            this.props.randomSubCollection.map((collection) => {
                return (
                  <div className="row">
                      <div className="key-collection col-md-2"><b><a href="#" onClick={this.getRandValuesByKey}>{collection.key}</a></b></div>
                      <div className="col-md-1"><span className="counter-collection">{collection.count}</span></div>
                      <div className="col-md-1"><span className="percentage-collection">{collection.percentage}%</span></div>
                      <div className="col-md-1"><span className="type-collection"><i>{collection.type.join(",")}</i></span></div>
                      <div className="col-md-1"><span className="multiple-collection">{collection.multiple}</span></div>
                      <div className="col-md-1"><span className="cwa-collection">{collection.cwa}</span></div>
                  </div>
                 );
            })
        ) : (this.props.queryRequest ? (
                this.props.querySubCollection.map((collection) => {
                    return (
                      <div className="row">
                          <div className="key-collection col-md-2"><b><a href="#" onClick={this.getQueryValuesByKey}>{collection.key}</a></b></div>
                          <div className="col-md-1"><span className="counter-collection">{collection.count}</span></div>
                          <div className="col-md-1"><span className="percentage-collection">{collection.percentage}%</span></div>
                					<div className="col-md-1"><span className="type-collection"><i>{collection.type.join(",")}</i></span></div>
                					<div className="col-md-1"><span className="multiple-collection">{collection.multiple}</span></div>
                					<div className="col-md-1"><span className="cwa-collection">{collection.cwa}</span></div>
                      </div>
                     );
                  })
                ) : (
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
                  )
                )
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

export default Quality;
export { Quality };
