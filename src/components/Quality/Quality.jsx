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

    var c = 0;

    for(var i=0; i<this.keys.length; i++)
      if(parseFloat(document.getElementsByName("attrMetr_"+this.keys[i])[0].value) != 0.0 && this.keys[i] != attrMod)
        c++;

    var id = "attrMetr_"+attrMod;

    if(c == 0){
      if(parseFloat(evt.target.value) != 0.0)
        document.getElementById(id).innerHTML = 100;
      else
        document.getElementById(id).innerHTML = 0;
      return;
    }

    if(c == 1 && evt.target.value == 0.0){
      for(var i=0; i<this.keys.length; i++)
        if(parseFloat(document.getElementsByName("attrMetr_"+this.keys[i])[0].value) != 0.0 && this.keys[i] != attrMod)
          document.getElementById("attrMetr_"+this.keys[i]).innerHTML = 100;
      return;
    }

    var notParsedVal = parseFloat(evt.target.value);
    var parsedVal = Math.round((notParsedVal*100/(c+1)) * 10) / 10;
    document.getElementById(id).innerHTML = parsedVal;

    var each = (100.0 - parsedVal)/c;

//     console.log(notParsedVal, parsedVal, each, c);

    for(var i=0; i<this.keys.length; i++){

      notParsedVal = parseFloat(document.getElementsByName("attrMetr_"+this.keys[i])[0].value);

      if(this.keys[i] != attrMod && notParsedVal != 0.0){
        parsedVal = Math.round((notParsedVal*each) * 10) / 10;
        document.getElementById("attrMetr_"+this.keys[i]).innerHTML = parsedVal;
      }
    }
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
                  <td><p id={"attrMetr_"+key.toString()}>{Math.round((100.0/this.keys.length) * 10) / 10}</p></td>
                  <td><p>%</p></td>
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
                          if(!(docs[i][key] instanceof Array) && typeof docs[i][key] == "object" && key != "_id"){
                            meta = ricFun(meta, docs[i][key], key, ricFun);
                            meta.push(key);
                          }else{
                            meta.push(key);
                          }
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
    console.log("changed", newPath);
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

class ConsistencyMetricTab extends MetricTab {
  static displayName = 'ConsistencyMetricTab';

  constructor(props) {
    super(props);

    var getKeys = function(meta, doc, subkey) {
      for (var key in doc) {
        var currKey = key;

        if (subkey != "") {
          currKey = subkey + "." + key;
        }

        if (meta.indexOf(currKey) == -1 && key != "_id") {
          meta.push(currKey);
        }

        if (typeof doc[key] == "object" && !(doc[key] instanceof Array) && key != "_id") {
          meta = getKeys(meta, doc[key], currKey);
        }
      }

      return meta;
    }

    this.keys = [];
    for (var i = 0; i < this.props.docs.length; ++i) {
      this.keys = getKeys(this.keys, this.props.docs[i], "");
    }

    this.keys = this.keys.sort();
  }

  addTable() {
    var newTable = this.state.options;
    newTable.tables.push({
      "path": this.keys[0],
      "content": ""
    });

    this.setState({
      options: newTable
    });
  }

  removeTable(index) {
    var remTable = this.state.options;
    remTable.tables.splice(index, 1);

    this.setState({
      options: remTable
    });
  }

  updateTable(part, index, evt) {
    console.log("updateTable");
    var tablePart = "";

    switch(part) {
      case 0:
        tablePart = "path";
        break;
      case 1:
        tablePart = "content";
        break;
      default:
        console.assert(false);
    }

    var newTable = this.state.options;
    newTable.tables[index][tablePart] = evt.target.value;

    this.setState({
      options: newTable
    });
  }

  addRule() {
    var newRule = this.state.options;
    newRule.rules.push({
      "if": {
        "antecedent": this.keys[0],
        "consequent": "",
        "op": this.state.options.op[0]
      },
      "then": {
        "antecedent": this.keys[0],
        "consequent": "",
        "op": this.state.options.op[0]
      }
    });

    this.setState({
      options: newRule,
    });
  }

  removeRule(index) {
    var remRule = this.state.options;
    remRule.rules.splice(index, 1);

    this.setState({
      options: remRule
    });
  }

  updateRule(part, index, evt) {
    console.log("updateRule");
    var rulePart = "";
    var ruleSubPart = "";

    switch(part) {
      case 0:
        rulePart = "if";
        ruleSubPart = "antecedent";
        break;
      case 1:
        rulePart = "if";
        ruleSubPart = "consequent";
        break;
      case 2:
        rulePart = "then";
        ruleSubPart = "antecedent";
        break;
      case 3:
        rulePart = "then";
        ruleSubPart = "consequent";
        break;
      default:
        console.assert(false);
    }


    var newRule = this.state.options;
    newRule.rules[index][rulePart][ruleSubPart] = evt.target.value;

    this.setState({
      options: newRule
    });
  }

  onChangeOperator(part, index, event) {
    var newOp = this.state.options;

    var rulePart = "";
    switch(part) {
      case 0:
        rulePart = "if";
        break;
      case 1:
        rulePart = "then";
        break;
      default:
        console.assert(false);
    }

    newOp.rules[index][rulePart]["op"] = event.target.value;

    this.setState({
      options: newOp
    });
  }

  onModeChange(manual) {
    var opt = this.state.options;

    opt.tables = [];
    opt.manualMode = manual;
    this.setState({
      options: opt
    });
  }

  onExternalCollectionChange(evt) {
    var opt = this.state.options;

    opt.externalCollection = evt.target.value;
    this.setState({
      options: opt
    });
  }

  renderContent() {
    return (
      <div>
        <span>Truth tables:</span>

        <form>
          <fieldset>
            <input type="radio"
              name="mode"
              value="manual"
              onClick={() => { this.onModeChange(true) }}
              checked={ this.state.options.manualMode }/> Manual
            <input type="radio"
              name="mode"
              value="collection"
              onClick={() => { this.onModeChange(false) }}
              checked={ !this.state.options.manualMode }/> From collection
          </fieldset>
        </form>

        <div>
          {
            !this.state.options.manualMode ?
              this._renderFromCollectionModeContent()
            : ""
          }
        </div>

        <ol>
          {
            this.state.options.tables.map((curr, index) => {
              return (
                <li>
                  <span>Key</span>
                  <select value={curr["path"]}
                          className={classnames(styles.select)}
                          disabled={!this.state.options.manualMode}
                          onChange={(evt) => { this.updateTable.bind(this, 0, index)(evt) }}>
                    {
                      this.keys.map((curr, index) => {
                        return (
                          <option value={curr}>{curr}</option>
                        );
                      })
                    }
                  </select>

                  <div>
                    <textarea rows="4" cols="50"
                              value={curr["content"]}
                              readOnly={!this.state.options.manualMode}
                              onChange={(evt) => { this.updateTable.bind(this, 1, index)(evt) }}/>
                  </div>

                  {
                    this.state.options.manualMode ?
                      <input type="button" onClick={this.removeTable.bind(this, index)} value="Remove"/>
                    : ""
                  }
                </li>
              );
            })
          }
        </ol>

        {
          this.state.options.manualMode ?
            <input type="button" onClick={this.addTable.bind(this)} value="Add table"/>
          : ""
        }

        <hr/>

        <span>Business rules:</span>
        <ol>
        {
          this.state.options.rules.map((curr, index) => {
            return (
              <li>
                <span>If</span>
                <select value={curr["if"]["antecedent"]}
                        className={classnames(styles.select)}
                        onChange={(evt) => { this.updateRule.bind(this, 0, index)(evt) }}>
                  {
                    this.keys.map((curr, index) => {
                      return (
                        <option value={curr}>{curr}</option>
                      );
                    })
                  }
                </select>
                <select value={curr["if"]["op"]}
                        className={classnames(styles.select)}
                        onChange={(evt) => {this.onChangeOperator.bind(this, 0, index)(evt)}}>
                  {
                    this.state.options.op.map((curr, index) => {
                      return (
                        <option value={curr}>{curr}</option>
                      );
                    })
                  }
                </select>
                <input className={classnames(styles.inputRule)}
                      type="text"
                      value={curr["if"]["consequent"]}
                      onChange={(evt) => { this.updateRule.bind(this, 1, index)(evt) }}
                      />


                <span>Then</span>

                <select value={curr["then"]["antecedent"]}
                        className={classnames(styles.select)}
                        onChange={(evt) => { this.updateRule.bind(this, 2, index)(evt) }}>
                  {
                    this.keys.map((curr, index) => {
                      return (
                        <option value={curr}>{curr}</option>
                      );
                    })
                  }
                </select>
                <select value={curr["then"]["op"]}
                        className={classnames(styles.select)}
                        onChange={(evt) => {this.onChangeOperator.bind(this, 1, index)(evt)}}>
                      {
                        this.state.options.op.map((curr, index) => {
                          return (
                            <option value={curr}>{curr}</option>
                          );
                        })
                      }
                </select>
                <input className={classnames(styles.inputRule)}
                      type="text"
                      value={curr["then"]["consequent"]}
                      onChange={(evt) => { this.updateRule.bind(this, 3, index)(evt) }}
                      />
                <input type="button" onClick={this.removeRule.bind(this, index)} value="Remove"/>
              </li>
            );
          })
        }

        </ol>
        <input type="button" onClick={this.addRule.bind(this)} value="Add rule"/>
      </div>
    );
  }

  _renderFromCollectionModeContent() {
    return (
      <div>
        <div>
          Load truth tables from an other collection.
          Table must have a single document with the following schema:

          <p>key: [value1, value2, value3]</p>

          If key have dots like "attr1.attr2" then key reference the attribute "attr2" inside "attr1".
        </div>

        <br></br>

        <span>Select collection</span>
        <select
                value={ this.state.options.externalCollection }
                className={classnames(styles.select)}
                onChange={(evt) => { this.onExternalCollectionChange(evt) }}>

                {
                  this.state.options.collections.map((currCl, index2) => {
                    return (
                      <option value={currCl}>{currCl}</option>
                    );
                  })
                }
        </select>
      </div>
    );
  }
}

class CurrentnessMetricTab extends MetricTab{

  static displayName = 'CurrentnessMetricTab';

  constructor(props) {
    super(props);
    this.changeAttr = this.changeAttr.bind(this);
  }

  changeAttr(evt){
    var opt = this.state.options;
    opt = evt.target.value;
    this.setState({options: opt});
  }

  renderContent() {
    return (
      <div>
        <p>
          You must choose a date and a time in order to measure the currentness of the <b>current collection</b>.
        </p>
        <p>
          Only the documents added more recently than the chosen date will be considered.
        </p>
        <p>
        You must insert both date and time, otherwise the result will be score with the current date and time as limit.
        </p>
        <p>
          <input id="currentness-datetime" type="datetime-local" onChange={this.changeAttr}/>
          &nbsp;&nbsp;&nbsp;(Be carefull, you are choosing the date with the current timezone offset).
        </p>
        <p>
          The score would be high if the average date of insertion of documents is close to today's date.
        </p>
        <p>
          Otherwise, the score would be low if the the average date of insertion of documents is close to the selected date.
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
    var value = Number(document.getElementById("nRandom").value);
    var isPositiveInteger = Number.isInteger(value) && value > 0;
    this.setState({validSampleSize: isPositiveInteger});

    if (isPositiveInteger) {
      this.props.actions.randomRequestFunct(document.getElementById("nRandom").value);
    }
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

  loadLastSave() {
    this.props.actions.loadLastSave();
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
            active={this.props.status == 'enabled' && !this.props.computingMetadata}
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
      "CompletenessMetric": [CompletenessMetricTab, "Completeness"],
      "AttributeCompletenessMetric": [AttributeCompletenessMetricTab, "Attribute Completeness"],
      "CandidatePkMetric": [CandidatePkMetricTab, "Candidate Primary Key"],
      "RegexMetric": [RegexMetricTab, "Regex Accuracy"],
      "ConsistencyMetric": [ConsistencyMetricTab, "Consistency"],
      "CurrentnessMetric": [CurrentnessMetricTab, "Currentness"]
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
                        compute={(props, onComputationEnd, onComputationError) =>
                          this.props.actions.computeMetric(key, props, onComputationEnd, onComputationError)
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
