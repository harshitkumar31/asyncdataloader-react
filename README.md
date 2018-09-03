<h1 align="center">asyncdataloader-react</h1>

[![NPM version](https://badge.fury.io/js/badge-list.svg)](http://badge.fury.io/js/badge-list)
[![Open Source Love](https://badges.frapsoft.com/os/mit/mit.svg?v=102)](https://github.com/ellerbrock/open-source-badge/)



AsyncDataLoader assumes you are using react-redux (<https://github.com/reactjs/react-redux>)

AsyncDataLoader is a React Higher Order Component which takes responsibility of fetching data of 
the Wrapped Component and offers many options like showing an interface preview of the Wrapped
Component while data is being fetched, refetch data after specified time.

## Installation

    npm install asyncdataloader-react --save

## Usage

### Step-1
  Add the reducer to your redux reducers

```javascript
    import {reducer} from 'asyncdataloader-react';

    const reducers = {
      // your other reducers
      asyncDataLoader: reducer,
    };
```

  Add the following in your redux initial state
  
  ```javascript
  export const initialState = {
    // Other inital objects
    asyncDataLoader: {
      components: {},
    },
  };
  ```


### Step-2

```javascript
    import React, { PropTypes } from 'react';
    import { asyncDataLoader } from 'asyncdataloader-react';


    const InterfacePreview = (props) => <div>Loading</div>;
    const get = (url) =>
      // Return a new promise.
       new Promise((resolve, reject) => {
        // Do the usual XHR stuff
         const req = new XMLHttpRequest();
         req.open('GET', url);

         req.onload = function () {
          // This is called even on 404 etc
          // so check the status
           if (req.status == 200) {
            // Resolve the promise with the response text
             resolve(req.response);
             // Dispatch actions, to store response in redux
           } else {
            // Otherwise reject with the status text
            // which will hopefully be a meaningful error
             reject(Error(req.statusText));
           }
         };

        // Handle network errors
         req.onerror = function () {
           reject(Error('Network Error'));
         };

        // Make the request
         req.send();
       });
    class Example extends React.Component {


      static fetchDataAsync(dispatch, params, location) {
        return get('https://jsonplaceholder.typicode.com/posts/1');
      }
      render() {
        return <div>Success</div>;
      }


    }

    export default asyncDataLoader(Example, {
      componentName: 'Example',
      refreshInterval: 60000,
    },
    InterfacePreview);
```


It also allows nested components(you can have multiple components with asyncDataLoader nested at different levels).


### Parameters
### @param  {React.Component} WrappedComponent

  The Component to be rendered; Component should have a static method with the                                                      
  signature as follows:

   static fetchDataAsync(dispatch, params, location, extraArguments);

If you want to refetch data invoke this.props.fetch() inside the WrappedComponent's methods.

### @param  {String} options.componentName                     
   componentName needs to be unique,it is used to monitor the load status of                                                          
   the component.
   Async Load Status of a Component is of the form : 
     
     asyncLoadStatus[componentName] : {
      loaded: 1/2/3,(1: Loaded Successfully, 2: Not Loaded, 3: Error while Loading)
      loadCount: 1...,
      loadTime: 12345(in milliseconds),
    }

### @param  {Number} options.refreshInterval
   refreshInterval is the time specified in milliseconds. After every specified milliseconds,
   data is fetched again. If not specified, data is only fetched once.


### @param  {function} options.wrappedComponentMapStateToProps
   If the component needs to be connected to the redux store using 'connect' from 'react-redux',then specify mapStateToProps as wrappedComponentMapStateToProps


### @param  {[type]} options.wrappedComponentMapDispatchToProps

### @param  {[type]} options.enforceNoPreview
   If specified, shows no preview before fetching data

### @param  {React.Component} InterfacePreview 
   Specify InterfacePreview if you want to specify custom preview to your Component while the data is being fetched. If not specified, a default loading gif is shown

### @param  {React.Component} RetryComponent
   If you want to specify retry to your Component when data fetch fails.If not specified, a default retry is shown
