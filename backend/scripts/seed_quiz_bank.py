"""Seed a hand-curated quiz question bank (Java/Python/JS/TS/Vue/React, fresher->middle).

Run from backend/: python -m scripts.seed_quiz_bank
Safe to re-run: skips any question that already exists (matched by exact text) in its topic.
"""

from app.db.database import SessionLocal
from app.models.study import Card, Category, Topic
from app.services.slugify import slugify

QUIZ_DATA: dict[str, dict[str, list[dict]]] = {
    "Java": {
        "fresher": [
            {
                "question": "What is the default value of a boolean instance variable in Java?",
                "choices": ["true", "false", "null", "0"],
                "correct_index": 1,
                "explanation": "Uninitialized boolean fields default to false; only reference types default to null.",
            },
            {
                "question": "Which keyword is used for a class to inherit from another class in Java?",
                "choices": ["implements", "extends", "inherits", "super"],
                "correct_index": 1,
                "explanation": "`extends` is used for class inheritance; `implements` is used for interfaces.",
            },
            {
                "question": "What does JVM stand for?",
                "choices": ["Java Virtual Machine", "Java Verified Method", "Java Variable Manager", "Java Visual Machine"],
                "correct_index": 0,
                "explanation": "The JVM executes compiled Java bytecode and provides platform independence.",
            },
            {
                "question": "Which of these is NOT a primitive type in Java?",
                "choices": ["int", "boolean", "String", "char"],
                "correct_index": 2,
                "explanation": "String is a reference type (a class), not one of Java's 8 primitive types.",
            },
            {
                "question": "What does `public static void main(String[] args)` represent?",
                "choices": ["A constructor", "The entry point of a Java program", "An interface", "A class"],
                "correct_index": 1,
                "explanation": "The JVM looks for this exact method signature to start program execution.",
            },
        ],
        "junior": [
            {
                "question": "When used on two String objects, what does `==` compare?",
                "choices": ["Their content", "Their memory reference", "Their hash code only", "It's a compile error"],
                "correct_index": 1,
                "explanation": "`==` compares object references for non-primitives; use `.equals()` to compare String content.",
            },
            {
                "question": "Which collection does NOT allow duplicate elements?",
                "choices": ["ArrayList", "LinkedList", "HashSet", "Vector"],
                "correct_index": 2,
                "explanation": "Set implementations like HashSet enforce uniqueness of elements.",
            },
            {
                "question": "What is the purpose of a `finally` block?",
                "choices": [
                    "Runs only if an exception occurs",
                    "Runs only if no exception occurs",
                    "Always runs regardless of whether an exception occurred",
                    "Replaces the catch block",
                ],
                "correct_index": 2,
                "explanation": "`finally` is used for cleanup code (closing resources, etc.) that must run either way.",
            },
            {
                "question": "Which access modifier restricts a member to only its own class?",
                "choices": ["public", "protected", "private", "default (package-private)"],
                "correct_index": 2,
                "explanation": "`private` members are accessible only within the declaring class.",
            },
            {
                "question": "What is autoboxing in Java?",
                "choices": [
                    "Automatic conversion between a primitive type and its wrapper class",
                    "Automatic garbage collection",
                    "Automatic casting between subclasses",
                    "Automatic exception handling",
                ],
                "correct_index": 0,
                "explanation": "E.g. `int` <-> `Integer` conversion happens automatically where needed.",
            },
        ],
        "middle": [
            {
                "question": "What's the key performance difference between ArrayList and LinkedList?",
                "choices": [
                    "ArrayList uses a linked structure internally",
                    "LinkedList provides faster random access",
                    "ArrayList gives faster random access (O(1)); LinkedList is faster for insert/delete at the ends",
                    "They perform identically in all cases",
                ],
                "correct_index": 2,
                "explanation": "ArrayList is backed by an array (fast indexed access); LinkedList is a doubly-linked list (fast add/remove at head/tail).",
            },
            {
                "question": "What does the `volatile` keyword guarantee?",
                "choices": [
                    "Atomicity of compound operations like i++",
                    "Visibility of a variable's latest value across threads",
                    "Full synchronization of the whole object",
                    "Immutability of the variable",
                ],
                "correct_index": 1,
                "explanation": "`volatile` prevents threads from caching a stale value, but does not make compound operations atomic.",
            },
            {
                "question": "What is a functional interface in Java?",
                "choices": [
                    "An interface with only static methods",
                    "An interface with exactly one abstract method, usable as a lambda target",
                    "Any interface that has default methods",
                    "An abstract class",
                ],
                "correct_index": 1,
                "explanation": "Examples include Runnable and Comparator; the single abstract method enables lambda syntax.",
            },
            {
                "question": "Which of these is a common cause of memory leaks in Java despite garbage collection?",
                "choices": [
                    "Unclosed resources or lingering references held in long-lived static collections",
                    "Using primitive types",
                    "Declaring variables as final",
                    "Using try-with-resources",
                ],
                "correct_index": 0,
                "explanation": "GC only reclaims unreachable objects; objects still referenced (e.g. in a static cache) are never collected.",
            },
            {
                "question": "What's the main difference between HashMap and ConcurrentHashMap?",
                "choices": [
                    "There is no real difference",
                    "ConcurrentHashMap allows null keys, HashMap doesn't",
                    "HashMap isn't thread-safe; ConcurrentHashMap supports safe concurrent access without locking the entire map",
                    "HashMap is always faster in every scenario",
                ],
                "correct_index": 2,
                "explanation": "ConcurrentHashMap uses fine-grained locking/CAS internally to allow safe concurrent reads and writes.",
            },
        ],
    },
    "Python": {
        "fresher": [
            {
                "question": "Which keyword is used to define a function in Python?",
                "choices": ["function", "def", "func", "lambda"],
                "correct_index": 1,
                "explanation": "`def` introduces a named function definition.",
            },
            {
                "question": "What does `type([])` return?",
                "choices": ["list", "tuple", "dict", "set"],
                "correct_index": 0,
                "explanation": "`[]` is an empty list literal.",
            },
            {
                "question": "How do you start a single-line comment in Python?",
                "choices": ["//", "#", "/*", "--"],
                "correct_index": 1,
                "explanation": "`#` marks the rest of the line as a comment.",
            },
            {
                "question": "Which of these is a mutable data type in Python?",
                "choices": ["tuple", "str", "list", "int"],
                "correct_index": 2,
                "explanation": "Lists can be changed in place (append, remove, etc.); tuples, strings, and ints are immutable.",
            },
            {
                "question": "What does `len(\"hello\")` return?",
                "choices": ["4", "5", "6", "Error"],
                "correct_index": 1,
                "explanation": "\"hello\" has 5 characters.",
            },
        ],
        "junior": [
            {
                "question": "What is the key difference between a list and a tuple?",
                "choices": [
                    "There is no difference",
                    "A list is mutable, a tuple is immutable",
                    "A tuple is mutable, a list is immutable",
                    "Both are immutable",
                ],
                "correct_index": 1,
                "explanation": "Tuples cannot be changed after creation, which also makes them hashable (usable as dict keys).",
            },
            {
                "question": "What does `*args` allow a function to accept?",
                "choices": [
                    "A single keyword argument",
                    "A variable number of positional arguments",
                    "A dictionary of keyword arguments",
                    "No arguments at all",
                ],
                "correct_index": 1,
                "explanation": "`*args` collects extra positional arguments into a tuple; `**kwargs` does the same for keyword arguments.",
            },
            {
                "question": "What is a Python decorator?",
                "choices": [
                    "A pattern that wraps a function to extend its behavior without modifying its source",
                    "A type of loop",
                    "A built-in exception type",
                    "A way to declare private variables",
                ],
                "correct_index": 0,
                "explanation": "Decorators like `@staticmethod` or custom ones take a function and return a wrapped version of it.",
            },
            {
                "question": "What does `[x for x in range(5) if x % 2 == 0]` evaluate to?",
                "choices": ["[0, 1, 2, 3, 4]", "[0, 2, 4]", "[1, 3]", "Error"],
                "correct_index": 1,
                "explanation": "The list comprehension filters range(5) to even numbers only.",
            },
            {
                "question": "What does `self` refer to inside an instance method?",
                "choices": [
                    "The class itself",
                    "The current instance the method was called on",
                    "It's optional and unused",
                    "The parent class",
                ],
                "correct_index": 1,
                "explanation": "`self` is the conventional name for the instance reference automatically passed as the first argument.",
            },
        ],
        "middle": [
            {
                "question": "What is the GIL (Global Interpreter Lock) in CPython?",
                "choices": [
                    "A lock that enables true parallel multithreading",
                    "A mutex that allows only one thread to execute Python bytecode at a time",
                    "A security feature for module imports",
                    "A setting for the garbage collector",
                ],
                "correct_index": 1,
                "explanation": "The GIL is why CPU-bound multithreading doesn't scale in CPython; multiprocessing is used instead for parallelism.",
            },
            {
                "question": "What's the difference between `@staticmethod` and `@classmethod`?",
                "choices": [
                    "There is no difference",
                    "`staticmethod` gets no implicit first argument; `classmethod` receives the class itself (`cls`)",
                    "`classmethod` can only be called on instances, never the class",
                    "`staticmethod` can access instance state directly",
                ],
                "correct_index": 1,
                "explanation": "`classmethod` is often used for alternative constructors since it has access to the class object.",
            },
            {
                "question": "What does the `yield` keyword do in a Python function?",
                "choices": [
                    "Ends the function immediately like return",
                    "Turns the function into a generator that pauses and resumes, producing a sequence of values lazily",
                    "Raises an exception",
                    "Forces the function to return a list",
                ],
                "correct_index": 1,
                "explanation": "Generators produce values on demand instead of building an entire result in memory upfront.",
            },
            {
                "question": "What's the difference between a shallow copy and a deep copy?",
                "choices": [
                    "There is no difference",
                    "A shallow copy copies references to nested objects; a deep copy recursively copies all nested objects too",
                    "A deep copy is always faster to create",
                    "A shallow copy duplicates absolutely everything",
                ],
                "correct_index": 1,
                "explanation": "Mutating a nested object inside a shallow copy also affects the original, since they share the same nested reference.",
            },
            {
                "question": "When would you use `__slots__` in a class?",
                "choices": [
                    "To allow adding arbitrary dynamic attributes",
                    "To restrict which instance attributes are allowed and reduce per-instance memory overhead",
                    "To make a class abstract",
                    "To enable multiple inheritance",
                ],
                "correct_index": 1,
                "explanation": "`__slots__` skips creating a per-instance `__dict__`, saving memory when creating many instances.",
            },
        ],
    },
    "JavaScript": {
        "fresher": [
            {
                "question": "Which keyword declares a block-scoped variable that can be reassigned?",
                "choices": ["const", "let", "var", "static"],
                "correct_index": 1,
                "explanation": "`let` is block-scoped and reassignable; `const` is block-scoped but cannot be reassigned.",
            },
            {
                "question": "What does `typeof null` return in JavaScript?",
                "choices": ["\"null\"", "\"undefined\"", "\"object\"", "\"number\""],
                "correct_index": 2,
                "explanation": "This is a well-known long-standing quirk/bug in JavaScript kept for backwards compatibility.",
            },
            {
                "question": "Which array method adds an element to the end of an array?",
                "choices": ["push()", "pop()", "shift()", "unshift()"],
                "correct_index": 0,
                "explanation": "`push()` appends to the end; `pop()` removes from the end; `shift`/`unshift` operate on the start.",
            },
            {
                "question": "What is the correct way to write a function expression?",
                "choices": ["function = myFunc() {}", "const myFunc = function() {}", "def myFunc() {}", "func myFunc() {}"],
                "correct_index": 1,
                "explanation": "A function expression assigns an (often anonymous) function to a variable.",
            },
            {
                "question": "What does `===` check that `==` does not?",
                "choices": ["Nothing extra", "Value only", "Value and type (no implicit coercion)", "Only type, never value"],
                "correct_index": 2,
                "explanation": "`==` performs type coercion before comparing; `===` requires both value and type to match.",
            },
        ],
        "junior": [
            {
                "question": "What is a closure in JavaScript?",
                "choices": [
                    "A function that takes no parameters",
                    "A function that remembers and can access variables from its outer scope even after that scope has finished executing",
                    "A loop that never terminates",
                    "A type of runtime error",
                ],
                "correct_index": 1,
                "explanation": "Closures are the basis for patterns like private state and memoization in JavaScript.",
            },
            {
                "question": "What is event bubbling?",
                "choices": [
                    "An event only ever triggers on the exact target element",
                    "An event propagates upward from the target element through its ancestor elements",
                    "An event fires multiple times at random",
                    "A way to cancel all events on a page",
                ],
                "correct_index": 1,
                "explanation": "You can stop bubbling with `event.stopPropagation()` if needed.",
            },
            {
                "question": "What does `Array.prototype.map()` return?",
                "choices": [
                    "The original array, mutated in place",
                    "A new array containing the results of calling a function on every element",
                    "A single aggregated value",
                    "undefined",
                ],
                "correct_index": 1,
                "explanation": "`map` is non-mutating and always returns a new array of the same length.",
            },
            {
                "question": "What's the difference between `null` and `undefined`?",
                "choices": [
                    "They are exactly the same",
                    "`undefined` means a variable was declared but never assigned; `null` is an explicit assignment meaning 'no value'",
                    "`null` means the variable was never declared",
                    "`undefined` is a function",
                ],
                "correct_index": 1,
                "explanation": "`undefined` is JavaScript's own default for unassigned things; `null` is intentionally set by a developer.",
            },
            {
                "question": "Inside a regular function called as `obj.method()`, what does `this` refer to?",
                "choices": [
                    "The global object, always",
                    "The object the method was called on (obj)",
                    "undefined, always",
                    "The function itself",
                ],
                "correct_index": 1,
                "explanation": "`this` in a regular function depends on how it's called; arrow functions instead inherit `this` from their enclosing scope.",
            },
        ],
        "middle": [
            {
                "question": "What's the key difference between `Promise.all` and `Promise.allSettled`?",
                "choices": [
                    "They behave identically",
                    "`Promise.all` rejects as soon as any promise rejects; `Promise.allSettled` waits for all and reports each outcome individually",
                    "`allSettled` is simply a faster version of `all`",
                    "`Promise.all` never rejects",
                ],
                "correct_index": 1,
                "explanation": "Use `allSettled` when you need every result regardless of individual failures.",
            },
            {
                "question": "What is the JavaScript event loop responsible for?",
                "choices": [
                    "Compiling JavaScript into bytecode",
                    "Coordinating the call stack, callback queue, and microtask queue to enable non-blocking asynchronous behavior",
                    "Managing only CSS rendering",
                    "Garbage collection exclusively",
                ],
                "correct_index": 1,
                "explanation": "It's why JS can be single-threaded yet still handle async I/O, timers, and promises efficiently.",
            },
            {
                "question": "What is debouncing used for?",
                "choices": [
                    "Increasing how often a function is called",
                    "Delaying a function's execution until after a period of inactivity, e.g. to reduce calls while a user types or resizes",
                    "Permanently blocking an event",
                    "Sorting an array more efficiently",
                ],
                "correct_index": 1,
                "explanation": "Debouncing is common on search inputs or window resize handlers to avoid excessive work.",
            },
            {
                "question": "What is prototypal inheritance?",
                "choices": [
                    "Objects can only inherit from formally declared classes",
                    "Objects can inherit properties and methods from other objects through the prototype chain",
                    "JavaScript has no concept of inheritance",
                    "Inheritance only works with ES6 `class` syntax",
                ],
                "correct_index": 1,
                "explanation": "ES6 classes are syntactic sugar over this same prototype-based mechanism.",
            },
            {
                "question": "What's the difference between `call`, `apply`, and `bind`?",
                "choices": [
                    "They all behave identically",
                    "`call`/`apply` invoke the function immediately with a given `this` (args as a list for apply), while `bind` returns a new function with `this` permanently bound for later use",
                    "`bind` invokes the function immediately",
                    "None of them affect the value of `this`",
                ],
                "correct_index": 1,
                "explanation": "`bind` is often used to lock `this` for callbacks passed elsewhere, e.g. event handlers.",
            },
        ],
    },
    "TypeScript": {
        "fresher": [
            {
                "question": "What is TypeScript?",
                "choices": [
                    "A completely separate language unrelated to JavaScript",
                    "A superset of JavaScript that adds static typing",
                    "A JavaScript runtime environment",
                    "A CSS preprocessor",
                ],
                "correct_index": 1,
                "explanation": "TypeScript compiles down to plain JavaScript; types exist only at compile time.",
            },
            {
                "question": "How do you declare a variable of type string in TypeScript?",
                "choices": ["let x: string", "let x = string", "string x", "let x string"],
                "correct_index": 0,
                "explanation": "Type annotations follow the variable name after a colon.",
            },
            {
                "question": "Which file extension is used for TypeScript files?",
                "choices": [".js", ".ts", ".tsx only", ".tjs"],
                "correct_index": 1,
                "explanation": "`.tsx` is used specifically for TypeScript files containing JSX.",
            },
            {
                "question": "What does the `any` type mean?",
                "choices": [
                    "It disables type checking for that value",
                    "It means the value must always be a number",
                    "It's required on every variable declaration",
                    "It only applies to function parameters",
                ],
                "correct_index": 0,
                "explanation": "`any` opts out of type safety and should generally be avoided in favor of specific types or `unknown`.",
            },
            {
                "question": "What tool converts TypeScript source into JavaScript?",
                "choices": ["Babel is the only option", "The TypeScript compiler (tsc)", "Node.js runs .ts files directly", "Webpack only"],
                "correct_index": 1,
                "explanation": "`tsc` type-checks and emits JavaScript output (Babel can also strip types without full checking).",
            },
        ],
        "junior": [
            {
                "question": "What is an `interface` used for in TypeScript?",
                "choices": [
                    "Runtime validation of data",
                    "Defining the shape/contract of an object at compile time",
                    "Providing a class's method implementations",
                    "Replacing functions entirely",
                ],
                "correct_index": 1,
                "explanation": "Interfaces are purely a compile-time construct; they're erased from the emitted JavaScript.",
            },
            {
                "question": "What does the `?` mean in `interface User { age?: number }`?",
                "choices": ["age is required", "age is an optional property", "age can only be nullable", "It's a syntax error"],
                "correct_index": 1,
                "explanation": "Optional properties may be omitted entirely when creating an object of that type.",
            },
            {
                "question": "What is a union type, e.g. `string | number`?",
                "choices": [
                    "A type that must satisfy both string and number simultaneously",
                    "A type whose value can be either a string or a number",
                    "An invalid TypeScript construct",
                    "A generic type parameter",
                ],
                "correct_index": 1,
                "explanation": "Union types let a value be one of several possible types, requiring narrowing to use type-specific behavior.",
            },
            {
                "question": "What does marking a property `readonly` do?",
                "choices": [
                    "Makes it private to the class",
                    "Prevents reassignment of the property after initialization",
                    "Makes the property optional",
                    "Enforces immutability at runtime automatically",
                ],
                "correct_index": 1,
                "explanation": "`readonly` is a compile-time check only — it doesn't add any runtime enforcement.",
            },
            {
                "question": "What is the purpose of generics, e.g. `function identity<T>(arg: T): T`?",
                "choices": [
                    "To let a function work with multiple types while preserving type information",
                    "To make the compiled JavaScript run faster",
                    "To disable type checking on that function",
                    "To create new interfaces",
                ],
                "correct_index": 0,
                "explanation": "Generics avoid duplicating code per type while keeping full type safety, unlike using `any`.",
            },
        ],
        "middle": [
            {
                "question": "What's a key practical difference between `type` and `interface`?",
                "choices": [
                    "They are 100% interchangeable in every situation",
                    "Both can describe object shapes, but `type` can also alias unions/primitives/tuples, while `interface` supports declaration merging",
                    "`interface` can alias primitive types, `type` cannot describe objects",
                    "`type` supports declaration merging, `interface` doesn't",
                ],
                "correct_index": 1,
                "explanation": "Declaration merging means multiple `interface` blocks with the same name combine into one; `type` cannot do this.",
            },
            {
                "question": "What is a discriminated union?",
                "choices": [
                    "A union type where a shared literal property lets TypeScript narrow which variant you're working with",
                    "A union with no properties in common",
                    "A TypeScript compiler error",
                    "A type used exclusively for enums",
                ],
                "correct_index": 0,
                "explanation": "E.g. a `kind: 'circle' | 'square'` field lets a switch statement safely narrow the rest of each shape.",
            },
            {
                "question": "What does the `keyof` operator do?",
                "choices": [
                    "Returns the runtime values of an object's keys",
                    "Produces a union type of an object type's property names",
                    "Deletes a key from an object",
                    "Converts an object type into an array type",
                ],
                "correct_index": 1,
                "explanation": "`keyof` is a type-level operator used to build generic, type-safe utilities like `Pick` or `Record`.",
            },
            {
                "question": "What is type narrowing?",
                "choices": [
                    "Making a declared type permanently stricter",
                    "Refining a variable's type within a conditional block based on runtime checks like `typeof` or `instanceof`",
                    "Removing all type information",
                    "A concept that only applies to classes",
                ],
                "correct_index": 1,
                "explanation": "Narrowing lets TypeScript understand that inside an `if (typeof x === 'string')` block, `x` is a string.",
            },
            {
                "question": "What does the built-in `Partial<T>` utility type do?",
                "choices": [
                    "Makes all properties of T optional",
                    "Makes all properties of T required",
                    "Removes all properties from T",
                    "Makes T's properties readonly",
                ],
                "correct_index": 0,
                "explanation": "`Partial<T>` is useful for things like update/patch payloads where only some fields are provided.",
            },
        ],
    },
    "Vue.js": {
        "fresher": [
            {
                "question": "Which directive is used to dynamically bind an attribute in Vue?",
                "choices": ["v-bind (or the : shorthand)", "v-attr", "v-link", "v-model only"],
                "correct_index": 0,
                "explanation": "`v-bind:href=\"url\"` can be shortened to `:href=\"url\"`.",
            },
            {
                "question": "What does `v-for` do?",
                "choices": [
                    "Conditionally renders an element",
                    "Renders a list of items by iterating over an array or object",
                    "Binds a form input's value",
                    "Declares a computed property",
                ],
                "correct_index": 1,
                "explanation": "`v-for=\"item in items\"` repeats an element once per item in the source list.",
            },
            {
                "question": "What is a Vue \"component\"?",
                "choices": [
                    "A CSS stylesheet",
                    "A reusable, self-contained piece of UI with its own template, logic, and optional styles",
                    "A router configuration file",
                    "A database table",
                ],
                "correct_index": 1,
                "explanation": "Components are the basic building blocks of a Vue application.",
            },
            {
                "question": "What does `v-model` do on a form input?",
                "choices": [
                    "One-way binds data into the DOM only",
                    "Creates two-way data binding between the input and the component's state",
                    "Removes the input from the DOM",
                    "Only works on checkboxes",
                ],
                "correct_index": 1,
                "explanation": "Typing in the input updates the bound state, and changing the state updates the input.",
            },
            {
                "question": "What is the `data` option of a Vue component used for?",
                "choices": [
                    "Defining the component's methods",
                    "Declaring the component's reactive state",
                    "Applying styles to the component",
                    "Configuring routes",
                ],
                "correct_index": 1,
                "explanation": "Values returned from `data()` become reactive — the DOM updates automatically when they change.",
            },
        ],
        "junior": [
            {
                "question": "What's the key difference between `computed` properties and `methods`?",
                "choices": [
                    "There is no real difference",
                    "Computed properties are cached based on their reactive dependencies and only recompute when those change; methods re-run every time they're called",
                    "Methods are cached, computed properties are not",
                    "Computed properties can't read component data",
                ],
                "correct_index": 1,
                "explanation": "Use computed properties for derived values you'll read multiple times per render.",
            },
            {
                "question": "How does `v-if` differ from `v-show`?",
                "choices": [
                    "They behave identically",
                    "`v-if` conditionally adds/removes the element from the DOM; `v-show` toggles CSS `display` while keeping it in the DOM",
                    "`v-show` removes the element from the DOM, `v-if` toggles CSS",
                    "Neither affects the DOM at all",
                ],
                "correct_index": 1,
                "explanation": "`v-show` has a higher initial render cost but cheaper toggling; `v-if` is the opposite, better for conditions that rarely change.",
            },
            {
                "question": "What is a Vue \"prop\"?",
                "choices": [
                    "A globally shared variable",
                    "Custom data passed from a parent component down to a child component",
                    "A CSS utility class",
                    "An internal event listener",
                ],
                "correct_index": 1,
                "explanation": "Props flow one-way, from parent to child; a child should not mutate its own props directly.",
            },
            {
                "question": "In the Composition API, what does `ref()` do?",
                "choices": [
                    "Creates a reactive reference that must be accessed via `.value` in script",
                    "Creates a static, non-reactive constant",
                    "Registers a new component",
                    "Defines a route",
                ],
                "correct_index": 0,
                "explanation": "In the template, `.value` is automatically unwrapped, so you can use the ref directly.",
            },
            {
                "question": "How does a child component communicate back to its parent in Vue?",
                "choices": [
                    "By directly modifying the parent's data",
                    "By emitting custom events (via `$emit` or `emit`) that the parent listens for",
                    "It's not possible without a global store",
                    "Only through Vuex, always",
                ],
                "correct_index": 1,
                "explanation": "The parent listens with `@event-name=\"handler\"` on the child's tag.",
            },
        ],
        "middle": [
            {
                "question": "What is the purpose of Vue 3's Proxy-based reactivity system?",
                "choices": [
                    "To compile templates into HTML strings",
                    "To automatically track dependencies and trigger DOM updates when reactive state changes",
                    "To manage client-side routing",
                    "To bundle and minify assets",
                ],
                "correct_index": 1,
                "explanation": "Vue 3 uses native JavaScript `Proxy` objects to intercept get/set operations on reactive state.",
            },
            {
                "question": "What's the difference between `watch` and `watchEffect` in the Composition API?",
                "choices": [
                    "There is no difference",
                    "`watch` explicitly specifies which reactive sources to observe and exposes old/new values; `watchEffect` auto-tracks any reactive dependency used inside it and runs immediately",
                    "`watchEffect` requires you to list sources explicitly",
                    "`watch` always runs immediately on component creation",
                ],
                "correct_index": 1,
                "explanation": "Use `watch` when you need the previous value or want to observe specific sources; `watchEffect` is more convenient for simple reactive side effects.",
            },
            {
                "question": "What problem does Vuex/Pinia solve?",
                "choices": [
                    "Component-level styling",
                    "Centralized, predictable state management shared across many components, avoiding deep prop drilling",
                    "Routing between pages",
                    "Server-side rendering configuration",
                ],
                "correct_index": 1,
                "explanation": "Pinia is the modern, officially recommended replacement for Vuex in Vue 3 apps.",
            },
            {
                "question": "What is a \"composable\" in Vue 3?",
                "choices": [
                    "A CSS utility class",
                    "A reusable function that encapsulates and shares stateful logic using the Composition API",
                    "A special type of directive",
                    "A build-tool plugin",
                ],
                "correct_index": 1,
                "explanation": "Composables (e.g. `useMousePosition()`) are the Composition API's answer to reusing logic across components.",
            },
            {
                "question": "Why does a `key` attribute matter on elements rendered with `v-for`?",
                "choices": [
                    "It's purely cosmetic and has no functional effect",
                    "It helps Vue's virtual DOM diffing correctly track, reorder, and reuse elements instead of re-rendering everything",
                    "It's only required when using `v-if` together with `v-for`",
                    "It disables reactivity for that element",
                ],
                "correct_index": 1,
                "explanation": "Using the array index as `key` is discouraged when the list can be reordered, inserted into, or filtered.",
            },
        ],
    },
    "React.js": {
        "fresher": [
            {
                "question": "What is JSX?",
                "choices": [
                    "A completely separate programming language",
                    "A syntax extension for JavaScript that lets you write HTML-like code in components",
                    "A CSS framework",
                    "A testing library",
                ],
                "correct_index": 1,
                "explanation": "JSX is compiled (e.g. by Babel) into regular `React.createElement()` calls.",
            },
            {
                "question": "Which hook is used to add local state to a functional component?",
                "choices": ["useEffect", "useState", "useContext", "useRef"],
                "correct_index": 1,
                "explanation": "`useState` returns a state value and a setter function to update it.",
            },
            {
                "question": "What is a React \"component\"?",
                "choices": [
                    "A CSS class",
                    "A reusable, independent piece of UI, written as a function (or class), that returns JSX",
                    "A database model",
                    "A client-side router",
                ],
                "correct_index": 1,
                "explanation": "Components can be composed together to build up an entire UI tree.",
            },
            {
                "question": "How do you pass data from a parent component to a child?",
                "choices": ["Through global variables", "Via props", "Via useState only", "It's not possible"],
                "correct_index": 1,
                "explanation": "Props are passed like HTML attributes: `<Child name=\"Phu\" />`.",
            },
            {
                "question": "What does `useEffect` do?",
                "choices": [
                    "Declares component state",
                    "Lets you run side effects (like data fetching or subscriptions) after render",
                    "Creates a brand-new component",
                    "Applies CSS styles to a component",
                ],
                "correct_index": 1,
                "explanation": "Common uses include fetching data on mount or setting up/cleaning up subscriptions.",
            },
        ],
        "junior": [
            {
                "question": "What is the Virtual DOM?",
                "choices": [
                    "A real DOM element rendered directly to the page",
                    "An in-memory representation of the DOM React uses to compute the minimal set of changes before updating the real DOM",
                    "A browser-native API",
                    "A CSS layout technique",
                ],
                "correct_index": 1,
                "explanation": "React diffs the new virtual tree against the previous one, then applies only the necessary real DOM updates.",
            },
            {
                "question": "Why shouldn't you call React hooks conditionally?",
                "choices": [
                    "It's actually perfectly fine to do",
                    "React relies on the consistent order hooks are called in across renders to correctly associate each hook with its state",
                    "Conditional hooks are always slower",
                    "It causes a JavaScript syntax error",
                ],
                "correct_index": 1,
                "explanation": "This is the basis of the 'Rules of Hooks' — always call hooks at the top level, never inside conditionals or loops.",
            },
            {
                "question": "What is the purpose of the dependency array in `useEffect(() => {...}, [dep])`?",
                "choices": [
                    "It has no functional effect",
                    "It controls when the effect re-runs — only when one of the listed values changes between renders",
                    "It lists variables that are unused",
                    "It sets the component's props",
                ],
                "correct_index": 1,
                "explanation": "An empty array `[]` means the effect runs once, after the initial render only.",
            },
            {
                "question": "What is \"lifting state up\" in React?",
                "choices": [
                    "Always moving state into a global store",
                    "Moving shared state to the closest common ancestor component so multiple children can access and update it via props",
                    "Removing state from a component entirely",
                    "A built-in performance optimization API",
                ],
                "correct_index": 1,
                "explanation": "It's the standard pattern for sharing state between sibling components without extra libraries.",
            },
            {
                "question": "What does the `key` prop do when rendering a list?",
                "choices": [
                    "Applies styles to the list items",
                    "Helps React identify which items changed, were added, or were removed for efficient re-rendering",
                    "Sets the CSS order of the list",
                    "It's purely optional and has no real effect",
                ],
                "correct_index": 1,
                "explanation": "Keys should be stable and unique — using array index as a key is discouraged for lists that can reorder.",
            },
        ],
        "middle": [
            {
                "question": "What's the difference between `useMemo` and `useCallback`?",
                "choices": [
                    "They are functionally identical",
                    "`useMemo` memoizes a computed value; `useCallback` memoizes a function reference — both to avoid unnecessary recalculation or re-renders",
                    "`useCallback` memoizes values and `useMemo` memoizes functions",
                    "Neither one affects rendering performance",
                ],
                "correct_index": 1,
                "explanation": "`useCallback(fn, deps)` is roughly equivalent to `useMemo(() => fn, deps)`.",
            },
            {
                "question": "What problem does `useContext` solve?",
                "choices": [
                    "It completely replaces the need for useState",
                    "It lets components read shared data from a Context Provider without manually passing props through every intermediate level ('prop drilling')",
                    "It fetches data from a remote server",
                    "It manages client-side routing",
                ],
                "correct_index": 1,
                "explanation": "Common use cases include theme, authenticated user, and locale settings.",
            },
            {
                "question": "What is React \"reconciliation\"?",
                "choices": [
                    "The process of compiling JSX into JavaScript",
                    "The algorithm React uses to diff the new virtual DOM tree against the previous one and apply minimal updates to the real DOM",
                    "A way to merge multiple state objects",
                    "A testing strategy for React apps",
                ],
                "correct_index": 1,
                "explanation": "Efficient reconciliation is what makes updating only the changed parts of the UI fast.",
            },
            {
                "question": "Why is directly mutating state (e.g. `state.push(item)`) discouraged instead of `setState([...state, item])`?",
                "choices": [
                    "It isn't actually discouraged, both work the same",
                    "React detects changes largely via reference comparison; direct mutation doesn't create a new reference, so React may not notice the update and skip re-rendering",
                    "It causes a compile-time error",
                    "It only matters when using TypeScript",
                ],
                "correct_index": 1,
                "explanation": "Always create new arrays/objects when updating state so React's change detection works correctly.",
            },
            {
                "question": "What is the purpose of `React.memo`?",
                "choices": [
                    "To memoize a component so it only re-renders when its props actually change (via shallow comparison)",
                    "To manage global application state",
                    "To fetch data from an API",
                    "To replace the need for useState",
                ],
                "correct_index": 0,
                "explanation": "It's a performance optimization for components that render often with the same props.",
            },
        ],
    },
}


def run() -> None:
    db = SessionLocal()
    try:
        total_created = 0
        for category_name, levels in QUIZ_DATA.items():
            category = db.query(Category).filter(Category.name == category_name).first()
            if not category:
                category = Category(name=category_name, slug=slugify(category_name))
                db.add(category)
                db.commit()
                db.refresh(category)
                print(f"Created category: {category_name}")

            topic = db.query(Topic).filter(Topic.category_id == category.id, Topic.name == "Interview Quiz").first()
            if not topic:
                topic = Topic(category_id=category.id, name="Interview Quiz", slug=slugify("Interview Quiz"))
                db.add(topic)
                db.commit()
                db.refresh(topic)
                print(f"  Created topic: {category_name} / Interview Quiz")

            existing_questions = {c.question for c in topic.cards if c.type == "quiz"}

            for level, questions in levels.items():
                for q in questions:
                    if q["question"] in existing_questions:
                        continue
                    card = Card(
                        topic_id=topic.id,
                        type="quiz",
                        question=q["question"],
                        choices=q["choices"],
                        correct_index=q["correct_index"],
                        explanation=q["explanation"],
                        level=level,
                    )
                    db.add(card)
                    total_created += 1
            db.commit()

        print(f"Done. {total_created} new questions added.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
