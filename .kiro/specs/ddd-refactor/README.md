# DDD refactor documents

Read the current model in this order.

| File | Decides |
|---|---|
| [domain-theory.md](./domain-theory.md) | What "business", "domain", "rule", and "data" mean |
| [strategic-design.md](./strategic-design.md) | The slices, the contexts, and how they relate |
| [concepts.md](./concepts.md) | Whether a named thing is a concept, data, or a rule, and the sentence of that rule |
| [ubiquitous-language.md](./ubiquitous-language.md) | The word that is spoken and used as a class or method name |
| [refactor-plan.md](./refactor-plan.md) | The order of code changes that bring `src/modules` onto this model |

When two files disagree, use the file that owns that decision. A spelling disagreement is settled by the ubiquitous language. A kind disagreement is settled by concepts. A game disagreement is settled by the strategic design. A definition of "domain" or "rule" is settled by the domain theory.
