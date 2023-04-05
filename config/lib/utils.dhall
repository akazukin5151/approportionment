let schema = ./schema.dhall

let all_methods
    : List schema.AllocationMethod
    = -- This does not include candidate based methods as they need
      -- very different set of "parties" (candidates)
      [ schema.AllocationMethod.DHondt
      , schema.AllocationMethod.WebsterSainteLague
      , schema.AllocationMethod.Droop
      , schema.AllocationMethod.Hare
      ]

in  { all_methods }
