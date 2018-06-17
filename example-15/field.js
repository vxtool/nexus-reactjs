import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeValue } from './field-actions';

class Field extends Component {
  constructor(props) {
    super(props);
    this.state = { value: props.initialValue };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  render() {
    return (
      <div>
        <label>{this.props.value}</label><br />
        <input onChange={this.props.changeValue} value={this.props.value} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  value: state.field.value,
});

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ changeValue }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Field);
