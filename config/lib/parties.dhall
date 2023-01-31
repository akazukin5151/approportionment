let Prelude =
      https://prelude.dhall-lang.org/v21.1.0/package.dhall

let NonEmpty = Prelude.NonEmpty.Type

let schema = ./schema.dhall

let utils = ./utils.dhall

let square_parties
    : NonEmpty schema.Party
    = { head = { x = -0.7, y = 0.7, name = Some "A", color = Some utils.red }
      , tail =
        [ { x = 0.7, y = 0.7, name = Some "B", color = Some utils.blue }
        , { x = 0.7, y = -0.7, name = Some "C", color = Some utils.green }
        , { x = -0.7, y = -0.7, name = Some "D", color = Some utils.orange }
        ]
      }

let equilateral_parties
    : NonEmpty schema.Party
    = { head = { x = 0.0, y = 0.7, name = Some "A", color = Some utils.red }
      , tail =
        [ { x = -0.7, y = -0.7, name = Some "B", color = Some utils.blue }
        , { x = 0.7, y = -0.7, name = Some "C", color = Some utils.green }
        ]
      }

let two_close_parties
    : NonEmpty schema.Party
    = { head = { x = -0.8, y = -0.6, name = Some "A", color = Some utils.red }
      , tail =
        [ { x = -0.2, y = -0.7, name = Some "C", color = Some utils.green }
        , { x = 0.0, y = -0.73, name = Some "B", color = Some utils.blue }
        ]
      }

let two_close_right_parties
    : NonEmpty schema.Party
    = { head = { x = -0.5, y = 0.0, name = Some "A", color = Some utils.red }
      , tail =
        [ { x = 0.4, y = -0.1, name = Some "C", color = Some utils.green }
        , { x = 0.5, y = 0.1, name = Some "B", color = Some utils.blue }
        ]
      }

let colinear_parties
    : NonEmpty schema.Party
    = { head = { x = -0.6, y = -0.6, name = Some "A", color = Some utils.red }
      , tail =
        [ { x = 0.0, y = 0.0, name = Some "C", color = Some utils.green }
        , { x = 0.2, y = 0.2, name = Some "B", color = Some utils.blue }
        ]
      }

let middle_four_parties
    : NonEmpty schema.Party
    = { head = { x = -0.6, y = -0.4, name = Some "A", color = Some utils.red }
      , tail =
        [ { x = -0.3, y = -0.4, name = Some "C", color = Some utils.green }
        , { x = 0.6, y = 0.5, name = Some "B", color = Some utils.blue }
        , { x = 0.8, y = -0.6, name = Some "D", color = Some utils.orange }
        ]
      }

let on_triangle_parties
    : NonEmpty schema.Party
    = { head = { x = -0.6, y = 0.2, name = Some "A", color = Some utils.red }
      , tail =
        [ { x = -0.5, y = 0.18, name = Some "C", color = Some utils.green }
        , { x = -0.4, y = -0.35, name = Some "B", color = Some utils.blue }
        , { x = 0.6, y = 0.07, name = Some "D", color = Some utils.orange }
        ]
      }

let tick_parties
    : NonEmpty schema.Party
    = { head = { x = -0.6, y = 0.3, name = Some "A", color = Some utils.red }
      , tail =
        [ { x = -0.5, y = 0.2, name = Some "C", color = Some utils.green }
        , { x = -0.1, y = 0.25, name = Some "B", color = Some utils.blue }
        , { x = 0.6, y = 0.35, name = Some "D", color = Some utils.orange }
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
