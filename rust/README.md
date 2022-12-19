# libapproportionment

This is the core code containing the calculation algorithms

## Usage

1. Compile with optimizations for speed with `cargo build --release`
2. `target/release/approportionment config/config.dhall`

Run tests with

```sh
cargo test
```
Property-based tests can be run with `cargo test -- --ignored`. They are ignored as they are very slow and don't always catch violations. They are not substitutes for theorem proves.

Benchmark two versions with something like

```sh
# Just compiling two versions and renaming the binaries
# Git branches are examples
git checkout nolto
cargo b --release
mv target/release/approportionment/ target/release/approportionment-nolto

git checkout lto
cargo b --release
mv target/release/approportionment/ target/release/approportionment-lto

hyperfine --prepare 'rm out/two_close/DHondt.feather || true' 'target/release/approportionment-{name} config/config.dhall' -L name lto,nolto
```

