import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { componentLoaded } from './redux';
import { withRouter } from 'react-router';
import RetryButton from './retryButton';

const loadingGif = require('./loading.gif');

const DefaultLoadingDiv = (props) => (<div><img role="presentation" /></div>);


const propTypes = {
  params: PropTypes.object,
  location: PropTypes.object,
  asyncLoadStatus: PropTypes.object,
  dispatch: PropTypes.func,
};

/**
 * AsyncDataLoader is a Higher Order Component which takes responsibility of fetching data of
 * the Wrapped Component and offers many options like showing an interface preview of the Wrapped
 * Component while data is being fetched, refetch data after specified time
 * @param  {React.Component} WrappedComponent                 The Component to be rendered;
 *                                                            Component should have a static method with the
 *                                                            signature as follows:
 *                                                            static fetchDataAsync(dispatch, params, location, extraArguments);
 *                                                            If you want to refetch data
 *                                                            invoke this.props.fetch() inside the WrappedComponent's methods.
 *
 *                                                            // TODO detach fetchDataAsync from Component, in order to reuse same
 *                                                            component for different API calls
 *
 * @param  {String} options.componentName                     componentName needs to be unique,
 *                                                            it is used to monitor the load status of
 *                                                            the component.
 *                                                            Async Load Status of a Component is of the form :
 *                                                            asyncLoadStatus[componentName] : {
 *                                                              loaded: 'true'/'false'/'error',
 *                                                              loadCount: 1...,
 *                                                              loadTime: 12345(in milliseconds),
 *                                                             }
 *
 * @param  {Number} options.refreshInterval                  refreshInterval is the time specified in
 *                                                            milliseconds. After every specified time,
 *                                                            data is fetched again. If not specified,
 *                                                            data is only fetched once.
 * @param  {function} options.wrappedComponentMapStateToProps If the component needs to be connected to the
 *                                                            redux store using 'connect' from 'react-redux',
 *                                                            then specify mapStateToProps as wrappedComponentMapStateToProps
 * @param  {[type]} options.wrappedComponentMapDispatchToProps [description]
 * @param  {[type]} options.enforceNoPreview                   If specified, shows no preview before fetching data
 * @param  {React.Component} InterfacePreview                 Specify InterfacePreview if you want to specify
 *                                                            custom preview to your Component while the data
 *                                                            is being fetched. If not specified, a default loading
 *                                                            gif is shown
 * @param  {React.Component} RetryComponent                   Specify RetryComponent if you want to specify
 *                                                            retry to your Component when data fetch fails.
 *                                                            If not specified, a default retry is shown
 * @return {React.Component}
 */
const AsyncDataLoader = (WrappedComponent, { componentName, refreshInterval, wrappedComponentMapStateToProps, wrappedComponentMapDispatchToProps, enforceNoPreview, enforceNoRetry }, InterfacePreview, RetryComponent) => {
  const asyncDataLoaderMapStateToProps = (state) => ({
    asyncLoadStatus: state.asyncDataLoader.components, // AsyncDataLoaderV2 is subscribed to this,
                                                         // but each instance of AsyncDataLoaderV2 should only
                                                         // be subscribed to the loadStatus of the WrappedComponent.
                                                         // To ensure this behaviour, we check if only the WrappedComponent's
                                                         // loadStatus changed in the shouldComponentUpdate(). refer the method
  });
  class AsyncLoaderWrappedComponent extends React.Component {

    constructor(props) {
      super(props);
      this.fetch = this.fetch.bind(this);
    }
    /**
     * Fetch is invoked here to ensure server side rendering
     * If refreshInterval is specified, we invoke setInterval.
     */
    componentWillMount() {
      this.fetch();
    }
    componentDidMount() {
      if (refreshInterval) {
        this.startTimer = setInterval(this.fetch, refreshInterval);
        // Clear timer if browser goes offline
        window.addEventListener('offline', (e) => {
          clearInterval(this.startTimer);
        });

      // Restart timer if browser goes online
        window.addEventListener('online', (e) => {
          this.startTimer = setInterval(this.fetch, refreshInterval);
        });
      }
    }
    /**
     * @return {[type]} We clear the interval in componentWillUnmount
     * to ensure the fetch isn't invoked if the component isn't present
     * on the page
     */
    componentWillUnmount() {
      if (this.startTimer) {
        clearInterval(this.startTimer);
      }
      const obj = {};
      obj[componentName] = {
        loaded: 'false',
      };
      this.props.dispatch(componentLoaded(obj));
    }

    fetch() {
      const { params, location, asyncLoadStatus } = this.props;
      const obj = {};
      if (!refreshInterval) {
        obj[componentName] = {
          loaded: 'false',
        };
        this.props.dispatch(componentLoaded(obj));
      }
      WrappedComponent.fetchDataAsync(this.props.dispatch, params, location, this.props).then((res, rej) => {
        // const obj = {};
        const loadCount = asyncLoadStatus[componentName] && asyncLoadStatus[componentName].loadCount + 1 || 1;
          obj[componentName] = {
            loaded: 'true',
            loadCount,
            loadTime: new Date().getTime(),
          };
          this.props.dispatch(componentLoaded(obj));
        }).catch(e => {
        console.log('Error in asyncDataLoaderV2', e);
        obj[componentName] = {
            loaded: 'error',
          };
          this.props.dispatch(componentLoaded(obj));
      });
    }

    render() {
      const { asyncLoadStatus } = this.props;
      const interfacePreview = InterfacePreview ? <InterfacePreview /> : <DefaultLoadingDiv />;
      const loaded = asyncLoadStatus[componentName] ? asyncLoadStatus[componentName].loaded : 'false';
      if (loaded === 'true') {
        // WrappedComponent Dont need asyncLoadStatus prop, so making it null will prevent some rerenders ;-)
        return <WrappedComponent ref={componentName} fetch={this.fetch} {...this.props} asyncLoadStatus={null} />;
      } else if (loaded === 'false') {
        if (!enforceNoPreview) {
          return interfacePreview;
        }
        return null;
      } else if (enforceNoRetry) {
        return null;
      }
      return RetryComponent ? <RetryComponent onClick={this.fetch} /> : <RetryButton onClick={this.fetch} />;
    }
  }
  AsyncLoaderWrappedComponent.propTypes = propTypes;
  let mapStateToProps = null;
  if (wrappedComponentMapStateToProps) {
    mapStateToProps = (state, props) => ({
      ...asyncDataLoaderMapStateToProps(state, props),
      ...wrappedComponentMapStateToProps(state, props),
    });
  } else {
    mapStateToProps = (state) => ({
      ...asyncDataLoaderMapStateToProps(state),
    });
  }
  let mapDispatchToProps = null;
  if (wrappedComponentMapDispatchToProps) {
    mapDispatchToProps = dispatch => ({
      ...wrappedComponentMapDispatchToProps(dispatch),
      dispatch,
    });
  }

  return withRouter(connect(mapStateToProps, mapDispatchToProps)(AsyncLoaderWrappedComponent));
};

export default AsyncDataLoaderV2;
