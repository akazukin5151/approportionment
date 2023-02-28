let Prelude = https://prelude.dhall-lang.org/v21.1.0/package.dhall

let NonEmpty = Prelude.NonEmpty.Type

let RankMethod = { normal : Double, min_party : Double, avg_party : Double }

let AllocationMethod
    : Type
    = < DHondt | WebsterSainteLague | Droop | Hare | StvAustralia : RankMethod >

let Rgb
    : Type
    = { r : Natural, g : Natural, b : Natural }

let Palette
    : Type
    = < Discrete : { party_to_colorize : Text, palette_name : Text }
      | Majority : { for_party : Text }
      >

let Colorscheme
    : Type
    = { palette : Palette, plot_out_dir : Text }

let Party
    : Type
    = -- Only x, y, and coalition is used in rust, the rest are for python
      { x : Double
      , y : Double
      , coalition : Optional Natural
      , name : Optional Text
      , color : Optional Rgb
      }

let Config
    : Type
    = { allocation_methods : List AllocationMethod
      , -- this isn't use in rust, only for python
        colorschemes : List Colorscheme
      , data_out_dir : Text
      , n_seats : Natural
      , n_voters : Natural
      , stdev : Double
      , parties : NonEmpty Party
      }

let Configs
    : Type
    = { configs : List Config }

in  { Rgb
    , Party
    , Colorscheme
    , Palette
    , AllocationMethod
    , Config
    , Configs
    , RankMethod
    }
