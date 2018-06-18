import React from 'react';

// Adicionado no ex.10
const childrenWithProps = (children, props) => {
  return React.Children.map(children,
    child => React.cloneElement(child, {...props}))
}

export { childrenWithProps };
