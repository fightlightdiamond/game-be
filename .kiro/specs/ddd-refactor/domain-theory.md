# Domain Theory

This note defines the words used to talk about the business and the model. It does not describe bet-herox. The game model is in [strategic-design.md](./strategic-design.md). Whether a named thing is a concept, data, or a rule is in [concepts.md](./concepts.md). The game's own words are in [ubiquitous-language.md](./ubiquitous-language.md). If this file and the strategic design disagree about a definition, this file wins. If they disagree about the game, the strategic design wins. If they disagree about kind, concepts wins. If a game word is spelled differently, the ubiquitous language wins.

Sources for the strategic split are Eric Evans, *Domain-Driven Design* (2003), chapter on distillation, and Vaughn Vernon, *Implementing Domain-Driven Design* (2013), the chapter on domains. Evans separates the core of the problem from generic parts. Vernon names the third category, the supporting subdomain.

## 1. Four words

The four words sit in a fixed order. Each one is made from the one above it. None of them is a synonym for another.

| Word | What it is | Distance from code |
|---|---|---|
| Business | What the product does for a person, stated as requirements | Furthest |
| Domain | One slice of that business, after it has concepts and rules | Still not code |
| Rule | One sentence inside a concept of a domain | The sentence that code will enforce |
| Data | A stored fact that no rule is attached to | A value the code reads or writes |

Code is a fifth step. It is the method that enforces a rule or stores a fact. A rule does not become more technical as it moves down. The same sentence appears in the requirement, then on the concept, then in the method.

### Business

The business is the activity the product exists to perform, in the words of a requirement. It includes work that has no code yet.

A business is not a domain. It is the whole activity. One business contains several slices.

### Domain

A domain is one slice of the business, plus the concepts of that slice, plus the rules attached to those concepts.

Evans uses "domain" for the whole sphere of activity, and "subdomain" for a part of it. In this note, "domain" means one modeled slice (a subdomain that has been given concepts and rules). The whole activity is called the business, so the two words do not collapse.

Identify a domain in this order:

1. Choose one slice of the business.
2. Name the concepts of that slice. One name, one meaning.
3. Attach rules to those concepts.

A concept that receives no rule is data. It does not become a domain.

### Rule

A rule is one sentence that must hold for a concept. It has exactly one of these three forms:

| Form | Question the sentence answers |
|---|---|
| Invariant | What is still true after every operation? |
| Formula | How is a business value computed from facts? |
| State transition | Which state may follow the current state? |

A sentence that only checks the shape of input is a technical check. "The field is a number" and "the email matches a pattern" are technical checks. "The amount is positive and is accepted only while the window is open" is a rule, because it constrains the concept.

A rule is the content of a domain. It is not a layer between the domain and the code.

### Data

Data is a fact the system stores or passes, with no invariant, formula, or state transition of its own.

Three kinds appear in practice:

| Kind | Meaning |
|---|---|
| Reference data | A catalog row other slices read. Changing a field changes a fact, not a law |
| Input data | A frozen copy of facts handed to a domain at the start of an operation |
| Output data | A fact a domain has already computed. The formula that produced it stays in the domain. The stored result is data |

## 2. How the four words relate

```text
Business
  └── Domain          one slice + its concepts + its rules
        ├── Rule      invariant, formula, or state transition
        └── Data      a concept in the slice that received no rule
  └── Data            a fact that never entered a domain
Code                  implements a rule, or reads and writes data
```

Work through one requirement to see the split.

| Step | Sentence |
|---|---|
| Business | A winning stake is paid double. |
| Domain | The betting slice. Concept: stake |
| Rule | Formula: payout = amount × 2. Invariant: only a stake on the winning side is credited |
| Data | The recorded amount, the account id, the match id |
| Code | The method that credits the payout |

A catalog of named characters is part of the business, because fights need characters. If no rule attaches to a catalog row, the row stays reference data. The formulas that use those numbers belong to the domain that fights.

## 3. Core, supporting, and generic

Only a domain is classified. Reference data and technical capabilities are not core, supporting, or generic.

Evans distills the problem so the distinctive part is not buried under problems every system has. Vernon states the three categories. The split is strategic value to this business. It is not "which slice has rules." All three have rules.

| | Core domain | Supporting subdomain | Generic subdomain |
|---|---|---|---|
| Question | Which slice would make this a different product if its rules were replaced by ordinary ones? | Which slice must work, with its own rules, while not being the reason a person chooses the product? | Which slice do many businesses have, with a known solution? |
| Model | Deep. The rules are specific to this product | Custom, and only as deep as the rules require | Thin, or a library |
| Who builds it | The strongest effort, inside the team | The team, at adequate depth | A library, a purchase, or a thin port |
| When strategy changes | This slice changes | It changes with operations | It stays stable |

A generic domain can have a strict invariant. "A balance is never negative" is a real rule, and it is still generic, because every system that holds money has it. The formula that decides the amount, such as double payout or a one-percent cost, stays in the domain that names the amount. The generic domain only receives the amount.

## 4. What is not a domain

| Thing | Why it stays outside the three categories |
|---|---|
| Reference data | A slice was considered, concepts were named, and no rule attached |
| Technical capability | Login, tokens, mail transport, sockets. The checks are technical. There is no business rule to attach |
| A stored result | Output data. The rule that produced it lives in the domain that computed it |

## 5. Terms from the books, and the words in this note

| Book term | Word in this note |
|---|---|
| Domain, the whole sphere of activity (Evans) | Business |
| Subdomain | Domain, once concepts and rules exist |
| Core domain | Core domain |
| Supporting subdomain (Vernon) | Supporting domain |
| Generic subdomain | Generic domain |
| Invariant, policy, calculation inside the model | Rule |
| A fact the model reads or records | Data |
| Bounded context | Not defined here. It is the boundary in which one domain's language applies. See the strategic design for the game's boundaries |
