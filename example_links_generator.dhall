-- Usage: dhall text --file example_links_generator.dhall
let Prelude =
      https://prelude.dhall-lang.org/v21.1.0/package.dhall
        sha256:0fed19a88330e9a8a3fbe1e8442aa11d12e38da51eb12ba8bcb56f3c25d0854a

let template =
      \(n : Text) ->
        ''
        ## ${n}
        ### D'Hondt
        ![DHondt ${n}](examples/${n}/number-of-seats-d/DHondt.png)

        ### Webster/Sainte Lague
        ![SainteLague ${n}](examples/${n}/number-of-seats-d/SainteLague.png)

        ### Droop quota
        ![droop ${n}](examples/${n}/number-of-seats-d/Droop.png)

        ### Hare quota
        ![hare ${n}](examples/${n}/number-of-seats-d/Hare.png)

        ''

let subs =
      [ "equilateral"
      , "two_close"
      , "two_close_right"
      , "colinear"
      , "square"
      , "tick"
      , "on_triangle"
      , "middle_four"
      ]

let x = Prelude.List.map Text Text template subs

in  Prelude.Text.concat x