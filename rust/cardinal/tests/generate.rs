use crate::{
    cardinal::{
        generate::generate_cardinal_ballots, strategy::CardinalStrategy,
    },
    types::{Party, SimulateElectionsArgs, XY},
};

#[test]
fn test_generate_cardinal_ballots() {
    let candidates = &[
        Party {
            x: -0.7,
            y: 0.7,
            coalition: None,
        },
        Party {
            x: 0.7,
            y: 0.7,
            coalition: None,
        },
        Party {
            x: 0.7,
            y: -0.7,
            coalition: None,
        },
        Party {
            x: -0.7,
            y: -0.7,
            coalition: None,
        },
    ];
    let voters = &[
        XY { x: -0.75, y: 0.75 },
        XY { x: 0.0, y: 0.0 },
        XY { x: 0.9, y: -0.9 },
        XY { x: -0.6, y: -0.6 },
    ];
    let mut ballots = vec![0.; voters.len() * candidates.len()];
    let args = SimulateElectionsArgs {
        n_seats: 0,
        n_voters: 0,
        stdev: 1.,
        parties: candidates,
        seed: None,
        party_of_cands: None,
        n_parties: None,
        #[cfg(feature = "wasm")]
        use_voters_sample: false,
    };
    generate_cardinal_ballots(
        voters,
        &args,
        &CardinalStrategy::Mean,
        &mut ballots,
    );
    #[rustfmt::skip]
    assert_eq!(
        ballots,
        vec![
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            0.0, 1.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0
        ]
    );
}
