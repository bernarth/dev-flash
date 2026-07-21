import { Card, Deck } from '@models';
import { Table } from 'dexie';

export interface DefaultDeckSeed {
  deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>;
  cards: Omit<Card, 'id' | 'deckId'>[];
}

export async function seedDefaultDecks(
  decksTable: Table<Deck, number>,
  cardsTable: Table<Card, number>,
): Promise<void> {
  const now = new Date();

  for (const { deck, cards } of DEFAULT_DECKS) {
    const deckId = await decksTable.add({ ...deck, createdAt: now, updatedAt: now } as Deck);
    await cardsTable.bulkAdd(cards.map((card) => ({ ...card, deckId })) as Card[]);
  }
}

export const DEFAULT_DECKS: DefaultDeckSeed[] = [
  {
    deck: {
      name: 'JavaScript Essentials',
      description: 'Core language concepts every JS interview touches.',
      tags: ['javascript', 'fundamentals'],
      sessionCount: 0,
    },
    cards: [
      {
        question: 'What is the difference between `==` and `===` in JavaScript?',
        answer:
          '`==` compares after type coercion (`"5" == 5` is true). `===` is strict equality: no coercion, types must match (`"5" === 5` is false).\n\nPrefer `===` by default.',
        tags: ['javascript', 'equality'],
        nextSession: 0,
      },
      {
        question: 'What is a closure?',
        answer:
          'A closure is a function that retains access to variables from its lexical scope, even after the outer function has returned.\n\nUsed for data privacy, factories, and memoization.',
        tags: ['javascript', 'functions'],
        nextSession: 0,
      },
      {
        question: 'What is hoisting?',
        answer:
          'JavaScript moves declarations (`var`, `function`) to the top of their scope before execution.\n\n`var` is hoisted initialized as `undefined`; `let`/`const` are hoisted but stay in the temporal dead zone — accessing them before declaration throws.',
        tags: ['javascript', 'fundamentals'],
        nextSession: 0,
      },
      {
        question: 'How does the event loop handle a `setTimeout(fn, 0)`?',
        answer:
          'The callback goes to the macrotask queue and runs only after the call stack is empty and all microtasks (promises) are done — never synchronously, even with a 0ms delay.',
        tags: ['javascript', 'async'],
        nextSession: 0,
      },
      {
        question: 'What are the three states of a Promise?',
        answer:
          'pending — not settled yet\nfulfilled — resolved with a value\nrejected — settled with an error\n\nOnce fulfilled or rejected, a promise is settled and cannot change state.',
        tags: ['javascript', 'async'],
        nextSession: 0,
      },
      {
        question: 'What does `Array.prototype.map` return?',
        answer:
          'A new array with the callback applied to every element. It does not mutate the original array.\n\nUse `forEach` when you do not need the resulting array.',
        tags: ['javascript', 'arrays'],
        nextSession: 0,
      },
    ],
  },
  {
    deck: {
      name: 'C# Interview — Junior Level',
      description: 'Core C# and .NET questions for junior-level interviews.',
      tags: ['csharp', 'dotnet', 'interview'],
      sessionCount: 0,
    },
    cards: [
      {
        question: 'What is the Common Intermediate Language (CLI)?',
        answer:
          'It is a programming language that all .NET-compatible languages like C#, Visual Basic, or F# get compiled to',
        notes:
          'C#, F# and others that are similar are compatible because they are .NET compatible and they get compiled to the CIL. The CIL result happens at compile time not runtime',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the Common Language Runtime (CLR) ?',
        answer: 'It is a runtime environment that manages the execution of the .NET applications',
        notes:
          'The CLR is responsible for many operations such as: JIT compilation, Memory management, exception handling, thread management, type safety (CTS), and more',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the difference between C# and .NET?',
        answer:
          'C# is a programming language. NET is a framework that supports applications written in C#, as well as in other .NET compatible languages',
        notes: 'C# is a plane and .NET is the airport. NET provides the execution environment CLR',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the difference between value types and reference types?',
        answer:
          '1) Value types inherit from System.ValueType while reference types inherit from System.Object. 2) Value types are passed by copy, reference types are passed by reference. 3) On assignment, a variable of value type is copied. For reference types, only a reference is copied. 4) All value types are sealed. 5) Value types are stored on the stack, reference types are stored on the heap (because of that garbage collector only cleans up reference types)',
        notes:
          'Value types examples are: int, double, DateTime, bool. Reference types examples are: Object, String, StringBuilder, List Array.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is boxing and unboxing?',
        answer:
          'Boxing is the process of wrapping a value type into an instance of a type System.Object. Unboxing is the opposite, the process of converting the boxed value back to value type.',
        notes: 'The penalty is on performance because it is expensive',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What are the three main types of errors?',
        answer:
          'There are 3 main types: 1) compilation errors, also known as syntax errors, reported by the compiler. 2) runtime errors, thrown during program execution. 3) logical errors, occurring when the program works without crashing but it does not produce a correct result',
        notes:
          'Both runtime and logical errors can be prevented with unit tests. Exceptions are the mechanism that C# uses to handle runtime errors',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'How are exceptions handled in C#?',
        answer:
          'Exceptions are handled by try-catch-finally blocks. Try contains the code that may throw exceptions, catch defines what should be done if an exception of a given type is thrown, and finally is executed no matter if the exception was thrown or not.',
        notes: 'The base type of all exceptions is System.Exception',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What are the types of access modifiers in C#?',
        answer: 'public, internal, protected, protected internal, private protected and private',
        notes:
          'private protected is only available within the same assembly but works as protected in the same assembly. protected internal is like a regular internal but from a different assembly it works as protected.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What are the default access modifiers in C#?',
        answer:
          'The default access modifier at the namespace level is internal. At the class level, it is private.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the purpose of the "sealed" modifier?',
        answer:
          'The sealed modifier prevents a class from being inherited, or an overridden method from further overriding',
        notes:
          'You cannot make an abstract class sealed because it makes no sense. Marking sealed can increase performance since tells the CLR to avoid looking for further classes',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the purpose of the "params" keyword?',
        answer:
          'The "params" keyword allows us to pass any number of parameters of the same type to a method.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the difference between a class and a struct?',
        answer:
          "1) Structs are value types and classes are reference types. 2) Structs don't support inheritance, although they can implement interfaces. 3) Structs can't have destructors. 4) Unlike classes, structs always have a parameterless constructor, even if we don't define it explicitly.",
        notes:
          "Use structs when the type is logically small, the type is small in memory, the type is immutable, the type is commonly embedded in other objects, we want value type semantics, the struct won't be boxed.",
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What are partial classes?',
        answer:
          'Partial classes are classes that are split over two or more source files. All parts are combined when the application is compiled. it is also possible to declare partial structs, interfaces, and methods.',
        notes:
          'It makes the source class easy to work with in big projects. Static classes can be partial classes',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What does the "new" keyword do?',
        answer:
          'It can be used in three contexts: 1) The new operator, which creates a new instance of a type. 2) The new modifier, which is used to explicitly hide a member method from a base class in the derived class. 3) The new constraint, which specifies that a type argument in a generic class must have a parameterless constructor.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the purpose of the "static" keyword?',
        answer:
          'It can be used in two contexts: 1) static modifier, used to define static classes, as well as static members in classes, structs, and records. 2) using static directive, used to reference static members without needing to explicitly specify their name every time.',
        notes:
          'You cannot have static structs or records. Any modification made to a static member is reflected across all instances of a non-static class',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is a static class?',
        answer:
          'A static class is a class that cannot be instantiated and can only contain static method. It can work as a container for methods that just operate on input parameters and do not have to get or set any internal instance fields.',
        notes:
          'A static class can have a unique constructor called static constructor to initialize static fields.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the purpose of the ternary conditional operator?',
        answer:
          "it's a shorter syntax for the if-else clause. It evaluates a boolean expression and returns the result of one of the two expressions, depending on whether the boolean expression evaluates true or false.",
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the purpose of the null coalescing and null conditional operators?',
        answer:
          "The null coalescing operator returns the left-hand operand if it's value is not null, otherwise, it return the right-hand operand. The null conditional operator is used when we want to access a member of an object only if this object is not null, otherwise it will return/assign null by default instead of throwing NullReferenceException.",
        notes:
          'There is also the null coalescing assignment operator ??=. This operator will assign a value only if the variable is null',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is encapsulation?',
        answer:
          'It means bundling of data with methods that operate on that data all together, and restricting access to internal state.',
        notes: 'Encapsulation is not the same as data hiding',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is LINQ?',
        answer:
          'LINQ is a set of technologies that allow simple and efficient querying over different kinds of data.',
        notes: 'LINQ provider is any class that implements IQueryProvider and IQueryable',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What are extension methods?',
        answer:
          "An extension method is a method defined outside a class, that can be called upon this class' object as a regular member method. Extension methods allow you to add new functionality to a class without modifying it.",
        notes: 'Member methods has priority over an extension method',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is IEnumerable?',
        answer:
          'IEnumerable is an interface that enables iterating over a collection with a foreach loop',
        notes:
          'If we want to prevent the modifying of a collection we can return it as IEnumerable or any other readonly collection type',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the difference between the equality operator (==) and Equals?',
        answer:
          'In the most common scenario == compares objects by reference while Equals is overridden to compare them by content. Both can have custom implementations for any type, so this behavior may vary.',
        notes:
          'The default for reference type is always comparing by reference. == is not supported by value types by it can be overloaded',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the difference between deep copy and shallow copy?',
        answer:
          'When creating a shallow copy, value type members will be copied, but only a reference will be copied for reference types. For deep copying also the reference types will be copied into new objects',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the Garbage Collector?',
        answer:
          "The Garbage Collector is a mechanism that manages the memory used by the application. If an object is no longer used, the Garbage Collector will free the memory it occupies. The Garbage Collector is also responsible for defragmenting the application's memory.",
        notes:
          'Memory leaks happen when memory is not freed even if an object is no longer used. GC does not guarantee protection from them.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What are nullable types?',
        answer:
          "Nullable type is any type that can be assigned a value of null, Nullable<T> struct is a wrapper for a value types allowing assigning null to the variable of this type. For example, we can't assign null to an integer, but we can to a variable of type Nullable<int>",
        notes: 'Nullable struct has a constraint on T that requires T to be a value type',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is a property?',
        answer:
          'A property is a member that provides a mechanism of reading, writing, or computing a value of a private field',
        notes:
          'The benefits of using a property are encapsulation, custom behavior on reading and writing, different access modifier for reading and writing. Also, properties can be calculated basing on other data.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What are generics?',
        answer:
          'Generics classes or methods are parametrized by type - like, for example, a List<T> that can store any type of elements.',
        notes:
          'Type constraints allow limiting the usage of generic type only to the types that meet specific criteria.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the difference between the "const" and the "readonly" modifiers?',
        answer:
          "1) Const fields are assigned at compile time. Readonly fields can be assigned at runtime, in the constructor. 2) Const can only be numbers, booleans, strings or a null reference, readonly values can be anything. 3) Const can't be declared as static, because they are implicitly static. Readonly values can be static.",
        notes:
          'Use const when the value is known at compile time. And readonly when the value is known at runtime.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the difference between the "ref" and the "out" keywords?',
        answer:
          'ref passes the value type to a method by reference, which means any modifications of this value inside this method will be visible outside this method. out is a way of returning extra variables from a method.',
        notes: 'we can use out to return more than one parameter. Consider split first',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the difference between an interface and an abstract class?',
        answer:
          'An interface defines what set of operations will be provided by any class implementing it - it does not provide any implementation on its own. An abstract class is like a general blueprint, for derived classes. It may provide implementations of methods, contain fields, etc.',
        notes:
          'Abstract classes with private constructor has no sense since abstract classes are meant to be inherited',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is polymorphism?',
        answer:
          'One thing many forms. One interface, many implementations. Same method name behaves differently depending on the object.',
        notes:
          "There are two types of polymorphism: Overloading, at compile time, same name different parameters and Overriding, runtime, redefine parent's method",
        tags: [],
        nextSession: 0,
      },
      {
        question: "What's the difference between a virtual method and an abstract method?",
        answer:
          'A virtual method is a method that may be overridden in the derived class. And abstract method must be overridden (unless the derived class is abstract itself).',
        notes:
          'All abstract methods are implicitly virtual. You can use sealed keyword with the derived method to prevent further overriding.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the method overloading?',
        answer:
          'Method overloading is having a class with multiple methods with the same name, that differ only in parameters.',
        notes:
          'We can overload methods with optional parameters but the method with no optional parameter will be used because its signature is closest to what was called.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the difference between method overriding and method hiding?',
        answer:
          'Method overriding happens when the derived class provides its own implementation of a virtual or abstract method from a base class. Method hiding happens when there is a method in the derived class with the same name as the method in the base class, that does not override the base class method.',
        notes:
          "Method hiding can help us to provide for example our own implementation of an external library's method. NOTE: it will be taken if we called it directly if not the virtual will be used.",
        tags: [],
        nextSession: 0,
      },
      {
        question: 'Does C# support multiple inheritance?',
        answer:
          'No, C# does not support multiple inheritance. It does support implementing multiple interfaces, though.',
        notes:
          'The diamond problem is an ambiguity that arises when class D is derived from classes B and C, which both derive from class A. When both classes B and C override a method from class A, then it is ambiguous which would be used when this method is called on an object of class D.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is DRY principle?',
        answer:
          'It stands for "Don\'t Repeat Yourself" and it means that we shouldn\'t have multiple places where pieces of business knowledge are defined. Also, DRY is commonly considered a rule of avoiding code duplication.',
        notes:
          "A piece of business knowledge shouldn't be duplicated so, it is not necessary code duplication but some rules duplicated.",
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the "magic number" antipattern?',
        answer: 'A magic number is an unnamed hard-coded value used directly in the code.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'Why is using the "goto" keyword considered a bad practice?',
        answer:
          'The goto statement transfers the program execution directly to a labeled statement. Using it widely considered a bad practice, as it increases the complexity of the code. The flow of the program is tricky to follow, making reading and debugging the code harder. Also, it can lead to the unintentional creation of infinite loops.',
        notes:
          'We can use it to break out from nested loops when cleaning up logic and reviewing performance optimizations. Not as final implementation',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the "spaghetti code"?',
        answer:
          'it is a pejorative term used to describe code that is messy, tangled, and hard to maintain',
        notes:
          'Lasagna code is a code whose layers are complicated and so are the interactions between them. Making a change in one layer heavily affects other layers. Long code is not an issue. Tangled, messy and complicated code is.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the Singleton design pattern?',
        answer:
          'Singleton is a class that only allows creating a single instance of itself, and exposes simple access to that instance',
        notes:
          'Singleton is considered an antipattern because it is a piece of the global state, and the global state is hard to control. The global state is a hidden dependency.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the Builder design pattern?',
        answer:
          'Builder is a design pattern that allows the step-by-step construction of complex objects',
        notes:
          'We can provide the parameters of the object we want to build incrementally. It improves readability.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the Adapter design pattern?',
        answer:
          'Adapter is a design pattern that allows converting an interface of class to the interface expected by a client.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the Bridge design pattern?',
        answer:
          'The bridge design pattern allows us to split an inheritance hierarchy into a set of hierarchies. It is the implementation of "composition over inheritance" principle',
        notes:
          'The "composition over inheritance" principle states that it is better to introduce new features to a class by extending what this class contains, instead of extending the inheritance hierarchy.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the Factory Method design pattern?',
        answer:
          'Factory Method design pattern allows us to define an interface for creating objects of a general base type, without specifying what subtype exactly will be created.',
        notes:
          'The static factory method allows us to achieve more readable code and it is different from factory method design pattern',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the "S" in the SOLID principles?',
        answer:
          'Single responsibility principle. This principle states that a class should be responsible for only one thing. Sometimes the alternative definition is used: that a class should have no more than one reason to change.',
        notes:
          'SRP gives us smaller, more cohesive and more readable classes, reusable code, easy maintenance of the code',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the "O" in the SOLID principles?',
        answer:
          'Open-Closed principle states that modules, classes, and functions should be open for extension, but closed for modification',
        notes: 'It can provide a safer way to modify code while keeping functionality',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the "L" in the SOLID principles?',
        answer:
          'Liskov Substitution principle states that we should be able to use a derived type in place of a base without knowing it, and it should not lead to any unexpected results.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the "I" in the SOLID principles?',
        answer:
          "Interface Segregation principle states that clients of an interface should not be forced to depend on methods they don't use.",
        tags: [],
        nextSession: 0,
      },
      {
        question: 'What is the "D" in the SOLID principles?',
        answer:
          'Dependency Inversion principle states that high-level modules should not depend on low-level modules. Both should depend on abstractions.',
        notes:
          'The LSP tell us how to implement the interface of a base type. The ISP tells us if we should implement this interface at all.',
        tags: [],
        nextSession: 0,
      },
      {
        question: 'When you would use a struct?',
        answer:
          'When the objects of this type will be commonly short-lived. And when the object will be immutable.',
        notes:
          'Structs work best for small, immutable types that are created and discarded frequently, such as coordinates or dates.',
        tags: [],
        nextSession: 0,
      },
    ],
  },
  {
    deck: {
      name: 'C# Interview — Mid Level',
      description:
        'Intermediate C# and .NET interview topics: generics, delegates, GC, reflection, patterns, and more.',
      tags: ['csharp', 'dotnet', 'interview'],
      sessionCount: 0,
    },
    cards: [
      {
        question: 'What is the difference between Tuples and ValueTuples?',
        answer:
          'Tuple (System.Tuple) is a reference type with immutable, unnamed properties (Item1, Item2, etc.), while ValueTuple (System.ValueTuple) is a mutable value type that supports named elements via language syntax.',
        notes:
          'ValueTuples have been generally preferred since C# 7 for lightweight, temporary data grouping.',
        tags: ['csharp', 'tuples', 'value-types'],
        nextSession: 0,
      },
      {
        question: 'What is the difference between "is" and "as" keywords?',
        answer:
          '"is" checks whether an object is compatible with a given type and returns a bool (optionally combined with a pattern-matching cast); "as" attempts a cast and returns null if it fails instead of throwing.',
        notes:
          '"as" only works with reference types and nullable value types; a regular cast throws InvalidCastException on failure.',
        tags: ['csharp', 'casting', 'type-checking'],
        nextSession: 0,
      },
      {
        question: 'What is the use of the "using" keyword?',
        answer:
          'The "using" keyword has two uses: a using directive that imports a namespace, and a using statement/declaration that ensures an IDisposable object is disposed once it goes out of scope.',
        notes:
          'C# 8 added "using" declarations that dispose at the end of the enclosing scope, reducing nesting versus the older using(){} block.',
        tags: ['csharp', 'resource-management', 'idisposable'],
        nextSession: 0,
      },
      {
        question: 'What is the purpose of the "dynamic" keyword?',
        answer:
          'The "dynamic" keyword tells the compiler to skip static type checking for that variable; type resolution happens at runtime instead.',
        notes:
          'Useful for interop scenarios like COM objects, but it sacrifices compile-time safety and has a performance cost.',
        tags: ['csharp', 'dynamic-typing', 'interop'],
        nextSession: 0,
      },
      {
        question: 'What are expression-bodied members?',
        answer:
          'Expression-bodied members let you define a method, property, or other member using a single expression with the "=>" syntax instead of a full method body.',
        notes:
          'Handy for reducing boilerplate on simple one-line members such as getters or short calculations.',
        tags: ['csharp', 'syntax', 'members'],
        nextSession: 0,
      },
      {
        question: 'What are Funcs and lambda expressions?',
        answer:
          'Func is a built-in generic delegate type representing a function with a given signature that returns a value; a lambda expression is a concise, inline way to define an anonymous function, often assigned to a Func or Action.',
        notes: 'Action is the void-returning counterpart to Func.',
        tags: ['csharp', 'delegates', 'functional'],
        nextSession: 0,
      },
      {
        question: 'What are delegates?',
        answer:
          'A delegate is a type-safe reference to one or more methods with a matching signature, letting methods be passed as parameters, stored in variables, or invoked indirectly.',
        notes:
          'Multicast delegates hold references to more than one method and invoke them all in sequence when called.',
        tags: ['csharp', 'delegates', 'fundamentals'],
        nextSession: 0,
      },
      {
        question: 'How does the Garbage Collector decide which objects can be removed from memory?',
        answer:
          "The Garbage Collector treats an object as removable once no reachable reference chain exists from the application's roots to that object; it traces reachability rather than counting references.",
        notes:
          ".NET uses a tracing (mark-and-sweep) GC, unlike reference-counting systems such as Swift's ARC.",
        tags: ['csharp', 'garbage-collection', 'memory'],
        nextSession: 0,
      },
      {
        question: 'What are generations?',
        answer:
          'The GC organizes the managed heap into three generations (0, 1, 2) based on object age; short-lived objects start in generation 0 and are collected most often, while long-lived objects get promoted to higher generations that are collected less frequently.',
        notes:
          'The Large Object Heap holds objects over roughly 85,000 bytes and is logically treated as part of generation 2.',
        tags: ['csharp', 'garbage-collection', 'memory'],
        nextSession: 0,
      },
      {
        question: 'What is the difference between Dispose and Finalize methods?',
        answer:
          'Dispose is called explicitly (often via "using") to deterministically release unmanaged resources, while Finalize is invoked by the GC nondeterministically as a safety net before an object\'s memory is reclaimed.',
        notes:
          'Implementing IDisposable and calling GC.SuppressFinalize avoids the extra overhead of an unnecessary finalizer call.',
        tags: ['csharp', 'idisposable', 'garbage-collection'],
        nextSession: 0,
      },
      {
        question: 'What are default implementations in interfaces?',
        answer:
          'Since C# 8, interfaces can provide a default method body, letting new members be added to an interface without breaking classes that already implement it.',
        notes:
          'Mainly intended for evolving public library interfaces over time, not as a general substitute for abstract classes.',
        tags: ['csharp', 'interfaces', 'csharp8'],
        nextSession: 0,
      },
      {
        question: 'What is deconstruction?',
        answer:
          'Deconstruction lets you split an object such as a tuple, ValueTuple, or record into individual variables in a single statement using a Deconstruct method.',
        notes:
          "You can add a Deconstruct method to your own types, or supply one as an extension method for types you don't own.",
        tags: ['csharp', 'tuples', 'records'],
        nextSession: 0,
      },
      {
        question: 'Why is "catch(Exception)" almost always a bad idea (and when it is not?)?',
        answer:
          "Catching the base Exception type hides the specific error type and makes it easy to accidentally swallow bugs you didn't anticipate; it's generally acceptable only in a top-level global handler or when immediately rethrowing.",
        notes: 'Prefer catching the specific exception types you actually know how to handle.',
        tags: ['csharp', 'exceptions', 'best-practices'],
        nextSession: 0,
      },
      {
        question: 'What is the difference between "throw" and "throw ex"?',
        answer:
          '"throw" rethrows the current exception while preserving its original stack trace; "throw ex" resets the stack trace to the current catch block, hiding where the exception actually originated.',
        notes: 'Always prefer a bare "throw" when rethrowing inside a catch block.',
        tags: ['csharp', 'exceptions', 'debugging'],
        nextSession: 0,
      },
      {
        question: 'What is the difference between typeof and GetType?',
        answer:
          'typeof is a compile-time operator that takes a type name and returns its Type object; GetType is an instance method (inherited from object) that returns the runtime type of an object.',
        notes:
          'typeof needs the type name known at compile time, while GetType reflects the actual runtime type of a polymorphic instance.',
        tags: ['csharp', 'reflection', 'types'],
        nextSession: 0,
      },
      {
        question: 'What is reflection?',
        answer:
          'Reflection is a mechanism that lets code inspect and interact with type metadata at runtime, such as listing members, reading attributes, or invoking a method by name.',
        notes:
          'Powerful but has a real performance cost and can make code harder to understand and maintain.',
        tags: ['csharp', 'reflection', 'metadata'],
        nextSession: 0,
      },
      {
        question: 'What are attributes?',
        answer:
          'Attributes are declarative metadata tags attached to types or members that can be read at runtime via reflection, such as the built-in [Serializable] or custom attributes deriving from Attribute.',
        notes:
          'Commonly used for serialization hints, validation rules, or framework/tooling configuration.',
        tags: ['csharp', 'attributes', 'metadata'],
        nextSession: 0,
      },
      {
        question: 'What is serialization?',
        answer:
          "Serialization is the process of converting an object's state into a storable or transmittable format such as JSON, XML, or binary; deserialization reverses the process.",
        notes:
          "Common uses include sending data over a network, persisting it to disk, or caching a snapshot of an object's state.",
        tags: ['csharp', 'serialization', 'data'],
        nextSession: 0,
      },
      {
        question: 'What is pattern matching?',
        answer:
          'Pattern matching lets you test whether an expression has a particular shape or type and, if so, extract data from it in the same statement, e.g. "if (obj is string text)".',
        notes:
          'C# has significantly expanded pattern matching (switch expressions, property patterns, and more) since C# 7.',
        tags: ['csharp', 'pattern-matching', 'syntax'],
        nextSession: 0,
      },
      {
        question: 'How does the binary number system work?',
        answer:
          'The binary number system represents values using only 0s and 1s, where each bit position corresponds to a power of two; computers use it natively because a bit maps directly onto two physical states.',
        notes:
          "Arithmetic overflow happens when a result needs more bits than a numeric type's fixed size allows.",
        tags: ['csharp', 'fundamentals', 'numbers'],
        nextSession: 0,
      },
      {
        question: 'What is the purpose of the "checked" keyword?',
        answer:
          'The "checked" keyword marks a block or expression so that arithmetic overflow throws an OverflowException instead of silently wrapping around.',
        notes:
          'The default in most build configurations is unchecked; use checked for money or other safety-critical calculations.',
        tags: ['csharp', 'arithmetic', 'overflow'],
        nextSession: 0,
      },
      {
        question: 'What is the difference between double and decimal?',
        answer:
          'double is a 64-bit binary floating-point type with a wide range but rounding imprecision; decimal is a 128-bit type optimized for base-10 arithmetic, giving exact precision for financial values at the cost of range and speed.',
        notes: 'Always use decimal, not double or float, to represent money.',
        tags: ['csharp', 'numeric-types', 'precision'],
        nextSession: 0,
      },
      {
        question: 'What is an Array?',
        answer:
          "An Array is C#'s most basic collection type, storing a fixed number of elements of the same type in contiguous memory.",
        notes:
          "Arrays can't be resized after creation; use List<T> when the collection needs to grow or shrink.",
        tags: ['csharp', 'collections', 'arrays'],
        nextSession: 0,
      },
      {
        question: 'What is a List?',
        answer:
          'List<T> is a generic, strongly-typed, dynamically-resizable collection built on top of an array that automatically grows its backing array as elements are added.',
        notes:
          'Setting an expected Capacity upfront avoids the costly array-copy operations that happen as the list grows.',
        tags: ['csharp', 'collections', 'generics'],
        nextSession: 0,
      },
      {
        question: 'What is an ArrayList?',
        answer:
          'ArrayList is a non-generic, dynamically-resizable collection that stores elements as System.Object, allowing mixed types but requiring boxing/unboxing and casting.',
        notes:
          'Considered obsolete in modern C#; List<T> should be used instead in virtually all cases.',
        tags: ['csharp', 'collections', 'legacy'],
        nextSession: 0,
      },
      {
        question: 'What is the purpose of the GetHashCode method?',
        answer:
          'GetHashCode returns an integer "fingerprint" for an object that hash-based collections (like Dictionary and HashSet) use to bucket and quickly locate items.',
        notes:
          'If you override Equals, you must also override GetHashCode consistently, since equal objects must produce equal hash codes.',
        tags: ['csharp', 'hashing', 'collections'],
        nextSession: 0,
      },
      {
        question: 'What is a Dictionary?',
        answer:
          'Dictionary<TKey, TValue> is a hash-table-based collection that stores key-value pairs and provides near O(1) average-case lookup, insertion, and deletion by key.',
        notes: 'Even when two keys share a hash code, Equals is used to correctly tell them apart.',
        tags: ['csharp', 'collections', 'dictionary'],
        nextSession: 0,
      },
      {
        question: 'What are indexers?',
        answer:
          'Indexers let instances of a class be accessed with array-like bracket syntax (e.g. obj[key]) by defining a special "this[...]" property.',
        notes:
          'A class can define multiple overloaded indexers as long as their parameter lists differ, similar to method overloading.',
        tags: ['csharp', 'syntax', 'indexers'],
        nextSession: 0,
      },
      {
        question: 'What is caching?',
        answer:
          'Caching is the practice of storing the results of expensive operations (data fetches or calculations) in a fast-access store keyed by some identifier, so repeated requests can be served without redoing the work.',
        notes:
          'Caches need an eviction or expiration strategy to avoid unbounded memory growth and serving stale data.',
        tags: ['csharp', 'performance', 'caching'],
        nextSession: 0,
      },
      {
        question: "What are immutable types and what's their purpose?",
        answer:
          'An immutable type\'s state can\'t change after construction; any "modification" instead produces a new object, which simplifies reasoning, testing, and multithreaded code.',
        notes:
          'A "non-destructive mutation" (e.g. a record\'s "with" expression) creates a new object rather than altering the original.',
        tags: ['csharp', 'immutability', 'design'],
        nextSession: 0,
      },
      {
        question: 'What are records and record structs?',
        answer:
          'Records (C# 9) and record structs (C# 10) are reference and value types, respectively, that come with built-in value-based equality, a generated ToString, and support for non-destructive mutation via the "with" keyword.',
        notes:
          '"Positional records" auto-generate a constructor, properties, and a Deconstruct method from a concise one-line declaration.',
        tags: ['csharp', 'records', 'csharp9'],
        nextSession: 0,
      },
      {
        question: 'Why does string behave like a value type even though it is a reference type?',
        answer:
          "string is technically a reference type, but because it's immutable, any operation that appears to modify it actually creates a new string object, giving it value-type-like behavior in practice.",
        notes:
          'String interning lets equal string literals share the same underlying object to save memory, which is only safe because strings are immutable.',
        tags: ['csharp', 'strings', 'reference-types'],
        nextSession: 0,
      },
      {
        question: 'What is the difference between string and StringBuilder?',
        answer:
          'string is immutable, so repeated concatenation creates a new object each time; StringBuilder is mutable and designed for efficiently building up large strings incrementally, such as inside a loop.',
        notes:
          "For a single concatenation, a plain string is fine; StringBuilder pays off once you're doing many repeated appends.",
        tags: ['csharp', 'strings', 'performance'],
        nextSession: 0,
      },
      {
        question: 'What is operator overloading?',
        answer:
          'Operator overloading lets a type define custom behavior for operators (+, -, ==, etc.) using the "operator" keyword, including implicit and explicit conversion operators.',
        notes:
          'Explicit conversions require an explicit cast in code; implicit conversions happen automatically.',
        tags: ['csharp', 'operators', 'syntax'],
        nextSession: 0,
      },
      {
        question: 'What are anonymous types?',
        answer:
          'Anonymous types are compiler-generated, unnamed reference types created with "new { ... }" that hold a fixed set of read-only properties, commonly used for temporary projections in LINQ queries.',
        notes:
          'Two anonymous objects with identical property values and order are considered equal via Equals despite being different instances.',
        tags: ['csharp', 'linq', 'types'],
        nextSession: 0,
      },
      {
        question: 'What is cohesion?',
        answer:
          'Cohesion describes how closely related and focused the responsibilities of a single module or class are; high cohesion means related data and behavior are grouped together.',
        notes:
          "High cohesion often correlates with, but isn't identical to, following the Single Responsibility Principle.",
        tags: ['csharp', 'design-principles', 'architecture'],
        nextSession: 0,
      },
      {
        question: 'What is coupling?',
        answer:
          'Coupling describes how much one module or class depends on the internal details of another; low (loose) coupling makes a codebase easier to change and test.',
        notes:
          'The Dependency Inversion Principle — depend on abstractions, not concretions — is a key technique for reducing coupling.',
        tags: ['csharp', 'design-principles', 'solid'],
        nextSession: 0,
      },
      {
        question: 'What is the Strategy design pattern?',
        answer:
          'The Strategy pattern defines a family of interchangeable algorithms behind a common interface, letting the concrete algorithm be selected or swapped at runtime.',
        notes:
          'It decouples the code that varies (the algorithm) from the code that stays the same (the code that uses it).',
        tags: ['csharp', 'design-patterns', 'strategy'],
        nextSession: 0,
      },
      {
        question: 'What is the Dependency Injection design pattern?',
        answer:
          'Dependency Injection is a technique where a class receives (is "injected with") the objects it depends on from the outside, typically via its constructor, rather than creating them itself.',
        notes: 'DI is what makes it practical to swap in mock implementations for unit testing.',
        tags: ['csharp', 'dependency-injection', 'design-patterns'],
        nextSession: 0,
      },
      {
        question: 'What is the Template Method design pattern?',
        answer:
          'The Template Method pattern defines the overall skeleton of an algorithm in a base class while letting subclasses override specific steps of that algorithm.',
        notes:
          'Unlike Strategy, which uses composition and runtime selection, Template Method uses inheritance and is fixed at compile time.',
        tags: ['csharp', 'design-patterns', 'template-method'],
        nextSession: 0,
      },
      {
        question: 'What is the Decorator design pattern?',
        answer:
          'The Decorator pattern lets you add new behavior to an object dynamically by wrapping it in one or more decorator objects that implement the same interface.',
        notes:
          "It supports the Open-Closed Principle, since existing classes don't need to be modified to add functionality.",
        tags: ['csharp', 'design-patterns', 'decorator'],
        nextSession: 0,
      },
      {
        question: 'What is the Observer design pattern?',
        answer:
          'The Observer pattern lets one object (the Observable or Subject) automatically notify a set of subscribed objects (Observers) whenever its state changes.',
        notes: 'In .NET, events are the built-in language mechanism for implementing this pattern.',
        tags: ['csharp', 'design-patterns', 'observer'],
        nextSession: 0,
      },
      {
        question: 'What are events?',
        answer:
          "Events are .NET's language-level implementation of the Observer pattern, built on delegates, letting a class publish notifications that other code can subscribe to and react on.",
        notes:
          'Unlike a public delegate field, an event can only be raised from within the declaring class; forgetting to unsubscribe can also leak memory by keeping the subscriber alive.',
        tags: ['csharp', 'events', 'delegates'],
        nextSession: 0,
      },
      {
        question: 'What is Inversion of Control?',
        answer:
          'Inversion of Control is a design principle where the flow of control is handed over to a framework or container, which calls into your code at defined extension points, rather than your code driving everything itself.',
        notes:
          "Dependency Injection is one common technique for implementing IoC, and it's what distinguishes a framework from a plain library.",
        tags: ['csharp', 'inversion-of-control', 'architecture'],
        nextSession: 0,
      },
      {
        question: 'What is the "composition over inheritance" principle?',
        answer:
          '"Composition over inheritance" favors building types by combining smaller objects (composition) rather than through class hierarchies, since composition tends to be more flexible and avoids fragile base-class problems.',
        notes:
          'Relying purely on composition can make genuine "is-a" relationships awkward, sometimes leading to lots of thin forwarding methods.',
        tags: ['csharp', 'design-principles', 'composition'],
        nextSession: 0,
      },
      {
        question: 'What are mocks?',
        answer:
          'Mocks are fake, controllable stand-ins for real dependencies used in unit tests, letting you verify interactions and control returned values without invoking real implementations.',
        notes:
          'Mocking generally requires Dependency Injection so real dependencies can be swapped for mocks in tests.',
        tags: ['csharp', 'testing', 'mocking'],
        nextSession: 0,
      },
      {
        question: 'What are NuGet packages?',
        answer:
          'NuGet packages are the standard way to distribute and consume reusable, precompiled .NET code and libraries, installed and restored via the NuGet package manager or "dotnet restore".',
        notes:
          "Before writing something generic yourself, it's usually worth checking whether a NuGet package already solves it.",
        tags: ['csharp', 'nuget', 'ecosystem'],
        nextSession: 0,
      },
      {
        question: 'What is the difference between Debug and Release builds?',
        answer:
          'Debug builds skip compiler optimizations and keep full symbol information, making step-through debugging accurate; Release builds apply optimizations for smaller, faster output at the cost of debuggability.',
        notes:
          'You can gate code to run only in one configuration using #if DEBUG / #if RELEASE preprocessor directives.',
        tags: ['csharp', 'build-configuration', 'debugging'],
        nextSession: 0,
      },
      {
        question: 'What are preprocessor directives?',
        answer:
          'Preprocessor directives (like #if, #define, #region, #pragma) are instructions processed before compilation that can conditionally include code, define symbols, or suppress specific compiler warnings.',
        notes:
          'Example: #pragma warning disable CA2200 turns off a specific compiler warning by its code.',
        tags: ['csharp', 'preprocessor', 'compiler'],
        nextSession: 0,
      },
      {
        question: 'What are nullable reference types?',
        answer:
          'Nullable reference types (C# 8) let the compiler track and warn about reference variables that might be null, extending to reference types the kind of nullability annotations value types already had with Nullable<T>.',
        notes:
          "It's a compile-time analysis feature based on warnings, not a runtime enforcement mechanism — null checks can still be bypassed.",
        tags: ['csharp', 'nullable-reference-types', 'csharp8'],
        nextSession: 0,
      },
    ],
  },
];
