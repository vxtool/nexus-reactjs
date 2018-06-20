# Immutable

A Mutabilidade descontrolada ou inesperada dos dados, que pode causar efeitos colaterais e acabar quebrando a sua aplicação ou causando estado inconsistente.

A garantia que temos que a nossa aplicação estará segura em relação aos efeitos colaterais e, por consequência, estado inconsistente está em dois conceitos chaves; Funções Puras e Imutabilidade.

**Immutable** é uma biblioteca criada pelo Facebook para trabalhar com estruturas de dados imutáveis, onde cada interação nas estruturas fornecidas não alteram, mas geram novas estruturas provenientes destas interações.

Quando trabalhamos com dados imutáveis, devemos repensar todo o fluxo de dados da nossa aplicação, pois não podemos e nem devemos mais trocar estados a revelia. Por isso **Immutable** se dá tão bem em arquiteturas como **Flux** e **Redux**, por serem padrões que além isolarem estados em um lugar específico, fornecem uma excelente maneira de manipular estados através de funções puras.

### Estruturas principais - [ver documentação](https://facebook.github.io/immutable-js/docs/#/)

**List**: é uma representação imutável de um array, ou seja, ela possui as principais funções de um array do JavaScript.

```
const scores1 = Immutable.List([2, 4, 6, 8]);
console.log(scores1.size); // 4
const scores2 = scores1.push(10); // [2,4,6,8,10]
const scores3 = scores2.pop().pop(); // [2,4,6]
const scores4 = scores3.shift(); // [4,6]
const scores5 = scores4.concat(10, 12, 14); // [4,6,10,12,14]
```

**Stack**: é uma estrutura de dados que trabalha usando a estrutura FILO (first in last out). Uma das vantagens do Stack é ter uma excelente otimização do algoritmo de inserção e retirada de valores. A interface de manipulação é baseada em inserir e retirar elementos no começo da coleção (unshift e shift ou pop e push como seus respectivos alias).

```
const numbersStack = Immutable.Stack();

// Incluindo 4 elementos na pilha
const numbersStack1 = numbersStack.push(1);
const numbersStack2 = numbersStack1.push(2);
const numbersStack3 = numbersStack2.push(3);
const finalPushNumbersStack = numbersStack3.push(4);

// A manipulação é feita no início da coleção, logo, o ultimo elemento inserido é o primeiro
console.log(finalPushNumbersStack.toJS()); // => [4, 3, 2, 1]

// Removendo 3 elementos da pilha
const numbersStack4 = finalPushNumbersStack.pop();
const numbersStack5 = numbersStack4.pop();
const finalPopNumbersStack = numbersStack5.pop();

// Sobrou o primeiro elemento que foi inserido (na linha 5)
console.log(finalPopNumbersStack.toJS()); // => [1]
```

**Map**: é uma estrutura em árvore não ordenada de coleção baseada em chave-valor, semelhante aos objetos literais em Javascript. Com as mesmas regras de imutabilidade e interface de manipulação que a List tem em relação à Array.

```
const firstMap = Immutable.Map({foo: "bar"});
```

**OrderedMap**: como o nome já explica, é um Map ordenado. Onde a ordem dos valores estará de acordo da ordem em que foram setados.

```
// Múltiplos inserts utilizando set() encadeado
const clientes = Immutable.OrderedMap()
                       .set('John', 25)
                       .set('Mary', 27);
console.log(clientes.first(), clientes.last()); // 25, 27
console.log(JSON.stringify(clientes)); // '{"John": 25, "Mary": 27}'
// Reordenando o map
const clientesMaisVelhos = clientes.sortBy(function(value, key) {
  return -value;
});
console.log(JSON.stringify(clientesMaisVelhos)); // '{"Mary": 27, "John": 25}'
```

**Set**: é um array de elementos únicos, ou seja, não é permitido valores duplicados. Se você incluir um valor repetido, o primeiro valor será mantido e o segundo ignorado.

```
const set1 = Immutable.Set([1, 2, 3, 3]);
const set2 = Immutable.Set([4, 5, 5]);
console.log(set1.count()); // 3
console.log(set1.toArray()); // [1,2,3]
console.log(set2.count()); // 2
console.log(set2.toArray()); // [4,5]
const union = set1.union(set2);
console.log(union.count()); // 5
console.log(union.toArray()); // [1,2,3,4,5]
```

**OrderedSet**: garante que a iteração do conjunto será de acordo com a sequência em que os elementos foram adicionados.

```
const orderedSet1 = Immutable.OrderedSet([1, 2, 2]);
const orderedSet2 = Immutable.OrderedSet([2, 1, 2]);
console.log(orderedSet1.count()); // 2
console.log(orderedSet1.toArray()); // [1,2]
console.log(orderedSet2.count()); // 2
console.log(orderedSet2.toArray()); // [2,1]
const intersected = orderedSet1.intersect(orderedSet2);
console.log(intersected.count()); // 2
console.log(intersected.toArray()); // [1,2]
```

**Record**: nele podemos definir uma estrutura imutável com chaves e valores padrão, retornando uma classe que pode ser utilizada para instanciar as estruturas que definimos.

```
// Criando um protótipo fixo através do Record
const ABRecord = Immutable.Record({
  a: 1, // Setando com valor padrão 1
  b: 2 // Setando com valor padrão 2
});

// Instanciando um novo objeto imutável do tipo ABRecord
const myRecord = new ABRecord({ b: 3 });

console.log(myRecord.get('a')); // => 1
console.log(myRecord.get('b')); // => 3

// Removendo uma propriedade
const myRecordWithoutB = myRecord.remove('b')

// A propriedade volta a ter o valor padrão
console.log(myRecordWithoutB.get('b')); // => 2
```

## Summary
- **Documentation**
  - [Architecture](./ARCHITECTURE.md)
  - ImmutableJS
  - [Patterns](./PATTERNS.md)
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
