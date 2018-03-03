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
    // TODO: Override me
  }
}

class TestMetricEngine extends MetricEngine
{
  constructor() {
    super();
    this.score = Math.random();
  }

  compute(docs) {
    return this.score;
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
     return {
       status: 'enabled',
       database: '',
       collections : [],
       databases : [],
       collectionsValues : [],
       collectionValuesByKey: [],
       collectionScore: 0,
       metricEngine: {
         "TestMetric1": new TestMetricEngine(),
         "TestMetric2": new TestMetricEngine(),
         "TestMetric3": new TestMetricEngine()
       },
       metrics: ["TestMetric1", "TestMetric2", "TestMetric3"]
     };
   },

   onQueryChanged(state) {
     // TODO: Review this code
     if (state.ns && toNS(state.ns).collection) {
       this.filter  = state.filter;
       this.project = state.project;
       this.sort    = state.sort;
       this.skip    = state.skip;
       this.limit   = state.limit;
       this.ns      = state.ns;
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

   profile() {
     this.onCollectionChanged(this.namespace);
   },

   computeMetric(name, props) {
     console.assert(name in this.state.metricEngine);

     // TODO: cache the documents
     var metricScore = this.state.metricEngine[name](docs, props);
     // TODO: save metric score
   },

	 showKeyValues(el,type,rowElement){
	 	var barElements = document.getElementsByClassName('bar');
	 	for(var i=0;i<barElements.length;i++){
	 		barElements[i].style.display = "none";
	 	}
	 	if(type!="object"){
	 		document.querySelectorAll('.appendedObject').forEach(function(a){a.remove()});
	 		this.dataService.find(this.namespace, {}, {}, (errors,dataReturnedFind) =>{
	 			var collectionToSet = [];
	 			for(var i =0 ; i<dataReturnedFind.length ; i++){
	 				this.keysByShow = Object.keys(dataReturnedFind[i]);
	 				for(var j=0;j<this.keysByShow.length;j++){
	 					if(this.keysByShow[j] ==  el){// && this.getCurrentType(dataReturnedFind[i][el.toString()]) == type){
	 						if(this.valueExistsInMetadata(dataReturnedFind[i][el.toString()],collectionToSet).found === false){
	 							if(type == "array"){
	 								var toInsert = "[" + dataReturnedFind[i][el].toString() + "]";
	 							}
	 							else {
	 								var toInsert = dataReturnedFind[i][el];
	 							}

	 							var insert = "null";
	 							//FIXME: toInsert can be null...
	 							if (toInsert != null) {
                  insert = toInsert.toString();
                }

                collectionToSet.push({"key": insert, "count" : 1});
	 						}
	 						else{
	 							var position = this.valueExistsInMetadata(dataReturnedFind[i][el],collectionToSet).position;
	 							collectionToSet[position]["count"] ++;
	 						}
	 					}
	 				}
	 			}
	 			/*for(var i=0;i<collectionToSet.length;i++){
	 				for(var j=0; j<collectionToSet.length;j++){
	 					if(j!= i && collectionToSet[j]["key"] == collectionToSet[i]["key"]){
	 						collectionToSet.splice(i,1);
	 					}
	 				}
	 			}*/
	 			console.log("ok here")
	 			for(var i=0;i<barElements.length;i++){
	 				barElements[i].style.display = "block";
	 			}
	 			this.setState({collectionValuesByKey : collectionToSet});

	 		});
	 	}else{
	 		var appendedObjectElements = rowElement.getElementsByClassName('appendedObject');
	 		if(appendedObjectElements.length > 0){
	 			document.querySelectorAll('.appendedObject').forEach(function(a){a.remove()});
	 			return;
	 		}
	 		var collectionToSet = [];
	 		var obj = [];
	 		this.dataService.find(this.namespace, {}, {}, (errors, dataReturnedFind) =>{
	 			obj = dataReturnedFind;
	 			for(var i=0;i<dataReturnedFind.length;i++){
	 				this.keysByShowObject = Object.keys(dataReturnedFind[i]);
	 				for(var j=0;j<this.keysByShowObject.length;j++){

	 					if(this.keysByShowObject[j] == el){
	 						var keysByObjectTemp = Object.keys(dataReturnedFind[i][el]);
	 						for(var z=0 ; z<keysByObjectTemp.length;z++){
	 							var isKeyPresent = false;
	 							var type = this.getCurrentType(dataReturnedFind[i][el.toString()][keysByObjectTemp[z]]);
	 								if(this.keyExistsInMetadata(keysByObjectTemp[z], type, collectionToSet).found){
	 										isKeyPresent= true;
	 								}
	 							if(!isKeyPresent)
	 								collectionToSet.push({"key" : keysByObjectTemp[z], "type" : this.getCurrentType(dataReturnedFind[i][el.toString()][keysByObjectTemp[z]]), "count" : 1})
	 							else
	 							{
	 								for(var p=0;p<collectionToSet.length;p++){
	 									if(collectionToSet[p].key == keysByObjectTemp[z])
	 										collectionToSet[p].count ++;
	 								}
	 							}
	 						}
	 					}



	 				}
	 			}
	 			for(var i = 0; i<collectionToSet.length;i++){
	 				var percentage = collectionToSet[i]["count"]/ obj.length;
	 				collectionToSet[i].percentage = percentage * 100 ;
	 			}
	 			if(collectionToSet.length == 0){
	 				var rowToAppendError = document.createElement('div');
	 				rowToAppendError.innerHTML = 'An error has occurred while retrieving data from this Object. This is probably because all objects are empty.';
	 				rowToAppendError.style.color = 'red';
	 				rowToAppendError.style.fontWeight = 'bold';
	 				rowToAppendError.className = 'row appendedObject col-md-offset-1 col-md-11';
	 				rowElement.appendChild(rowToAppendError);
	 				return;
	 			}
	 			var rowToAppendMain = document.createElement('div');
	 			rowToAppendMain.className='row appendedObject col-md-12';
	 			rowToAppendMain.innerHTML = '<div class="col-md-2 col-md-offset-1"><b>Key</b></div><div class="col-md-1"><b>Type</b></div><div class="col-md-1"><b>Occurrences</b></div><div class="col-md-1 col-md-offset-1"><b>Percentage</b></div>';
	 			rowElement.appendChild(rowToAppendMain);
	 			for(var i = 0 ; i<collectionToSet.length;i++){
	 				var rowToAppend = document.createElement('div');
	 				rowToAppend.className = 'row appendedObject';
	 				var tmp= "";
	 				tmp = tmp + "<div class='col-md-offset-1 col-md-2 key-collection'>"+collectionToSet[i]["key"]+"</div>";
	 				tmp = tmp + "<div class='col-md-1'>"+collectionToSet[i]["type"]+"</div>";
	 				tmp = tmp + "<div class='col-md-1'>"+collectionToSet[i]["count"]+"</div>";
	 				tmp = tmp + "<div class='col-md-1 col-md-offset-1' style='position:relative;right:15px;'>"+collectionToSet[i].percentage+"%</div>";
	 				rowToAppend.innerHTML = tmp;
	 				rowElement.appendChild(rowToAppend);
	 			}
	 		});


	 	}
	 },

 calculateMetaData(dataReturnedFind){
	 	var obj = dataReturnedFind;
	 	var keys = [];
	 	var metaData = [];
		var types=[];

	 	for(var x = 0; x < obj.length; x++) {
      var keys = Object.keys(obj[x]);

      for (var i = 0; i < keys.length; i++) {
        types=[];
	 			var type = this.getCurrentType(obj[x][keys[i]]);
	 			var isKeyPresent = false;
	 			var positionAndFound = this.keyExistsInMetadata(keys[i], type, metaData);

        if(positionAndFound.position >= 0 && positionAndFound.found) {
          isKeyPresent = true;
          types = metaData[positionAndFound.position]["type"];
          var tmpInt = types.indexOf(type);

          if (tmpInt <= -1){
            types.push(type);

            metaData[positionAndFound.position]["type"] = types.sort();
            if (type == "null") {
              metaData[positionAndFound.position]["cwa"]="Yes";
            } else {
              metaData[positionAndFound.position]["multiple"]="Yes";
            }
          }
        }

        if(!isKeyPresent){
					types.push(type);

	 				metaData.push({"key" : keys[i],
                         "type" : types,
                         "count" : 1,
                         "multiple": "No",
                         "cwa": "No"});
				} else {
	 				metaData[positionAndFound.position]["count"]++;
	 			}
	 		}

	 	}

	 	var cScore = 0;
	 	for(var i = 0; i < metaData.length;i++) {
	 		var percentage = metaData[i].count / obj.length;
	 		metaData[i].percentage = Math.round(percentage * 100*100)/100;

      // TODO: Make a better row score algorithm
      cScore += metaData[i].percentage;
	 	}

	 	cScore /= metaData.length;

	 	this.collectionValues = metaData;

    //TODO: Use the results from the metrics
    this.setState({collectionScore: cScore});
	 	return metaData;
	 },
	/*
	Listeners for events in Compass
	*/

	onDatabaseChanged(namespace){
    console.log("Database Changed");
		this.setState(this.getInitialState());
	},

	onCollectionChanged(namespace) {
    console.log("Collection Changed");
		this.setState(this.getInitialState());
		this.namespace = namespace;
		this.dataService.find(namespace, {}, {}, (errors,dataReturnedFind) => {
			var metaData = this.calculateMetaData(dataReturnedFind);
			this.setState({collectionsValues : metaData});
		});
	},


	//UTILS Javascript functions
	keyExists(key, search) {
		if (!search || (search.constructor !== Array && search.constructor !== Object)) {
			return false;
		}
		for (var i = 0; i < search.length; i++) {
			if (search[i] === key) {
				return true;
			}
		}
		return key in search;
	},
	keyExistsInMetadata(key, type, metaData){
		for(var i =0 ; i<metaData.length ; i++){
			if(metaData[i]["key"] == key)// && metaData[i]["type"] == type)
				return{"position" : i, "found" : true}
		}
		return {"position": -1, "found" : false};
	},
	valueExistsInMetadata(key, metaData){
		var lastPosition = "";
		for(var i=0;i<metaData.length;i++){
			if(metaData[i]["key"] == key){
				return{"position" : i, "found" : true}
			}
		}
		return {"position" : -1 , "found" : false}
	},
	uniq(a){
		return Array.from(new Set(a));
	},

	getCurrentType (value){
		if(value == null || value.length==0){
			return "null";
		}
		else if(value instanceof Array){
			return "array";
		}
		else if(new Date(value.toString()) != 'Invalid Date' && isNaN(value.toString())){
			return "date";
		}
		else if(!isNaN(value.toString())){
			return "number";
		}
		else if(typeof value== "string"){
			return "string"
		}

		else if(typeof value == "object"){
			return "object";
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
