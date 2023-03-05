let Prelude =
      https://raw.githubusercontent.com/dhall-lang/dhall-lang/v21.1.0/Prelude/package.dhall

let NonEmpty = Prelude.NonEmpty.Type

let schema = ../lib/schema.dhall

let head =
      { x = -0.7
      , y = 0.7
      , color = Some { r = 191, g = 104, b = 119 }
      , name = None Text
      , coalition = Some 3
      }

let tail =
      [ { x = 0.7
        , y = 0.7
        , color = Some { r = 210, g = 64, b = 74 }
        , name = Some "C"
        , coalition = Some 0
        }
      , { x = 0.7
        , y = -0.7
        , color = Some { r = 201, g = 109, b = 59 }
        , name = None Text
        , coalition = Some 1
        }
      , { x = -0.7
        , y = -0.7
        , color = Some { r = 143, g = 125, b = 59 }
        , name = None Text
        , coalition = Some 2
        }
      , { x = -0.4
        , y = -0.6
        , color = Some { r = 75, g = 125, b = 64 }
        , name = None Text
        , coalition = Some 2
        }
      , { x = 0.4
        , y = 0.6
        , color = Some { r = 95, g = 188, b = 144 }
        , name = Some "B"
        , coalition = Some 0
        }
      , { x = -0.4
        , y = 0.5
        , color = Some { r = 114, g = 119, b = 202 }
        , name = None Text
        , coalition = Some 3
        }
      , { x = 0.4
        , y = -0.5
        , color = Some { r = 202, g = 89, b = 150 }
        , name = None Text
        , coalition = Some 1
        }
      ]

let extra_parties =
      [ { x = -0.9
        , y = 0.6
        , color = Some { r = 208, g = 166, b = 67 }
        , name = None Text
        , coalition = Some 3
        }
      , { x = 0.8
        , y = 0.6
        , color = Some { r = 149, g = 177, b = 61 }
        , name = Some "A"
        , coalition = Some 0
        }
      , { x = -0.8
        , y = -0.5
        , color = Some { r = 85, g = 183, b = 77 }
        , name = None Text
        , coalition = Some 2
        }
      , { x = 0.8
        , y = -0.5
        , color = Some { r = 77, g = 170, b = 207 }
        , name = None Text
        , coalition = Some 1
        }
      , { x = 0.0
        , y = -0.8
        , color = Some { r = 176, g = 92, b = 198 }
        , name = None Text
        , coalition = None Natural
        }
      ]

let make_stv_parties
    : Bool -> NonEmpty schema.Party
    = \(use_extra_parties : Bool) ->
        let extra =
              if    use_extra_parties
              then  extra_parties
              else  [] : List schema.Party

        let t = Prelude.List.concat schema.Party [ tail, extra ]

        in  { head, tail = t }

in  { make_stv_parties }
