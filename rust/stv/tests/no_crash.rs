use crate::{
    allocate::Allocate,
    methods::RankMethod,
    stv::australia::StvAustralia,
    types::{Party, SimulateElectionsArgs},
};

pub const PARTIES_4: &[Party; 4] = &[
    Party {
        x: -0.7,
        y: 0.7,
        #[cfg(feature = "stv_party_discipline")]
        coalition: None,
    },
    Party {
        x: 0.7,
        y: 0.7,
        #[cfg(feature = "stv_party_discipline")]
        coalition: None,
    },
    Party {
        x: 0.7,
        y: -0.7,
        #[cfg(feature = "stv_party_discipline")]
        coalition: None,
    },
    Party {
        x: -0.7,
        y: -0.7,
        #[cfg(feature = "stv_party_discipline")]
        coalition: None,
    },
];

// some ranks in the ballots are irrelevant to the tests,
// but must be in the ballots to satisfy the invariant property:
// the ballots vec represents `n_candidates` columns and `n_voters` rows.
// this forces all voters to rank all candidates, which is what the simulation does;
// real world elections might not require this, but this is out of scope
//
// the tests indicates which values are irrelevant like this:
// [1, 0, /**/ 2, 3, 4]
// the values on the left of the comment are relevant,
// the values on the right of the comment are irrelevant padding

#[test]
fn stv_australia_web_simple() {
    let parties = PARTIES_4;
    let mut a = StvAustralia::new(100, parties.len(), RankMethod::default());
    let args = SimulateElectionsArgs {
        n_seats: 3,
        n_voters: 100,
        stdev: 1.,
        parties,
        seed: None,
        #[cfg(any(feature = "use_voter_sample", feature = "wasm"))]
        use_voters_sample: false,
        #[cfg(feature = "stv_party_discipline")]
        party_of_cands: &[],
        #[cfg(feature = "stv_party_discipline")]
        n_parties: 0,
    };
    let _ = a.simulate_elections(&args);
}

#[test]
fn stv_australia_web_8_cands() {
    let parties = vec![
        Party {
            x: -0.7,
            y: 0.7,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: 0.7,
            y: 0.7,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: 0.7,
            y: -0.7,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: -0.7,
            y: -0.7,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: -0.4,
            y: -0.6,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: 0.3,
            y: -0.8,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: -0.4,
            y: 0.5,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: 0.3,
            y: -0.6,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
    ];
    let mut a = StvAustralia::new(100, parties.len(), RankMethod::default());
    let args = SimulateElectionsArgs {
        n_seats: 3,
        n_voters: 100,
        stdev: 1.,
        parties: &parties,
        seed: None,
        #[cfg(any(feature = "use_voter_sample", feature = "wasm"))]
        use_voters_sample: false,
        #[cfg(feature = "stv_party_discipline")]
        party_of_cands: &[],
        #[cfg(feature = "stv_party_discipline")]
        n_parties: 0,
    };
    let _ = a.simulate_elections(&args);
}

#[test]
fn stv_australia_web_equal_seats_and_cands() {
    let parties = PARTIES_4;
    let mut a = StvAustralia::new(100, parties.len(), RankMethod::default());
    let args = SimulateElectionsArgs {
        n_seats: 5,
        n_voters: 100,
        stdev: 1.,
        parties,
        seed: None,
        #[cfg(any(feature = "use_voter_sample", feature = "wasm"))]
        use_voters_sample: false,
        #[cfg(feature = "stv_party_discipline")]
        party_of_cands: &[],
        #[cfg(feature = "stv_party_discipline")]
        n_parties: 0,
    };
    let _ = a.simulate_elections(&args);
}

#[test]
fn stv_australia_web_over_eager_eliminations() {
    let parties = PARTIES_4;
    let mut a = StvAustralia::new(100, parties.len(), RankMethod::default());
    let args = SimulateElectionsArgs {
        n_seats: 4,
        n_voters: 100,
        stdev: 1.,
        parties,
        seed: None,
        #[cfg(any(feature = "use_voter_sample", feature = "wasm"))]
        use_voters_sample: false,
        #[cfg(feature = "stv_party_discipline")]
        party_of_cands: &[],
        #[cfg(feature = "stv_party_discipline")]
        n_parties: 0,
    };
    let _ = a.simulate_elections(&args);
}

#[test]
fn stv_australia_web_under_election() {
    let parties = vec![
        Party {
            x: -0.70,
            y: 0.70,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: 0.74,
            y: 0.66,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: 0.70,
            y: -0.70,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: -0.70,
            y: -0.70,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: -0.52,
            y: 0.55,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: 0.70,
            y: 0.90,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: 0.76,
            y: -0.48,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: -0.49,
            y: -0.58,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: 0.80,
            y: 0.40,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: -0.90,
            y: -0.70,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: -0.70,
            y: 0.47,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
        Party {
            x: 0.46,
            y: -0.66,
            #[cfg(feature = "stv_party_discipline")]
            coalition: None,
        },
    ];
    let mut a = StvAustralia::new(100, parties.len(), RankMethod::default());
    let args = SimulateElectionsArgs {
        n_seats: 10,
        n_voters: 100,
        stdev: 1.,
        parties: &parties,
        seed: None,
        #[cfg(any(feature = "use_voter_sample", feature = "wasm"))]
        use_voters_sample: false,
        #[cfg(feature = "stv_party_discipline")]
        party_of_cands: &[],
        #[cfg(feature = "stv_party_discipline")]
        n_parties: 0,
    };
    let _ = a.simulate_elections(&args);
}
