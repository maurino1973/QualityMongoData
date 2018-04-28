import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ToggleButton from 'components/toggle-button';

import styles from './Quality.less';

import PluginTabBar, {MetricTab} from 'components/TabView';

class CompletenessMetricTab extends MetricTab {
  static displayName = 'CompletenessMetricTab';

  constructor(props) {
    super(props);
  }

  renderContent() {
    return (
      <div>
        <p>
          The completeness metric scores the existence of attributes in each document of the current collection.
        </p>
        <p>
          The score would be low if the same attributes are used sparingly across the documents.
          On opposite it would be high if the same attributes are frequently present.
        </p>
      </div>
    );
  }
}

class AttributeCompletenessMetricTab extends MetricTab {
  static displayName = 'AttributeCompletenessMetricTab';

  constructor(props) {
    super(props);

    var opt = this.state.options;

    for (var key in opt)
      opt[key] = "0";

    this.keys = [];

    var docs = this.props.docs;

    for(var i = 0; i<docs.length; i++){
      for (var key in docs[i]){
        if(this.keys.indexOf(key) === -1){
          opt[key] = "1";
          this.keys.push(key);
        }
      }
    }

    this.setState({options : opt});

    this.changeAttr = this.changeAttr.bind(this);
  }

  changeAttr(evt){
    var opt = this.state.options;
    var attrMod = evt.target.name.toString().substring(9, evt.target.name.lenght);
    opt[attrMod] = evt.target.value;
    this.setState({options: opt});
    var id = "attrMetr_"+attrMod;
    document.getElementById(id).innerHTML = evt.target.value;
  }

  renderContent() {
    return (
      <div>
        <p>
          The attribute completeness metric allows you to score the completness on the attributes in wich you are interested.
        </p>
        <p>
          Also, it allows you to weight the attributes however you want.
        </p>
        <p>
          The score would be low if the attributes that you choosed are used sparingly across the documents.
          On opposite it would be high if they are frequently present.
        </p>
        <p>
          Below you could weigh the attribute to analyze (if the weight of an attribute is 0 it will not be considered).
        </p><p>
          <table>
          {
            this.keys.map((key) => {
              return (
                <tr>
                  <td><b>{key.toString()}</b></td>
                  <td><input type="range" name={"attrMetr_"+key.toString()} step="0.01" min="0.0" max="1.0" onChange={this.changeAttr}/></td>
                  <td><p id={"attrMetr_"+key.toString()}>1</p></td>
                </tr>
                );
              })
          }
          </table>
        </p>
      </div>
    );
  }
}

class CandidatePkMetricTab extends MetricTab{

  static displayName = 'CandidatePkMetricTab';

  constructor(props) {
    super(props);
  }

  renderContent() {
    return (
      <div>
        <p>
          The "CPK metric" scores the existence of attributes that could be considered as primary key <b>in the current collection</b> (without consider the attributes that don't appear).
        </p>
        <p>
          The score would be low if only a few attributes could be considered as primary key.
          Otherwise, the score would be high if a lot of attributes could be primary key.
        </p>
      </div>
    );
  }

}

class RegexMetricTab extends MetricTab{
  static displayName = 'RegexMetricTab';

  constructor(props) {
    super(props);
    this.keys = (function(docs, ricFun){
                    var meta = [];
                    for(var i = 0; i<docs.length; i++){
                      for (var key in docs[i]){
                        if(meta.indexOf(key) === -1){
                          if(!(docs[i][key] instanceof Array) && typeof docs[i][key] == "object" && key != "_id")
                            meta = ricFun(meta, docs[i][key], key, ricFun);
                          meta.push(key);
                        }
                      }
                    }
                    return meta;
                  })(this.props.docs, this.analyzeObject);
    var opt = this.state.options;
    opt["path"] = this.keys[0];
    opt["regex"] = "";
    this.setState({options: opt});
    this.changeAttr = this.changeAttr.bind(this);
    this.changeExpr = this.changeExpr.bind(this);
  }

  analyzeObject(meta, obj, path, ricFun){
    for(var key in obj){
      var tmpPath = path + "." + key;
      if(meta.indexOf(tmpPath) === -1){
        meta.push(tmpPath);
        if(!(obj[key] instanceof Array) && typeof obj[key] == "object")
          meta = ricFun(meta, obj[key], tmpPath, ricFun);
      }
    }
    return meta;
  }

  changeAttr(evt) {
    var newPath = evt.target.options[evt.target.selectedIndex].value;
    var opt = this.state.options;
    opt["path"] = newPath;
    this.setState({options: opt});
  }

  changeExpr(evt) {
    var opt = this.state.options;
    opt["regex"] = evt.target.value;
    this.setState({options: opt});
  }

  renderContent() {
    return (
      <div>
        <p>
          The "Regex metric" scores the accuracy of the regex measured on the indicated attribute (in the current collection).
        </p>
        <p>
          The score would be low if only a few values of the attribute match with the regex.
          Otherwise, the score would be high if a lot of values of the attribute match with.
        </p>
        <p>
          Below you could choose the attribute to analyze.
        </p><p>
          <select onChange={this.changeAttr}>
          {
            this.keys.map((key) => {
              return (
                <option value={key.toString()}>{key.toString()}</option>
                );
              })
          }
          </select>
        </p>
        <p>
          Here you could insert the regular expression. (If you leave this field empty the result will be equal to 0%)
        </p>
        <p>
          $regex: /<input type="text" onChange={this.changeExpr}/>/
        </p>
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

    /**random request*/
    this.getRandSubset = this.getRandSubsetImpl.bind(this);

    /**query request*/
    this.getSubsetByQuery = this.getSubsetByQueryImpl.bind(this);

    /**reset*/
    this.resetSubset = this.resetSubsetImpl.bind(this);

    this._makeMetricComponents = this._makeMetricComponents.bind(this);

    this.state = {
      validSampleSize: true
    };
  }

  /**random request*/
  getRandSubsetImpl(event){
    var value = parseInt(document.getElementById("nRandom").value);
    this.setState({validSampleSize: !isNaN(value) && value > 0});

    this.props.actions.randomRequestFunct(document.getElementById("nRandom").value);
  }

  componentWillMount() {
    this.queryBar = window.app.appRegistry.getComponent('Query.QueryBar');
  }

  /**query request*/
  getSubsetByQueryImpl(event){
    this.props.actions.queryRequestFunct();
  }

  /**reset*/
  resetSubsetImpl(event) {
    document.getElementById("nRandom").value = "";
    this.setState({validSampleSize: true});
    this.props.actions.resetCollection();
  }

  /**
   * Render Quality component.
   *
   * @returns {React.Component} The rendered component.
   */
  render() {
    console.log("rendering");
    return (
        <div className={classnames(styles.root)}>
          <div className={ classnames(styles.menu) }>
            Here you could insert a query and analyze the quality on the result.
          </div>
          <this.queryBar
            buttonLabel="Find"
            onApply={this.getSubsetByQuery}
            onReset={this.resetSubset}
          />
          <div className={ classnames(styles.menu) }>
            <p>Here you could insert an integer number (n) to analyze the quality on a n-size subset of documents.</p>
            <input
              style={this.state.validSampleSize ? {} : {background:"orangered"}}
              className={classnames(styles.inputSample)} type="text" id="nRandom"/>

            <input type="button" onClick={this.getRandSubset} value="Get the subset"/>

            <input type="button" onClick={this.resetSubset} value="Reset"/>
          </div>

          <PluginTabBar
            store={this.props}
            metrics={this._makeMetricComponents(this.props.metrics)}>
          </PluginTabBar>
        </div>
    );
  }

  _makeMetricComponents(engines) {
    var metricComp = [];

    //NOTE: Be careful with names...
    //NOTE: Format is <EngineName>: [<ComponentTab>, <TabName>]
    //TODO: Place this in ctor
    var metricCompMap = {
      "CompletenessMetric": [CompletenessMetricTab, "Global Completeness"],
      "AttributeCompletenessMetric": [AttributeCompletenessMetricTab, "Attribute Completeness"],
      "CandidatePkMetric": [CandidatePkMetricTab, "Candidate Primary Key"],
      "RegexMetric": [RegexMetricTab, "Regex Accuracy"]
    };

    for (const key in engines) {
      if (key in metricCompMap) {
        const CustomMetric = metricCompMap[key][0];
        const title = metricCompMap[key][1];
        var options = this.props._metricEngine[key].getOptions();
        metricComp.push(
          <CustomMetric title={ title }
                        engine={key}
                        score={engines[key]}
                        options={options}
                        docs={this.props._docs}
                        compute={(props) =>
                          this.props.actions.computeMetric(key, props)
                        }/>
        );
      } else {
        console.assert("Engine ", key, " not supported");
      }
    }

    return metricComp;
  }
}

export default Quality;
export { Quality };
