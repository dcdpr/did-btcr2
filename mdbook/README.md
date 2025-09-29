# Getting started with mdbook

On my mac:

```zsh
> cargo install mdbook
> cargo install mdbook-mermaid
> cargo install mdbook-bib

> mdbook init my-first-book
> cd my-first-book
> emacs book.toml src/SUMMARY.md
> # create/edit all your md files in 'src'
> mdbook-mermaid install .
> # create/edit references in 'src/references.bib'
> mdbook serve --open
> mdbook build
```


