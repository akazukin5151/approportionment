let Prelude =
      https://raw.githubusercontent.com/dhall-lang/dhall-lang/v21.1.0/Prelude/package.dhall

let NonEmpty = Prelude.NonEmpty.Type

let schema = ./lib/schema.dhall

let generic_colorschemes_with_palette =
      \(palette_name : Text) ->
      \(name : Text) ->
        [ { palette =
              schema.Palette.Discrete { party_to_colorize = "C", palette_name }
          , plot_out_dir = "examples/" ++ name ++ "/number-of-seats-d"
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

let stv_parties
    : Bool -> NonEmpty schema.Party
    = \(use_extra_parties : Bool) ->
        let extra =
              if    use_extra_parties
              then  extra_parties
              else  [] : List schema.Party

        let tail =
            -- I used https://medialab.github.io/iwanthue/ to generate the colors
              Prelude.List.concat
                schema.Party
                [ [ { x = 0.7
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
                , extra
                ]

        in  { head =
              { x = -0.7
              , y = 0.7
              , color = Some { r = 191, g = 104, b = 119 }
              , name = None Text
              , coalition = Some 3
              }
            , tail
            }

let generic_config =
      \(name : Text) ->
      \(stdev : Double) ->
      \(parties : NonEmpty schema.Party) ->
      \(rank_method : schema.RankMethod) ->
        { allocation_methods =
          [ schema.AllocationMethod.StvAustralia rank_method ]
        , colorschemes = generic_colorschemes_with_palette "Pastel1" name
        , data_out_dir = "out/" ++ name
        , n_seats = 3
        , n_voters = 10000
        , stdev
        , parties
        }

let simple =
      \(rank_method : schema.RankMethod) ->
      \(rank_name : Text) ->
        let f =
              \(stdev : Double) ->
              \(use_extra_parties : Bool) ->
                let n_cands = if use_extra_parties then "13" else "8"

                let name =
                      Prelude.Text.concatSep
                        "-"
                        [ "stv", n_cands, Prelude.Double.show stdev, rank_name ]

                in  generic_config
                      name
                      stdev
                      (stv_parties use_extra_parties)
                      rank_method

        in  [ f 1.0 False, f 0.5 False, f 1.0 True, f 0.5 True ]

let normal_ranks = { normal = 1.0, min_party = 0.0, avg_party = 0.0 }

let all_min_ranks = { normal = 0.0, min_party = 1.0, avg_party = 0.0 }

let all_avg_ranks = { normal = 0.0, min_party = 0.0, avg_party = 1.0 }

let configs
    : List schema.Config
    = Prelude.List.concat
        schema.Config
        [ simple normal_ranks "normal"
        , simple all_min_ranks "min"
        , simple all_avg_ranks "avg"
        ]

in  { configs }
