let Prelude =
      https://prelude.dhall-lang.org/v21.1.0/package.dhall
        sha256:0fed19a88330e9a8a3fbe1e8442aa11d12e38da51eb12ba8bcb56f3c25d0854a

let NonEmpty = Prelude.NonEmpty.Type

let schema = ./schema.dhall

let utils = ./utils.dhall

let square_parties
    : NonEmpty schema.Party
    = { head = { x = -0.7, y = 0.7, name = "A", color = utils.red }
      , tail =
        [ { x = 0.7, y = 0.7, name = "B", color = utils.blue }
        , { x = 0.7, y = -0.7, name = "C", color = utils.green }
        , { x = -0.7, y = -0.7, name = "D", color = utils.orange }
        ]
      }

let equilateral_parties
    : NonEmpty schema.Party
    = { head = { x = 0.0, y = 0.7, name = "A", color = utils.red }
      , tail =
        [ { x = -0.7, y = -0.7, name = "B", color = utils.blue }
        , { x = 0.7, y = -0.7, name = "C", color = utils.green }
        ]
      }

let two_close_parties
    : NonEmpty schema.Party
    = { head = { x = -0.8, y = -0.6, name = "A", color = utils.red }
      , tail =
        [ { x = -0.2, y = -0.7, name = "C", color = utils.green }
        , { x = 0.0, y = -0.73, name = "B", color = utils.blue }
        ]
      }

let two_close_right_parties
    : NonEmpty schema.Party
    = { head = { x = -0.5, y = 0.0, name = "A", color = utils.red }
      , tail =
        [ { x = 0.4, y = -0.1, name = "C", color = utils.green }
        , { x = 0.5, y = 0.1, name = "B", color = utils.blue }
        ]
      }

let colinear_parties
    : NonEmpty schema.Party
    = { head = { x = -0.6, y = -0.6, name = "A", color = utils.red }
      , tail =
        [ { x = 0.0, y = 0.0, name = "C", color = utils.green }
        , { x = 0.2, y = 0.2, name = "B", color = utils.blue }
        ]
      }

let middle_four_parties
    : NonEmpty schema.Party
    = { head = { x = -0.6, y = -0.4, name = "A", color = utils.red }
      , tail =
        [ { x = -0.3, y = -0.4, name = "C", color = utils.green }
        , { x = 0.6, y = 0.5, name = "B", color = utils.blue }
        , { x = 0.8, y = -0.6, name = "D", color = utils.orange }
        ]
      }

let on_triangle_parties
    : NonEmpty schema.Party
    = { head = { x = -0.6, y = 0.2, name = "A", color = utils.red }
      , tail =
        [ { x = -0.5, y = 0.18, name = "C", color = utils.green }
        , { x = -0.4, y = -0.35, name = "B", color = utils.blue }
        , { x = 0.6, y = 0.07, name = "D", color = utils.orange }
        ]
      }

let tick_parties
    : NonEmpty schema.Party
    = { head = { x = -0.6, y = 0.3, name = "A", color = utils.red }
      , tail =
        [ { x = -0.5, y = 0.2, name = "C", color = utils.green }
        , { x = -0.1, y = 0.25, name = "B", color = utils.blue }
        , { x = 0.6, y = 0.35, name = "D", color = utils.orange }
        ]
      }

in  { square_parties
    , equilateral_parties
    , two_close_parties
    , two_close_right_parties
    , colinear_parties
    , middle_four_parties
    , on_triangle_parties
    , tick_parties
    }
