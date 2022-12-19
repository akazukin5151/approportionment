# Example configuration for local plotting

These are the Dhall config files for local plotting

## Usage

1. Edit `config/config.dhall` as you please. The types and validator functions are in `config/schema.dhall`.
    - You might want to make `show_progress_bar = True`, until you're used to it
2. Statically type-check and validate the config with `dhall resolve --file config/config.dhall | dhall normalize --explain`
