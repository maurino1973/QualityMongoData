import Reflux from 'reflux';
import StateMixin from 'reflux-state-mixin';
import QualityActions from 'actions';
import toNS from 'mongodb-ns';

const debug = require('debug')('mongodb-compass:stores:quality');


class MetricEngine
{
  /**
   * This method compute your metric using information from documents
   * The method must return a number >= 0.0 and <= 1.0
   */
  compute(docs) {
    // Override me
  }
}

class TestMetricEngine extends MetricEngine
{
  constructor() {
    super();
    this.score = Math.min(Math.random() + 0.01, 1.0);
  }

  compute(docs) {
    console.log("Test metric docs:", docs);
    return this.score;
  }
}

class CompletenessMetricEngine extends MetricEngine
{
  constructor() {
    super();
  }

  compute(docs) {
    if (docs.length == 0) {
      return 0.0;
    }

    var occurrences = {};

    for (var i in docs) {
      for (var key in docs[i]) {
        if (key in occurrences) {
          occurrences[key] += 1;
        } else {
          occurrences[key] = 1;
        }
      }
    }

    // Normalize data
    for (var key in occurrences) {
      occurrences[key] = occurrences[key] / docs.length;
    }

    // Metric score is computed as a simple algebraic mean
    var score = 0.0;
    for (var key in occurrences) {
      score += occurrences[key]
    }
    score /= Object.keys(occurrences).length;
    return score;
  }
}

/**
 * Performance Plugin store.
 */
 const QualityStore = Reflux.createStore({
	/**
	 * adds a state to the store, similar to React.Component's state
	 * @see https://github.com/yonatanmn/Super-Simple-Flux#reflux-state-mixin
	 *
	 * If you call `this.setState({...})` this will cause the store to trigger
	 * and push down its state as props to connected components.
	 */
	 mixins: [StateMixin.store],

	/**
	 * listen to all actions defined in ../actions/index.js
	 */
	 listenables: QualityActions,

	/**
	 * Initialize everything that is not part of the store's state. This happens
	 * when the store is required and instantiated. Stores are singletons.
	 */
	 init() {
	 },

	/**
	 * This method is called when all plugins are activated. You can register
	 * listeners to other plugins' stores here, e.g.
	 *
	 * appRegistry.getStore('OtherPlugin.Store').listen(this.otherStoreChanged.bind(this));
	 *
	 * If this plugin does not depend on other stores, you can delete the method.
	 *
	 * @param {Object} appRegistry - app registry containing all stores and components
	 */
	// eslint-disable-next-line no-unused-vars
	//onActivated(appRegistry) {
		// Events emitted from the app registry:
		//
		// appRegistry.on('application-intialized', (version) => {
		//   // Version is string in semver format, ex: "1.10.0"
		// });
		//
		//appRegistry.on('data-service-intialized', (dataService) => {
		   // dataService is not yet connected. Can subscribe to events.
		   // DataService API: https://github.com/mongodb-js/data-service/blob/master/lib/data-service.js
		 //});
		//

		//
		// appRegistry.on('collection-changed', (namespace) => {
		  //The collection has changed - provides the current namespace.
		//   // Namespace format: 'database.collection';
		//   // Collection selected: 'database.collection';
		//   // Database selected: 'database';
		//   // Instance selected: '';
		// });
		//
		// appRegistry.on('database-changed', (namespace) => {
		//   // The database has changed.
		//   // Namespace format: 'database.collection';
		//   // Collection selected: 'database.collection';
		//   // Database selected: 'database';
		//   // Instance selected: '';
		// });
		//
		// appRegistry.on('query-applied', (queryState) => {
		//   // The query has changed and the user has clicked "filter" or "reset".
		//   // queryState format example:
		//   //   {
		//   //     filter: { name: 'testing' },
		//   //     project: { name: 1 },
		//   //     sort: { name: -1 },
		//   //     skip: 0,
		//   //     limit: 20,
		//   //     ns: 'database.collection'
		//   //   }
		// });
	//},

	onActivated(appRegistry) {
    //TODO: Change the way the plugin update itself: it should fetch data only
    //      when querying or sampling
		// Events emitted from the app registry:
		appRegistry.on('collection-changed', this.onCollectionChanged.bind(this));
		appRegistry.on('database-changed', this.onDatabaseChanged.bind(this));
    appRegistry.on('query-changed', this.onQueryChanged.bind(this));
		appRegistry.on('data-service-connected', (error, dataService) => {
		//   // dataService is connected or errored.
		//   // DataService API: https://github.com/mongodb-js/data-service/blob/master/lib/data-service.js
      this.dataService = dataService;
    });
	},



	/**
	 * Initialize the Performance Plugin store state. The returned object must
	 * contain all keys that you might want to modify with this.setState().
	 *
	 * @return {Object} initial store state.
	 */
	 getInitialState() {
     var metricEngines = {
       "CompletenessMetric": new CompletenessMetricEngine(),
       "TestMetric1": new TestMetricEngine(),
       "TestMetric2": new TestMetricEngine()
     };

     var metrics = {};
     var weights = {};

     for (var metricName in metricEngines) {
       metrics[metricName] = 0.0;
       weights[metricName] = 0.0;
     }

     return {
       status: 'enabled',
       database: '',
       collections : [],
       databases : [],
       collectionsValues : {},
       collectionValuesByKey: {},
       collectionScore: 0,
       _metricEngine: metricEngines,
       metrics: metrics,
       weights: weights,
       _docs: []
     };
   },

   onQueryChanged(state) {
     if (state.ns && toNS(state.ns).collection) {
       this.filter  = state.filter;
       this.project = state.project;
       this.sort    = state.sort;
       this.skip    = state.skip;
       this.limit   = state.limit;
       this.namespace = state.ns;
     }
     console.log("onQueryChanged");
   },
	/**
	 * handlers for each action defined in ../actions/index.jsx, for example:
	 */
	 toggleStatus() {
	 	this.setState({
	 		status: this.state.status === 'enabled' ? 'disabled' : 'enabled'
	 	});
	 },

   /*
    * Called when a query or a sampling is made
    */
   profile() {
     //this.onCollectionChanged(this.namespace);
     //TODO: Change position, see onCollectionChanged TODO
     this.setState(this.getInitialState());
     const findOptions = {
       sort: this.sort,
       fields: this.project,
       skip: this.skip,
       limit: this.limit
     };

     this.dataService.find(this.namespace, this.filter, findOptions, (errors, docs) => {
       var data = this._calculateMetaData(docs);
        this.setState({_docs : docs});
        this.setState({collectionsValues: data[0],
                       collectionValuesByKey: data[1]});
     });
   },

   /*
    * Compute the metric using specific options
    * @param {name} is the name of the chosen metric
    * @param {props} are custom data passed to the metric
    */
   computeMetric(name, props) {
     console.assert(name in this.state._metricEngine);

     var docs = this.state._docs;
     var metricScore = this.state._metricEngine[name].compute(docs, props);

     var newMetrics = _.clone(this.state.metrics);
     var newWeights = _.clone(this.state.weights);
     newMetrics[name] = metricScore;
     //Activate weights
     newWeights[name] = this.state.weights[name] == 0.0 ? 1.0 : this.state.weights[name]
     this.setState({metrics: newMetrics,
                    weights: newWeights
     });

     this._computeGlobalScore(newMetrics, newWeights);
   },

   changeWeights(weights) {
     var w = _.clone(weights);
     this.setState({weights: w});

     this._computeGlobalScore(this.state.metrics, w);
   },

   _computeGlobalScore(metrics, weights) {
     /*
      * NOTE: I use relative weights to simplify things, therefore I must convert
      * these weights to absolute ones
      */
     var sum = 0.0;
     for (var key in weights) {
       sum += weights[key];
     }
     var x = 0.0;

     if (sum > 0.0) {
       x = 1.0/sum;
     }
     var absWeights = {};
     for (var key in weights) {
       absWeights[key] = weights[key] * x;
     }

     var cScore = 0.0;
     for (var mName in metrics) {
       cScore += metrics[mName] * absWeights[mName];
     }
     this.setState({collectionScore: 100 * cScore});
   },

   _getDocumentMetadata(doc, metadata) {
     for (var key in doc) {
       if (!(key in metadata)) {
         metadata[key] = {
           "type" : [],
           "count" : 0,
           "percentage": 0,
           "multiple": false,
           "cwa": false,
           "children": {}
         };
       }

       var type = this.getCurrentType(doc[key]);

       if (metadata[key]["type"].indexOf(type) <= -1) { // No type in metadata
         if (type == "null") {
           metadata[key]["cwa"] = true;
         } else {
           metadata[key]["multiple"] = true;
         }

         metadata[key]["type"].push(type);
         metadata[key]["type"] = metadata[key]["type"].sort();
       }

       if (type == "object" && key != "_id") {    // Ignore private fields
         metadata[key]["children"] = this._getDocumentMetadata(doc[key], metadata[key]["children"]);
       }
       metadata[key]["count"]++;
     }

     return metadata;
   },

   _getDocumentFreqs(doc, freqs) {
     for (var key in doc) {
       if (!(key in freqs)) {
         freqs[key] = {
           "values": {},  //<val> : {"count": 0, "type": null }
           "children": {}
         };
       }

       //NOTE: should I compute frequency of object type?
       const currValue = doc[key];
       var type = this.getCurrentType(currValue);

       if (currValue in freqs[key]["values"]) {   // Value is not unique
         freqs[key]["values"][currValue]["count"] += 1;
       } else {
         freqs[key]["values"][currValue] = {"count": 1, "type": type };
       }

       if (type == "object" && key != "_id") {    // Ignore private fields
         freqs[key]["children"] = this._getDocumentFreqs(doc[key], freqs[key]["children"]);
       }
     }

     return freqs;
   },

   _computePercentage(metadata, docsCount) {
     for (var key in metadata) {
       //console.log("key", key, metadata);
       var percentage = metadata[key].count / docsCount;
       metadata[key].percentage = Math.round(percentage * 100*100)/100;

       if (Object.keys(metadata[key]["children"]).length > 0) {
         metadata[key]["children"] = this._computePercentage(metadata[key]["children"], docsCount);
       }
     }

     return metadata;
   },

   _calculateMetaData(docs) {
     var metadata = {};
     var frequencies = {};
     for (var i = 0; i < docs.length; ++i) {
       metadata = this._getDocumentMetadata(docs[i], metadata);
       frequencies = this._getDocumentFreqs(docs[i], frequencies);
     }

     return [this._computePercentage(metadata, docs.length), frequencies];
   },

   /*
    * Listeners for events in Compass
    */
   onDatabaseChanged(namespace){
     console.log("Database Changed");
     this.setState(this.getInitialState());
   },

   //TODO: calculate on query submission or sampling
   onCollectionChanged(namespace) {
     console.log("Collection Changed");
     this.setState(this.getInitialState());
     this.namespace = namespace;
     this.dataService.find(namespace, {}, {}, (errors,dataReturnedFind) => {
       var data = this._calculateMetaData(dataReturnedFind);
       this.setState({collectionsValues: data[0], collectionValuesByKey: data[1]});
       this.setState({_docs : dataReturnedFind});  // TODO: Temporary??
     });
   },


   //UTILS Javascript functions
   getCurrentType (value) {
     //TODO: Add more types
     //NOTE: Currently "42"(string) is equal to 42(number) and since this implementation number check is before string
     //      "42"(string) is evaluated as number...
     if (value == null || value.length == 0) {
       return "null";
     } else if (value instanceof Array) {
       return "array";
     } else if (new Date(value.toString()) != 'Invalid Date' && isNaN(value.toString())) {
       return "date";
     } else if (!isNaN(value.toString())) {
       return "number";
     } else if (typeof value == "string") {
       return "string"
     } else if (typeof value == "object") {
       return "object";
     } else if (typeof value == "boolean") {
       return "bool";
     } else {
       return "unsupported";
     }
   },

   /**
    * log changes to the store as debug messages.
    * @param  {Object} prevState   previous state.
    */
   storeDidUpdate(prevState) {
     console.log("Store Updated");
     debug('Quality store changed from', prevState, 'to', this.state);
   }
});

export default QualityStore;
export { QualityStore };
