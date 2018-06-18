# Reselect

Em uma boa arquitetura Redux, você é encorajado a manter seu estado de armazenamento mínimo e derivar dados do estado conforme necessário . Como parte desse processo, recomendamos que você use "funções de seleção" em seu aplicativo e use a biblioteca Reselect para ajudar a criar esses seletores. Aqui está uma análise mais aprofundada do motivo pelo qual essa é uma boa ideia e como usar corretamente o Reselect.

Noções básicas de seletores
Uma "função de seletor" é simplesmente qualquer função que aceita o estado de armazenamento do Redux (ou parte do estado) como um argumento, e retorna dados que são baseados nesse estado. Os seletores não precisam ser escritos usando uma biblioteca especial, e não importa se você os escreve como funções de seta ou a palavra-chave da function . Por exemplo, estes são todos seletores:

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

Você pode chamar suas funções de seletor como quiser, mas é comum prefixá-las com select ou get , ou terminar o nome com Selector , como selectFoo , getFoo ou fooSelector (veja esta enquete no Twitter sobre seletores de nomenclatura para discussão).

O primeiro motivo para usar funções de seletor é para encapsulamento e reusabilidade. Digamos que uma das suas funções mapState parece com isso:

```
const mapState = (state) => {
    const data = state.some.deeply.nested.field;

    return {data};
}
```

Essa é uma afirmação totalmente legal. Mas imagine que você tenha vários componentes que precisam acessar esse campo. O que acontece se você precisar fazer uma mudança para onde esse pedaço de estado vive? Agora você teria que alterar cada função mapState que referencia esse valor. Assim, da mesma forma que recomendamos o uso de criadores de ações para encapsular detalhes da criação de ações , recomendamos o uso de seletores para encapsular o conhecimento de onde um dado pedaço de estado mora. Idealmente, apenas as funções e os seletores do redutor devem conhecer a estrutura exata do estado, portanto, se você alterar o local de algum estado, será necessário atualizar apenas essas duas partes da lógica .

Uma descrição comum de seletores é que eles são como "consultas em seu estado". Você não se preocupa exatamente com a forma como a consulta surgiu com os dados de que precisava, apenas solicitou os dados e obteve um resultado.

## O uso do Reselect e a memorização

 O próximo motivo para usar seletores é melhorar o desempenho. A otimização do desempenho geralmente envolve trabalhar mais rápido ou encontrar maneiras de fazer menos trabalho. Para um aplicativo React-Redux, os seletores podem nos ajudar a fazer menos trabalho de duas maneiras diferentes.

Vamos imaginar que temos um componente que requer uma etapa muito cara de filtragem / classificação / transformação para os dados de que precisa. Para começar, sua função mapState parece com isto:

```
const mapState = (state) => {
    const {someData} = state;

    const filteredData = expensiveFiltering(someData);
    const sortedData = expensiveSorting(filteredData);
    const transformedData = expensiveTransformation(sortedData);

    return {data : transformedData};
}
``` 

No momento, essa lógica cara será executada novamente para cada ação enviada que resulte em uma atualização de estado, mesmo se o estado da loja que foi alterado estiver em uma parte da árvore de estado com a qual esse componente não se importa.

O que realmente queremos é apenas executar novamente essas etapas caras se state.someData realmente tiver mudado. É aí que entra a ideia de "memoização".

Memoização é uma forma de armazenamento em cache. Envolve o rastreamento de entradas para uma função e o armazenamento das entradas e dos resultados para referência posterior. Se uma função for chamada com as mesmas entradas de antes, a função pode ignorar a execução do trabalho real e retornar o mesmo resultado gerado na última vez que recebeu esses valores de entrada.

A biblioteca Reselect fornece uma maneira de criar funções de seletor de memo. A função createSelector do createSelector aceita uma ou mais funções de "seletor de entrada" e uma função de "seletor de saída" e retorna uma nova função de seletor para você usar.

createSelector pode aceitar vários seletores de entrada, que podem ser fornecidos como argumentos separados ou como uma matriz. Os resultados de todos os seletores de entrada são fornecidos como argumentos separados para o seletor de saída:

```
const selectA = state => state.a;
const selectB = state => state.b;
const selectC = state => state.c;

const selectABC = createSelector(
    [selectA, selectB, selectC],
    (a, b, c) => {
        // do something with a, b, and c, and return a result
        return a + b + c;
    }
);

// Call the selector function and get a result
const abc = selectABC(state);

// could also be written as separate arguments, and works exactly the same
const selectABC2 = createSelector(
    selectA, selectB, selectC,
    (a, b, c) => {
        // do something with a, b, and c, and return a result
        return a + b + c;
    }
);
```

Quando você chamar o seletor, o Reselect executará seus seletores de entrada com todos os argumentos que você forneceu e examinará os valores retornados. Se algum resultado for diferente de antes, ele executará novamente o seletor de saída e passará esses resultados como argumentos. Se todos os resultados forem os mesmos da última vez, ele ignorará a execução do seletor de saída e retornará o resultado final armazenado em cache de antes.

No uso típico de Reselecionar, você escreve seus "seletores de entrada" de nível superior como funções simples e usa createSelector para criar seletores de createSelector que pesquisam valores aninhados:

```
const state = {
    a : {
        first : 5
    },
    b : 10
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
        console.log("Output selector running");
        return a1 + b;
    }
);

const result = selectResult(state);
// Log: "Output selector running"
console.log(result);
// 15

const secondResult = selectResult(state);
// No log output
console.log(secondResult);
// 15
```

Note que na segunda vez que chamamos selectResult , o "seletor de saída" não foi executado. Como os resultados de selectA1 e selectB foram os mesmos da primeira chamada, selectResult conseguiu retornar o resultado memoizado da primeira chamada.

É importante observar que, por padrão, o Reselect apenas memoriza o conjunto mais recente de parâmetros. Isso significa que se você chamar um seletor repetidamente com entradas diferentes, ele ainda retornará um resultado, mas terá que continuar executando novamente o seletor de saída para produzir o resultado:

```
const a = someSelector(state, 1); // first call, not memoized
const b = someSelector(state, 1); // same inputs, memoized
const c = someSelector(state, 2); // different inputs, not memoized
const d = someSelector(state, 1); // different inputs from last time, not memoized
```

Além disso, você pode passar vários argumentos para um seletor. A seleção novamente chamará todos os seletores de entrada com essas entradas exatas:

```
const selectItems = state => state.items;  
const selectItemId = (state, itemId) => itemId;  
  
const selectItemById = createSelector(  
    [selectItems, selectItemId],  
    (items, itemId) => items[itemId]  
);  

const item = selectItemById(state, 42);

/*
Internally, Reselect does something like this:

const firstArg = selectItems(state, 42);  
const secondArg = selectItemId(state, 42);  
  
const result = outputSelector(firstArg, secondArg);  
return result;  
*/

```

Por isso, é importante que todos os "seletores de entrada" fornecidos por você aceitem os mesmos tipos de parâmetros. Caso contrário, os seletores irão quebrar.

```
const selectItems = state => state.items;  

// expects a number as the second argument
const selectItemId = (state, itemId) => itemId;  

// expects an object as the second argument
const selectOtherField (state, someObject) => someObject.someField;  
  
const selectItemById = createSelector(  
    [selectItems, selectItemId, selectOtherField],  
    (items, itemId, someField) => items[itemId]  
);  
```

Neste exemplo, selectItemId espera que seu segundo argumento seja algum valor simples, enquanto selectOtherField espera que o segundo argumento seja um objeto. Se você chamar selectItemById(state, 42) , selectOtherField será interrompido porque está tentando acessar 42.someField .

Você pode (e provavelmente deve ) usar funções de seletor em qualquer lugar em seu aplicativo que acesse a árvore de estados . Isso inclui mapState funções mapState , thunks, sagas, observables, middleware e até redutores.

As funções de seleção são frequentemente colocadas junto aos redutores, pois ambos conhecem a forma do estado. No entanto, cabe a você colocar as funções do seletor e organizá-las.


## Otimizando o desempenho com Reselect

Há um problema de desempenho específico que pode ocorrer quando você usa seletores de memo com um componente que pode ser processado várias vezes.

Digamos que tenhamos essa definição de componente:

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

const mapState = (state) => {
    const transformedData = selectFilteredSortedTransformedData (state);

    return {data : transformedData};
}
```

Essa é uma grande melhoria no desempenho, por dois motivos.

Primeiro, agora a transformação cara só ocorre se state.someData for diferente. Isso significa que, se despacharmos uma ação que atualize state.somethingElse , não faremos nenhum trabalho real nessa função mapState .

Segundo, a função de connect React-Redux determina se o seu componente real deve ser renderizado novamente com base no conteúdo dos objetos que você retorna do mapState , usando comparações de "igualdade superficial". Se algum dos campos retornados for === diferente da última vez, a connect irá renderizar novamente seu componente. Isso significa que você deve evitar criar novas referências em uma função mapState , a menos que seja necessário. As funções de matriz como concat() , map() e filter() sempre retornam novas referências de matriz, assim como o operador de propagação de objetos. Usando seletores de memorandos, podemos retornar as mesmas referências se os dados não forem alterados e, assim, ignorar a nova renderização do componente real.

## Otimizações avançadas com o React-Redux

Há um problema de desempenho específico que pode ocorrer quando você usa seletores de memo com um componente que pode ser processado várias vezes.

Digamos que tenhamos essa definição de componente:

```
const mapState = (state, ownProps) => {
    const item = selectItemForThisComponent(state, ownProps.itemId);

    return {item};
}

const SomeComponent = (props) => <div>Name: {props.item.name}</div>;

export default connect(mapState)(SomeComponent);

// later
<SomeComponent itemId={1} />
<SomeComponent itemId={2} />
```

Neste exemplo, SomeComponent está passando ownProps.itemId como um parâmetro para o seletor. Quando renderizamos várias instâncias de <SomeComponent> , cada uma dessas instâncias está compartilhando a mesma instância da função selectItemForThisComponent . Isso significa que quando uma ação é despachada, cada instância separada de <SomeComponent> chamará a função separadamente, como:

```
// first instance
selectItemForThisComponent(state, 1);
// second instance
selectItemForThisComponent(state, 2);
```

Como descrito anteriormente, selecione novamente somente memoizes nas entradas mais recentes (ou seja, ele tem um tamanho de cache de 1). Isso significa que selectItemForThisComponent nunca irá memoize corretamente, porque ele nunca está sendo chamado com as mesmas entradas consecutivas.

Esse código ainda será executado e funcionará, mas não é totalmente otimizado. Para obter o melhor desempenho absoluto, precisamos de uma cópia separada de selectItemForThisComponent para cada instância de <SomeComponent> .

A função de connect React-Redux suporta uma sintaxe especial de "função de fábrica" ​​para as funções mapState e mapDispatch , que podem ser usadas para criar instâncias exclusivas de funções de seletor para cada instância do componente.

Se a primeira chamada para uma função mapDispatch ou mapDispatch retornar uma função em vez de um objeto, o connect usará essa função retornada como a função real mapState ou mapDispatch . Isso permite criar seletores específicos de instâncias de componentes dentro do fechamento:

```
const makeUniqueSelectorInstance = () => createSelector(
    [selectItems, selectItemId],
    (items, itemId) => items[itemId]
);    


const makeMapState = (state) => {
    const selectItemForThisComponent = makeUniqueSelectorInstance();

    return function realMapState(state, ownProps) {
        const item = selectItemForThisComponent(state, ownProps.itemId);

        return {item};
    }
};

export default connect(makeMapState)(SomeComponent);
```

O componente 1 e o componente 2 obterão suas próprias cópias exclusivas de selectItemForThisComponent , e cada cópia será chamada com entradas consistentes e repetíveis, permitindo uma memorização adequada.


# Pensamentos finais

Como outros padrões comuns de uso do Redux , você não é obrigado a usar funções de seletor em um aplicativo Redux . Se você quiser escrever pesquisas de estado profundamente aninhadas diretamente em suas funções ou thunks do mapState , você pode. Da mesma forma, você não precisa usar a biblioteca Reselect para criar seletores - você pode simplesmente escrever funções simples, se quiser.

Dito isto, você é encorajado a usar funções de seletor e usar a biblioteca Reselect para seletores de memo . Há também muitas outras opções para criar seletores, incluindo o uso de bibliotecas de utilitários de programação funcional, como lodash / fp e Ramda, e outras alternativas para selecionar novamente. Há também bibliotecas de utilitários que criam o Reselect para lidar com casos de uso específicos .
