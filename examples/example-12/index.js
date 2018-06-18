import React from 'react';
import ReactDOM from 'react-dom';

import Component from './component';

ReactDOM.render(
  <Component label='Contador' initialValue={10} />
, document.getElementById('app'));
