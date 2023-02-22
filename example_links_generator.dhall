-- Usage: dhall text --file example_links_generator.dhall
let Prelude =
      https://prelude.dhall-lang.org/v21.1.0/package.dhall
        sha256:0fed19a88330e9a8a3fbe1e8442aa11d12e38da51eb12ba8bcb56f3c25d0854a

let template =
      \(n : Text) ->
        ''
        ## ${n}
        ![${n}](examples/${n}/number-of-seats-d/out.png)

        ''

let subs =
      [ "equilateral"
      , "colinear1"
      , "two_close_right"
      , "two_close"
      , "colinear2"
      , "square"
      , "tick"
      , "on_triangle"
      , "middle_four"
      , "stv-8"
      , "stv-13"
      ]

let x = Prelude.List.map Text Text template subs

in  Prelude.Text.concat x
