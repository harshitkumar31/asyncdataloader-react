import React, { PropTypes } from 'react';
import { asyncDataLoader } from 'asyncdataloader-react';


const PP = (props) => <div>Loading</div>;
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
},
PP);
