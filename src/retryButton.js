import React, { PropTypes } from 'react';

// import './index.scss';

const retryImage = require('./retry.png');

const propTypes = {
  onClick: PropTypes.func,
};

class retryButton extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      clicked: false,
    };
    this.onClick = this.onClick.bind(this);
  }
  onClick() {
    this.setState({ clicked: true });
    this.props.onClick();
  }
  render() {
    const { clicked } = this.state;
    const className = clicked ? 'refresh-icon rotate-img' : 'refresh-icon';
    return (
      <div className="refresh-wrapper"><img onClick={this.onClick} className={className} alt="" /></div>);
  }
}

retryButton.propTypes = propTypes;

export default retryButton;
