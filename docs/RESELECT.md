# Reselect

Em uma boa arquitetura Redux, você é encorajado a manter seu estado de armazenamento mínimo e derivar dados do estado conforme necessário. Como parte desse processo, é recomendado que você use `funções de seleção` em sua aplicação e use a biblioteca `Reselect` para ajudar a criar esses seletores.

Aqui está uma análise mais aprofundada do motivo pelo qual essa é uma boa ideia e como usar corretamente o `Reselect`.

## Noções básicas de seletores

Uma `função de seletor` é simplesmente qualquer função que aceita o estado de armazenamento do `Redux` (ou parte do estado) como um argumento, e retorna dados que são baseados nesse estado. Os seletores não precisam ser escritos usando uma biblioteca especial e não importa se você os escreve com `arrow function` ou a palavra reservada `function`. Por exemplo, esses são todos seletores:

```
const selectEntities = state => state.entities;

function selectItemIds(state) {
  return state.items.map(item => item.id);
}

const selectSomeSpecificField = state => state.some.deeply.nested.field;

function selectItemsWhoseNamesStartWith(items, namePrefix) {
  const filteredItems = items.filter(item => item.name.startsWith(namePrefix));
  return filteredItems;
}
``` 

Você pode chamar suas `funções de seletor` como quiser, mas é comum prefixá-las com `select` ou `get`, ou terminar o nome com `Selector`, como `selectFoo`, `getFoo` ou `fooSelector`.

O primeiro motivo para usar `funções de seletor` é para encapsulamento e reusabilidade. Digamos que uma das suas funções `mapStateToProps` se parece com isso:

```
const mapStateToProps = (state) => {
  const data = state.some.deeply.nested.field;
  return { data };
}
```

Imagine que você tenha vários componentes que precisam acessar esse campo. O que acontece se você precisar fazer uma mudança aonde esse estado é utilizado?

Agora você teria que alterar cada função `mapStateToProps` que referencia esse valor. Assim, da mesma forma que é recomendado o uso de `action creators` para encapsular detalhes da criação de ações, recomendo o uso de seletores para encapsular o conhecimento de onde um dado pedaço de estado existe.

Uma descrição comum de seletores é que eles são como `consultas em seu estado`. Você não se preocupa exatamente com a forma como a consulta surgiu com os dados de que precisava, apenas solicitou os dados e obteve um resultado.

## O uso do Reselect e a memorização

O próximo motivo para usar seletores é melhorar o desempenho. A otimização do desempenho geralmente envolve trabalhar mais rápido ou encontrar maneiras de fazer menos trabalho. Para uma aplicação react/redux, os seletores podem nos ajudar a fazer menos trabalho de duas maneiras diferentes.

Vamos imaginar que temos um componente que requer uma etapa de filtragem/classificação/transformação para os dados de que precisa. Para começar, sua função mapStateToProps parece com isto:

```
const mapStateToProps = (state) => {
  const { someData } = state;

  const filteredData = expensiveFiltering(someData);
  const sortedData = expensiveSorting(filteredData);
  const transformedData = expensiveTransformation(sortedData);

  return { data: transformedData };
}
``` 

No momento, essa lógica será executada novamente para cada ação enviada que resulte em uma atualização de estado, mesmo se o estado da loja que foi alterado estiver em uma parte da árvore de estado com a qual esse componente não se importa.

O que realmente queremos é apenas executar novamente essas etapas se `state.someData` realmente tiver mudado. É aí que entra a ideia de `memorização`.

`Memorização` é uma forma de armazenamento em cache. Envolve o rastreamento de entradas para uma função e o armazenamento das entradas e dos resultados para referência posterior. Se uma função for chamada com as mesmas entradas de antes, a função pode ignorar a execução do trabalho real e retornar o mesmo resultado gerado na última vez que recebeu esses valores de entrada.

A biblioteca `Reselect` fornece uma maneira para criar funções de seletor de memorização. A função `createSelector` aceita uma ou mais funções de `seletor de entrada` e uma função de `seletor de saída` e retorna uma nova função de seletor para você usar.

`createSelector` pode aceitar vários seletores de entrada, que podem ser fornecidos como argumentos separados ou como uma matriz. Os resultados de todos os seletores de entrada são fornecidos como argumentos separados para o seletor de saída:

```
const selectA = state => state.a;
const selectB = state => state.b;
const selectC = state => state.c;

const selectABC = createSelector(
  [selectA, selectB, selectC],
  (a, b, c) => {
    // faça algo com a, b e c e retorne um resultado
    return a + b + c;
  }
);

// chame a função de seletor e obtenha um resultado
const abc = selectABC(state);

// também poderia ser escrito como argumentos separados e funciona exatamente da mesma forma
const selectABC2 = createSelector(
  selectA, selectB, selectC,
  (a, b, c) => {
    // faça algo com a, b e c e retorne um resultado
    return a + b + c;
  }
);
```

Quando você chamar o seletor, o `Reselect` executará seus seletores de entrada com todos os argumentos que você forneceu e examinará os valores retornados. Se algum resultado for diferente de antes, ele executará novamente o seletor de saída e passará esses resultados como argumentos. Se todos os resultados forem os mesmos da última vez, ele ignorará a execução do seletor de saída e retornará o resultado final armazenado em cache de antes.

No uso típico do `Reselect`, você escreve seus `seletores de entrada` de nível superior como funções simples e usa `createSelector` para criar seletores que pesquisam valores aninhados:

```
const state = {
  a: { first: 5 },
  b: 10,
};

const selectA = state => state.a;
const selectB = state => state.b;

const selectA1 = createSelector(
  [selectA],
  a => a.first
);

const selectResult = createSelector(
  [selectA1, selectB],
  (a1, b) => {
    console.log('Seletor de saída em execução');
    return a1 + b;
  }
);

const result = selectResult(state);
// Log: 'Seletor de saída em execução'
console.log(result);
// 15

const secondResult = selectResult(state);
// Nenhuma saída de log
console.log(secondResult);
// 15
```

Note que na segunda vez que chamamos `selectResult`, o `seletor de saída` não foi executado. Como os resultados de `selectA1` e `selectB` foram os mesmos da primeira chamada, `selectResult` conseguiu retornar o resultado memoizado da primeira chamada.

É importante observar que, por padrão, o `Reselect` apenas memoriza o conjunto mais recente de parâmetros. Isso significa que se você chamar um seletor repetidamente com entradas diferentes, ele ainda retornará um resultado, mas terá que continuar executando novamente o seletor de saída para produzir o resultado:

```
const a = someSelector(state, 1); // primeira chamada, não memorizada
const b = someSelector(state, 1); // mesma entrada memorizada
const c = someSelector(state, 2); // diferente entrada, não memorizada
const d = someSelector(state, 1); // entrada diferente da última vez, não memorizada
```

Além disso, você pode passar vários argumentos para um seletor. O `Reselect` chamará todos os seletores de entrada com essas entradas exatas:

```
const selectItems = state => state.items;  
const selectItemId = (state, itemId) => itemId;  
  
const selectItemById = createSelector(  
  [selectItems, selectItemId],  
  (items, itemId) => items[itemId]  
);  

const item = selectItemById(state, 42);

/*
Internamente, o Reselect faz algo assim:

const firstArg = selectItems(state, 42);  
const secondArg = selectItemId(state, 42);  
  
const result = outputSelector(firstArg, secondArg);  
return result;  
*/

```

Por isso, é importante que todos os `seletores de entrada` fornecidos por você aceitem os mesmos tipos de parâmetros. Caso contrário, os seletores irão quebrar.

```
const selectItems = state => state.items;  

// espera um número como o segundo argumento
const selectItemId = (state, itemId) => itemId;  

// espera um objeto como o segundo argumento
const selectOtherField (state, someObject) => someObject.someField;  
  
const selectItemById = createSelector(  
  [selectItems, selectItemId, selectOtherField],  
  (items, itemId, someField) => items[itemId]  
);  
```

Neste exemplo, `selectItemId` espera que seu segundo argumento seja algum valor simples, enquanto `selectOtherField` espera que o segundo argumento seja um objeto. Se você chamar `selectItemById(state, 42)`, `selectOtherField` será interrompido porque está tentando acessar `42.someField`.

Você pode usar funções de seletor em qualquer lugar em sua aplicação que acesse a árvore de estados.

As funções de seletor são frequentemente colocadas junto aos `reducers`, pois ambos conhecem a forma do estado. No entanto, cabe a você colocar as funções do seletor e organizá-las.

## Otimizando o desempenho com Reselect

Há um problema de desempenho específico que pode ocorrer quando você usa seletores de memorização com um componente que pode ser processado várias vezes. Digamos que tenhamos essa definição de componente:

```
const selectSomeData = state => state.someData;

const selectFilteredSortedTransformedData = createSelector(
  selectSomeData,
  (someData) => {
    const filteredData = expensiveFiltering(someData);
    const sortedData = expensiveSorting(filteredData);
    const transformedData = expensiveTransformation(sortedData);

    return transformedData;
  }
)

const mapStateToProps = (state) => {
  const transformedData = selectFilteredSortedTransformedData (state);
  return { data: transformedData };
}
```

Essa é uma grande melhoria no desempenho, por dois motivos.

Primeiro, agora a transformação só ocorre se `state.someData` for diferente. Isso significa que, se dermos `dispatch` em uma ação que atualize `state.somethingElse`, não faremos nenhum trabalho nessa função `mapStateToProps`.

Segundo, a função de `connect` React/Redux determina se o seu componente deve ser renderizado novamente com base no conteúdo dos objetos que você retorna do `mapStateToProps`, usando comparações de `igualdade`. Se algum dos campos retornados for `===` diferente da última vez, o `connect` irá renderizar novamente seu componente. Isso significa que você deve evitar criar novas referências em uma função `mapStateToProps`, a menos que seja necessário. As funções de matriz como `concat()`, `map()` e `filter()` sempre retornam novas referências de matriz, assim como o operador de propagação de objetos. Usando seletores, podemos retornar as mesmas referências se os dados não forem alterados e assim, ignorar a nova renderização do componente.

## Otimizações avançadas com o React/Redux

Há um problema de desempenho específico que pode ocorrer quando você usa seletores com um componente que pode ser processado várias vezes.

Digamos que tenhamos essa definição de componente:

```
const mapStateToProps = (state, ownProps) => {
  const item = selectItemForThisComponent(state, ownProps.itemId);
  return { item };
}

const SomeComponent = (props) => <div>Name: {props.item.name}</div>;

export default connect(mapStateToProps)(SomeComponent);

<SomeComponent itemId={1} />
<SomeComponent itemId={2} />
```

Neste exemplo, `SomeComponent` está passando `ownProps.itemId` como um parâmetro para o seletor. Quando renderizamos várias instâncias de `<SomeComponent>`, cada uma dessas instâncias está compartilhando a mesma instância da função `selectItemForThisComponent`. Isso significa que quando uma ação é disparada, cada instância separada de `<SomeComponent>` chamará a função separadamente, como:

```
// primeira instância
selectItemForThisComponent(state, 1);
// segunda instância
selectItemForThisComponent(state, 2);
```

Como descrito anteriormente, o `Reselect` somente memoriza nas entradas mais recentes (ou seja, ele tem um tamanho de cache de 1). Isso significa que `selectItemForThisComponent` nunca irá memorizar corretamente, porque ele nunca está sendo chamado com as mesmas entradas consecutivas.

Esse código ainda será executado e funcionará, mas não é totalmente otimizado. Para obter o melhor desempenho absoluto, precisamos de uma cópia separada de `selectItemForThisComponent` para cada instância de `<SomeComponent>`.

A função de `connect` suporta uma sintaxe especial de `factory function` ​​para as funções `mapStateToProps` e `mapDispatchToProps`, que podem ser usadas para criar instâncias exclusivas de funções de seletor para cada instância do componente.

Se a primeira chamada para uma função `mapStateToProps` ou `mapDispatchToProps` retornar uma função ao invés de um objeto, o `connect` usará essa função retornada como a função `mapStateToProps` ou `mapDispatchToProps`. Isso permite criar seletores específicos de instâncias de componentes:

```
const makeUniqueSelectorInstance = () => createSelector(
  [selectItems, selectItemId],
  (items, itemId) => items[itemId]
);    


const makeMapState = (state) => {
  const selectItemForThisComponent = makeUniqueSelectorInstance();

  return function realMapState(state, ownProps) {
    const item = selectItemForThisComponent(state, ownProps.itemId);
    return { item };
  }
};

export default connect(makeMapState)(SomeComponent);
```

O componente 1 e o componente 2 obterão suas próprias cópias exclusivas de `selectItemForThisComponent`, e cada cópia será chamada com entradas consistentes e repetíveis, permitindo uma memorização adequada.

# Considerações

Como outros padrões comuns de uso do Redux, você não é obrigado a usar funções de seletor em um aplicação `Redux`. Se você quiser escrever pesquisas de estado profundamente aninhadas diretamente em suas funções ou thunks do mapStateToProps, você pode. Da mesma forma, você não precisa usar a biblioteca `Reselect` para criar seletores. Você pode simplesmente escrever funções simples, se quiser.

Dito isto, você é encorajado a usar funções de seletor e usar a biblioteca `Reselect` para seletores de memorização. Há também muitas outras opções para criar seletores, incluindo o uso de bibliotecas de utilitários de programação funcional, como `lodash/fp` e `Ramda`, e outras alternativas para `reselect`. Há também bibliotecas de utilitários que criam o `Reselect` para lidar com casos de uso específicos.
