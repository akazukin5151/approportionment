let Prelude =
      https://prelude.dhall-lang.org/v21.1.0/package.dhall
        sha256:0fed19a88330e9a8a3fbe1e8442aa11d12e38da51eb12ba8bcb56f3c25d0854a

let NonEmpty = Prelude.NonEmpty.Type

let schema = ./schema.dhall

let square_parties
    : NonEmpty schema.Party
    = { head = { x = -0.7, y = 0.7 }
      , tail =
        [ { x = 0.7, y = 0.7 }, { x = 0.7, y = -0.7 }, { x = -0.7, y = -0.7 } ]
      }

let equilateral_parties
    : NonEmpty schema.Party
    = { head = { x = 0.0, y = 0.7 }
      , tail =
        [ { x = -0.7, y = -0.7 }
        , { x = 0.7, y = -0.7 }
        ]
      }

let two_close_parties
    : NonEmpty schema.Party
    = { head = { x = -0.8, y = -0.6 }
      , tail =
        [ { x = -0.2, y = -0.7 }
        , { x = 0.0, y = -0.73 }
        ]
      }

let two_close_right_parties
    : NonEmpty schema.Party
    = { head = { x = -0.5, y = 0.0 }
      , tail =
        [ { x = 0.4, y = -0.1 }
        , { x = 0.5, y = 0.1 }
        ]
      }

let colinear_parties
    : NonEmpty schema.Party
    = { head = { x = -0.6, y = -0.6 }
      , tail =
        [ { x = 0.0, y = 0.0 }
        , { x = 0.2, y = 0.2 }
        ]
      }

let middle_four_parties
    : NonEmpty schema.Party
    = { head = { x = -0.6, y = -0.4 }
      , tail =
        [ { x = -0.3, y = -0.4 }
        , { x = 0.6, y = 0.5 }
        , { x = 0.8, y = -0.6 }
        ]
      }

let on_triangle_parties
    : NonEmpty schema.Party
    = { head = { x = -0.6, y = 0.2 }
      , tail =
        [ { x = -0.5, y = 0.18 }
        , { x = -0.4, y = -0.35 }
        , { x = 0.6, y = 0.07 }
        ]
      }

let tick_parties
    : NonEmpty schema.Party
    = { head = { x = -0.6, y = 0.3 }
      , tail =
        [ { x = -0.5, y = 0.2 }
        , { x = -0.1, y = 0.25 }
        , { x = 0.6, y = 0.35 }
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
