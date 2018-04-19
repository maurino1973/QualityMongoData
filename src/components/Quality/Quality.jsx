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

class ConsistencyMetricTab extends MetricTab {
  static displayName = 'ConsistencyMetricTab';

  constructor(props) {
    super(props);

    this._badTables = this._badTables.bind(this);
    this._badRules  = this._badRules.bind(this);
    this._compute   = this._compute.bind(this);

    this.state["badTables"] = [];
    this.state["badRules"]  = [];
  }

  addTable() {
    var btabs = this._badTables();

    if (btabs.length != 0) {
      this.setState({
        badTables: btabs
      });
    } else {
      var newTable = this.state.options;
      newTable.tables.push({
        "path": "",
        "content": ""
      });

      this.setState({
        options: newTable,
        badTables: []
      });
    }
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
        tablePart = "content"
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
    var bRules = this._badRules();

    if (bRules.length != 0) {
      this.setState({
        badRules: bRules
      });
    } else {
      var newRule = this.state.options;
      newRule.rules.push({
        "if": {
          "antecedent": "",
          "consequent": ""
        },
        "then": {
          "antecedent": "",
          "consequent": ""
        }
      });

      this.setState({
        options: newRule,
        badRules: []
      });
    }
  }

  removeRule(index) {
    var remRule = this.state.options;
    remRule.rules.splice(index, 1);

    this.setState({
      options: remRule,
      badRules: this._badRules()
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

  renderContent() {
    var canAddTableStyle = function(index, tabLen, canAddTable) {
      if (index < tabLen - 1) {
        return true;
      }

      return canAddTable;
    }

    return (
      <div>
        <span>Truth tables:</span>
        <ol>
          {
            this.state.options.tables.map((curr, index) => {
              return (
                <li>
                  <span>Key</span>
                  <input className={classnames(styles.inputRule)}
                         style={this.state.badTables.indexOf(index) != -1 ? {background:"orangered"} : {}}
                         type="text"
                         value={curr["path"]}
                         onChange={(evt) => { this.updateTable.bind(this, 0, index)(evt) }}/>
                  <div>
                    <textarea rows="4" cols="50"
                              value={curr["content"]}
                              onChange={(evt) => { this.updateTable.bind(this, 1, index)(evt) }}/>
                  </div>
                  <input type="button" onClick={this.removeTable.bind(this, index)} value="Remove"/>
                </li>
              );
            })
          }
        </ol>
        <input type="button" onClick={this.addTable.bind(this)} value="Add table"/>

        <hr/>

        <span>Business rules:</span>
        <ol>
        {
          this.state.options.rules.map((curr, index) => {
            return (
              <li>
                <span>If</span>
                <input className={classnames(styles.inputRule)}
                      type="text"
                      style={this.state.badRules.indexOf(index) != -1 ? {background:"orangered"} : {}}
                      value={curr["if"]["antecedent"]}
                      onChange={(evt) => { this.updateRule.bind(this, 0, index)(evt) }}
                      />
                <select>
                  <option value="equal">equals</option>
                </select>
                <input className={classnames(styles.inputRule)}
                      type="text"
                      value={curr["if"]["consequent"]}
                      onChange={(evt) => { this.updateRule.bind(this, 1, index)(evt) }}
                      />


                <span>Then</span>
                <input className={classnames(styles.inputRule)}
                      type="text"
                      style={this.state.badRules.indexOf(index) != -1 ? {background:"orangered"} : {}}
                      value={curr["then"]["antecedent"]}
                      onChange={(evt) => { this.updateRule.bind(this, 2, index)(evt) }}
                      />
                <select>
                  <option value="equal">equals</option>
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

  _compute() {
    var btables = this._badTables();
    var brules = this._badRules();

    this.setState({
      badTables: btables,
      badRules: brules
    });

    if (btables.length == 0 && brules.length == 0) {
      MetricTab.prototype._compute.call(this);
    }
  }

  _badTables() {
    var res = [];
    for (var i = 0; i < this.state.options.tables.length; ++i) {
      var table = this.state.options.tables[i];

      if (table.path.length == 0) {
        res.push(i);
      }
    }
    return res;
  }

  _badRules() {
    var res = [];
    for (var i = 0; i < this.state.options.rules.length; ++i) {
      var rule = this.state.options.rules[i];

      if (rule["if"]["antecedent"].length == 0 || rule["then"]["antecedent"].length == 0) {
        res.push(i);
      }
    }
    return res;
  }
}

class TestMetricTab extends MetricTab {
  static displayName = 'TestMetricTab';

  constructor(props) {
    super(props);

    this.change = this.change.bind(this);
  }

  change() {
    if (this.state.options == "hello") {
      this.setState({options: "world"});
    } else {
      this.setState({options: "hello"});
    }
  }

  renderContent() {
    return (
      <div>
        { this.state.options }
        <input type="button" onClick={this.change} value="change"/>
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
            <input type="hidden" id="nRandomHidden" value={this.props.numRequested}/>

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
      "CompletenessMetric": [CompletenessMetricTab, "Completeness"],
      "ConsistencyMetric": [ConsistencyMetricTab, "Consistency"],
      "TestMetric": [TestMetricTab, "Test"]
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
