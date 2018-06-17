import React from 'react';
import { childrenWithProps } from '../utils';

export default props => (
  <div>{ childrenWithProps(props.children, props) }</div>
);
