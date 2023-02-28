-- Usage: dhall text --file example_links_generator.dhall
let Prelude =
      https://prelude.dhall-lang.org/v21.1.0/package.dhall
        sha256:0fed19a88330e9a8a3fbe1e8442aa11d12e38da51eb12ba8bcb56f3c25d0854a

let template =
      \(title : Text) ->
      \(filename : Text) ->
        ''
        ## ${title}
        ![${filename}](examples/${filename}/number-of-seats-d/out.png)

        ''

let simple_template = \(name : Text) -> template name name

let simple_subs =
      [ "equilateral"
      , "colinear1"
      , "two_close_right"
      , "two_close"
      , "colinear2"
      , "square"
      , "tick"
      , "on_triangle"
      , "middle_four"
      ]

let Desc
    : Type
    = { filename : Text, title : Text }

let stv_subs
    : List Desc
    = [ { filename = "stv-8-1.0-normal", title = "stv 8 candidates stdev 1.0" }
      , { filename = "stv-8-1.0-min"
        , title = "stv 8 candidates stdev 1.0 with min party discipline"
        }
      , { filename = "stv-8-1.0-avg"
        , title = "stv 8 candidates stdev 1.0 with avg party discipline"
        }
      , { filename = "stv-8-0.5-normal", title = "stv 8 candidates stdev 0.5" }
      , { filename = "stv-8-0.5-min"
        , title = "stv 8 candidates stdev 0.5 with min party discipline"
        }
      , { filename = "stv-8-0.5-avg"
        , title = "stv 8 candidates stdev 0.5 with avg party discipline"
        }
      , { filename = "stv-13-1.0-normal", title = "stv 13 candidates stdev 1.0" }
      , { filename = "stv-13-1.0-min"
        , title = "stv 13 candidates stdev 1.0 with min party discipline"
        }
      , { filename = "stv-13-1.0-avg"
        , title = "stv 13 candidates stdev 1.0 with avg party discipline"
        }
      , { filename = "stv-13-0.5-normal", title = "stv 13 candidates stdev 0.5" }
      , { filename = "stv-13-0.5-min"
        , title = "stv 13 candidates stdev 0.5 with min party discipline"
        }
      , { filename = "stv-13-0.5-avg"
        , title = "stv 13 candidates stdev 0.5 with avg party discipline"
        }
      ]

let x = Prelude.List.map Text Text simple_template simple_subs

let y =
      Prelude.List.map
        Desc
        Text
        (\(x : Desc) -> template x.title x.filename)
        stv_subs

let z = Prelude.List.concat Text [ x, y ]

in  Prelude.Text.concat z
