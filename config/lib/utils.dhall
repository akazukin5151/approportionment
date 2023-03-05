let schema = ./schema.dhall

let all_methods
    : List schema.AllocationMethod
    = -- This does not include StvAustralia because StvAustralia requires a
      -- very different set of parties than non STV methods
      [ schema.AllocationMethod.DHondt
      , schema.AllocationMethod.WebsterSainteLague
      , schema.AllocationMethod.Droop
      , schema.AllocationMethod.Hare
      ]

in  { all_methods }
