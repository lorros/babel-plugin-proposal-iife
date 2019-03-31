# babel-plugin-proposal-iife
Immediately invoked function expressions (IIFE) syntax proposal for JS (Babel implementation)

To use, add it to .babelrc / babel.config.js, plugins section. No configuration needed.

The problem:
IIFEs are commonplace when you want to save the results of some calculation within an expression.
E.g.

    const fn =
        (sgn =>
            this.saveData(this.state.id, sgn * this.state.amount, sgn * this.state.value)
        )(this.state.isPositive ? 1 : -1);

Thus we want to re-use a calculation multiple times. Note that variables don't solve this,
as a variable declaration is only possible within a statement, not within an expression;
thus you'd still need a function declaration to use let or const for sgn.

The above might also be written as:

    const fn =
        ((sgn = this.state.isPositive ? 1 : -1) =>
            this.saveData(this.state.id, sgn * this.state.amount, sgn * this.state.value)
        )();

This has the advantage that you place the calculation next to the variable name. Note that
this is easy to mix with:

    const genFn =
        ((sgn = this.state.isPositive ? 1 : -1) =>
            this.saveData(this.state.id, sgn * this.state.amount, sgn * this.state.value)
        );

Especially if you use IIFE inside an IIFE, it's easy to get lost. Thus a new syntax is proposed
for function declarations that are called immediately, without any parameters:

    const fn =
        (sgn = this.state.isPositive ? 1 : -1) :>
            this.saveData(this.state.id, sgn * this.state.amount, sgn * this.state.value);

Note that we removed a set of parantheses, therefore helped reducing the levels of nesting.
This is possible even if there are multiple IIFEs.

If you just want to declare a variable, that's also possible:

    const fn = list =>
        max :> (list.forEach(e => max = e < max ? max : e), max; // not the best, but hey...


Relation to other language features:

* let, const:
Let and const operate on block level. IIFE operates on expression level. Furthermore, let and const
require you to extend the visibility of the variables being declared till the end of the block; the
scope of IIFE variables are only till the end of the expression.

* do { expr; } proposal
Do-expressions proposal serve a similar purpose and try to solve the same problem by let and const.
It also aims at being able to write if-statement instead of ternary operators; whether that's an
advantage depends heavily on one's coding style. The caveats shown in let & const appear when one's
using do-expressions; furthermore, it opens a much larger set of what-if issues (for example, break
and return appearing in expressions), while IIFE syntax sugar helps you to focus on this and only
this issue.

* pipeline operator proposal
Pipeline operator calls a function with one parameter; IIFE syntax calls one with zero unbound /
non-defaulted parameters. Therefore, these syntaxes are similar. In fact, you might write:

    x |> f

as

    (_ = x) |> f(x)

This is a bit more verbose and thus not recommended instead of the core use case of pipeline; however,
it provides an alternative to smart pipelines (where '#' is used).
Note that these similarities break down quickly. Pipeline is an operator, thus it doesn't play well
with arrow functions: it needs a set of parentheses, therefore adds to the nesting. Also, whatever
is calculated in a step of pipelines is lost in the next step, while you might refer to the previous
nesting in function expressions:

    const fn =
        (sgn = this.state.isPositive ? 1 : -1) :>
            (amount = sgn * this.state.amount, value = sgn * this.state.value) :>
                this.saveData(amount, value);

Actually, you might also refer to previous variables (arguments) and write:

    const fn =
        (sgn    = this.state.isPositive ? 1 : -1,
         amount = sgn * this.state.amount,
         value  = sgn * this.state.value) :> this.saveData(amount, value);

Remember, IIFEs are just arrow function declarations that are called in-place. These you have been
probably writing for a decade or two, there's no new semantics, just a simple syntax sugar to help
you distinguish them from arrow functions that are not called in-place.

The token ':>' is not set in stone; it might change in future versions.



