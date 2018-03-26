import Reflux from 'reflux';
import StateMixin from 'reflux-state-mixin';
import QualityActions from 'actions';
import toNS from 'mongodb-ns';


const debug = require('debug')('mongodb-compass:stores:quality');

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
 init() {},

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
		collectionsValues : [], //metadata
		collectionValuesByKey: [],

    //for the random request
    randomRequest : false,
    numRequested : 0,
    randomSubCollection : [], //metadata of the numRequested-size subCollection

    //for the "query" request
    queryRequest : false,
    querySubCollection : []
	};
},

/**
* handlers for each action defined in ../actions/index.jsx, for example:
*/
toggleStatus() {
	this.setState({
		status: this.state.status === 'enabled' ? 'disabled' : 'enabled'
	});
},

//to do map-reduce
analyzeNotObject(dataReturnedFind, el, type){
 var collectionToSet = [];
 for(var i =0 ; i<dataReturnedFind.length ; i++){
   this.keysByShow = Object.keys(dataReturnedFind[i]);
   for(var j=0;j<this.keysByShow.length;j++){
     if(this.keysByShow[j] ==  el){
       if(this.valueExistsInMetadata(dataReturnedFind[i][el.toString()],collectionToSet).found === false){
         if(type == "array"){
           var toInsert = "[" + dataReturnedFind[i][el].toString() + "]";
         }
         else {
           var toInsert = dataReturnedFind[i][el];
         }
         collectionToSet.push({"key" : toInsert.toString(), "count" : 1});
       }
       else{
         var position = this.valueExistsInMetadata(dataReturnedFind[i][el],collectionToSet).position;
         collectionToSet[position]["count"] ++;
       }
     }
   }
 }
 return collectionToSet;
},

//to do map-reduce
analyzeObject(dataReturnedFind, el, rowElement){
 var collectionToSet = [];
 var objLength = dataReturnedFind.length;
 for(var i=0;i<objLength;i++){
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
   var percentage = collectionToSet[i]["count"]/ objLength;
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
},

showKeyValues(el,type,rowElement){

  var barElements = document.getElementsByClassName('bar');
 	for(var i=0;i<barElements.length;i++){
 		barElements[i].style.display = "none";
 	}

	if(type!="object"){

		document.querySelectorAll('.appendedObject').forEach(function(a){a.remove()});

		this.dataService.find(this.namespace, {}, {}, (errors,dataReturnedFind) =>{
      var coll = [];
      coll = this.analyzeNotObject(dataReturnedFind, el, type);
			for(var i=0;i<barElements.length;i++){
				barElements[i].style.display = "block";
			}
			this.setState({collectionValuesByKey : coll});
		});
	}
  else{
		var appendedObjectElements = rowElement.getElementsByClassName('appendedObject');
		if(appendedObjectElements.length > 0){
			document.querySelectorAll('.appendedObject').forEach(function(a){a.remove()});
			return;
		}
		this.dataService.find(this.namespace, {}, {}, (errors, dataReturnedFind) =>{
      this.analyzeObject(dataReturnedFind, el, rowElement);
		});
  }
},

createMetaData(dataReturnedFind, tmpValues){
  var realMetaData = this.calculateMetaData(dataReturnedFind);
  var tmpMetaData = this.calculateMetaData(tmpValues);
  var initialLength = tmpMetaData.length;

  //check if all the attributes are into the subSet
  if(realMetaData.length > tmpMetaData.length){
    for(var i=0; i<realMetaData.length; i++){
      var founded = false;
      var c = 0;
      while(!founded && c<initialLength){
        if(realMetaData[i]["key"] == tmpMetaData[c]["key"]){
          founded = true;
        }
        c++;
      }
      if(!founded){
        tmpMetaData.push({"key" : realMetaData[i]["key"], "type" : realMetaData[i]["type"], "count" : 0,"multiple":"No" , "cwa":"No", "percentage" : 0});
      }
    }
  }

  return tmpMetaData;
},

randomRequestFunct(num){

  var barElements = document.getElementsByClassName('bar');
  for(var i=0;i<barElements.length;i++){
    barElements[i].style.display = "none";
  }
  document.querySelectorAll('.appendedObject').forEach(function(a){a.remove()});

   var number = parseInt(num);

   //if the number inserted is less than zero or isn't a number or is bigger than the length of the collection
   //analyze all the collection

   if(!(isNaN(number) || number<=0)){
     this.dataService.find(this.namespace, {}, {}, (errors,dataReturnedFind) => {
       var tmpMetaData = [];
       if(number >= dataReturnedFind.length){
         this.setState({randomRequest : false});
         return;
       }

       var tmpValues = [];

       var factor = parseInt(dataReturnedFind.length / number);

       for(var i=0, c=0; c < number; i = i + factor, c++){
         tmpValues.push(dataReturnedFind[i]);
       }

       tmpMetaData = this.createMetaData(dataReturnedFind, tmpValues);

       this.setState({randomRequest : true});
       this.setState({randomSubCollection : tmpMetaData});
       this.setState({numRequested : number});
     });
  }else{
    this.setState({randomRequest : false});
  }

},

showRandKeyValues(el,type,rowElement,num){

   var barElements = document.getElementsByClassName('bar');
   for(var i=0;i<barElements.length;i++){
     barElements[i].style.display = "none";
   }

   var number = parseInt(num);
   var subCollection = [];

   this.dataService.find(this.namespace, {}, {}, (errors,dataReturnedFind) => {

   var factor = parseInt(dataReturnedFind.length / number);

   for(var i=0, c=0; c < number; i = i + factor, c++){
     subCollection.push(dataReturnedFind[i]);
   }

   if(type!="object"){


     var coll = [];
     coll = this.analyzeNotObject(subCollection, el, type);

     for(var i=0;i<barElements.length;i++){
      barElements[i].style.display = "block";
     }

     this.setState({numRequested : num});
     this.setState({collectionValuesByKey : coll});
   }
   else{
     var appendedObjectElements = rowElement.getElementsByClassName('appendedObject');
     if(appendedObjectElements.length > 0){
       document.querySelectorAll('.appendedObject').forEach(function(a){a.remove()});
       return;
     }
     this.analyzeObject(subCollection, el, rowElement);
     this.setState({numRequested : num});
     this.setState({collectionValuesByKey : []});
   }
 });
},

queryRequestFunct(){

  var barElements = document.getElementsByClassName('bar');
  for(var i=0;i<barElements.length;i++){
    barElements[i].style.display = "none";
  }
  document.querySelectorAll('.appendedObject').forEach(function(a){a.remove()});

  const findOptions = {
         sort: this.sort,
         fields: this.project,
         skip: this.skip,
         limit: this.limit
       };

  var entireCollection = [];

  this.dataService.find(this.namespace, {}, {}, (errors,entireColl) => {

      this.dataService.find(this.namespace, this.filter, findOptions, (errors,filteredColl) => {

        var tmpMetaData = this.createMetaData(entireColl, filteredColl);

        this.setState({queryRequest : true});
        this.setState({querySubCollection : tmpMetaData});
      });
    });
},

showQueryKeyValues(el,type,rowElement){

  var barElements = document.getElementsByClassName('bar');
  for(var i=0;i<barElements.length;i++){
    barElements[i].style.display = "none";
  }

  const findOptions = {
         sort: this.sort,
         fields: this.project,
         skip: this.skip,
         limit: this.limit
       };

  this.dataService.find(this.namespace, this.filter, findOptions, (errors,dataReturnedFind) => {

    if(type!="object"){
      document.querySelectorAll('.appendedObject').forEach(function(a){a.remove()});

      var coll = [];
      coll = this.analyzeNotObject(dataReturnedFind, el, type);

      for(var i=0;i<barElements.length;i++){
       barElements[i].style.display = "block";
      }

      this.setState({queryRequest : true});
      this.setState({collectionValuesByKey : coll});
    }
    else{
      var appendedObjectElements = rowElement.getElementsByClassName('appendedObject');
      if(appendedObjectElements.length > 0){
        document.querySelectorAll('.appendedObject').forEach(function(a){a.remove()});
        return;
      }
      this.analyzeObject(dataReturnedFind, el, rowElement);

      this.setState({queryRequest : true});
      this.setState({collectionValuesByKey : []});
    }

  });
},

resetCollection(){
   document.querySelectorAll('.appendedObject').forEach(function(a){a.remove()});
   this.setState(this.getInitialState());
 },

//to do map-reduce
calculateMetaData(dataReturnedFind){
 	var obj = dataReturnedFind;
 	var keys = [];
 	var metaData = [];
	var types=[];
 	for(var x = 0; x<obj.length; x++)
 	{
 		var keys = Object.keys(obj[x]);
 		for (var i = 0; i < keys.length; i++) {
			types=[];
 			var type = this.getCurrentType(obj[x][keys[i]]);
 			var isKeyPresent = false;
 			var positionAndFound = this.keyExistsInMetadata(keys[i],type, metaData);
 			if(positionAndFound.position >= 0 && positionAndFound.found){
 					isKeyPresent = true;
					types=metaData[positionAndFound.position]["type"];
				    var tmpInt=types.indexOf(type);
					if (tmpInt<=-1){
						types.push(type);
						metaData[positionAndFound.position]["type"]=types.sort();
						if (type=="null")
							metaData[positionAndFound.position]["cwa"]="Yes";
						else
							metaData[positionAndFound.position]["multiple"]="Yes";

					}
 			}
 			if(!isKeyPresent){
				types.push(type);
 				metaData.push({"key" : keys[i], "type" : types, "count" : 1,"multiple":"No" , "cwa":"No"});

			}else{
 				metaData[positionAndFound.position]["count"] ++;
 			}
 		}

 	}
 	for(var i = 0; i<metaData.length;i++){
 		var percentage = metaData[i].count / obj.length;
 		metaData[i].percentage = Math.round(percentage * 100*100)/100 ;
 	}

 	this.collectionValues = metaData;
 	return metaData;
},

/*
Listeners for events in Compass
*/

onDatabaseChanged(namespace){
	this.setState(this.getInitialState());
},

onCollectionChanged(namespace) {
	this.setState(this.getInitialState());
	this.namespace = namespace;
	this.dataService.find(namespace, {}, {}, (errors,dataReturnedFind) => {


		var metaData = this.calculateMetaData(dataReturnedFind);
		this.setState({collectionsValues : metaData});



	});
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

keyExistsInMetadata(key, metaData){
	for(var i =0 ; i<metaData.length ; i++){
		if(metaData[i]["key"] == key)
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

  else if(typeof value == "boolean"){
    return "boolean";
  }
},

/**
 * log changes to the store as debug messages.
 * @param  {Object} prevState   previous state.
 */
 storeDidUpdate(prevState) {
 	debug('Quality store changed from', prevState, 'to', this.state);
 }

	});

export default QualityStore;
export { QualityStore };
