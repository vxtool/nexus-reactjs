# Patterns

## Requisiçôes de APIs com Redux

3 ações:
 - Request
 - Request Success
 - Request Failure

Esse padrão contempla a regra para apresentar o `loading` como feeedback para o usuário.

Que consiste na regra dos type com sufixos: `REQUEST`, `REQUEST_SUCCESS`, `REQUEST_FAILURE`.

Essas 3 ações não serão expostas no container ou no componente. Elas serão acionadas mediante uma ação de encapsulamento que terá o padrão com o prefixo `fetch`.

Exemplor prático:

```
export const actionsRequest = () => {
  return {
    type: ACTIONS_REQUEST,
  };
};

export const actionsRequestSuccess = data => {
  return {
    type: ACTIONS_REQUEST_SUCCESS,
    payload: {
      data,
    },
  };
};

export const actionsRequestFailure = () => {
  return {
    type: ACTIONS_REQUEST_FAILURE,
    error: true,
  };
};

export const fetchActions = (page = 1, searchText) => dispatch => {
  dispatch(actionsRequest());
  return actions
    .get(page, searchText)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        setTimeout(() => {
          dispatch(actionsRequestSuccess(response.data));
        }, 2000);
      }
    })
    .catch(error => {
      dispatch(actionsRequestFailure());
    });
};
```

## Summary
- **Documentation**
  - [Architecture](./ARCHITECTURE.md)
  - [ImmutableJS](./IMMUTABLE.md)
  - Patterns
  - [Redux actions](./REDUX_ACTIONS.md)
  - [Reselect](./RESELECT.md)
  - [Technologies](./TECHNOLOGIES.md)
- **Examples**
  - [Example 1](../examples/example-1)
  - [Example 2](../examples/example-2)
  - [Example 3](../examples/example-3)
  - [Example 4](../examples/example-4)
  - [Example 5](../examples/example-5)
  - [Example 6](../examples/example-6)
  - [Example 7](../examples/example-7)
  - [Example 8](../examples/example-8)
  - [Example 9](../examples/example-9)
  - [Example 10](../examples/example-10)
  - [Example 11](../examples/example-11)
  - [Example 12](../examples/example-12)
  - [Example 13](../examples/example-13)
  - [Example 14](../examples/example-14)
  - [Example 15](../examples/example-15)
  - [Example 16](../examples/example-16)
