<h1 align="center">asyncdataloader-react</h1>

AsyncDataLoader assumes you are using react-redux (<https://github.com/reactjs/react-redux>)

AsyncDataLoader is a React Higher Order Component which takes responsibility of fetching data of 
the Wrapped Component and offers many options like showing an interface preview of the Wrapped
Component while data is being fetched, refetch data after specified time.

## Installation

    npm install asyncdataloader-react --save

## Usage

Example

    export default asyncDataLoader(Example, { componentName: 'Example' },InterfacePreview);

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
      loaded: 'true'/'false'/'error',
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
