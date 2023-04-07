use crate::{
    allocate::Allocate,
    cardinal::{
        generate::generate_cardinal_ballots, strategy::CardinalStrategy,
        Cardinal,
    },
    generators::generate_voters,
    rng::Fastrand,
    types::Party,
};

use rand::RngCore;

// https://en.wikipedia.org/wiki/Sequential_proportional_approval_voting
#[test]
fn spav_wikipedia() {
    let mut ballots: Vec<f32> = vec![];
    ballots.extend_from_slice(&[1., 1., 1., 0., 0., 0.].repeat(112));
    ballots.extend_from_slice(&[0., 1., 1., 0., 0., 0.].repeat(6));
    ballots.extend_from_slice(&[1., 1., 1., 1., 0., 0.].repeat(4));
    ballots.extend_from_slice(&[0., 0., 0., 1., 1., 1.].repeat(73));
    ballots.extend_from_slice(&[0., 0., 1., 1., 1., 1.].repeat(4));
    ballots.extend_from_slice(&[0., 0., 0., 1., 1., 0.]);

    let total_seats = 3;
    let n_voters = 200;
    let n_candidates = 6;
    let mut a = Cardinal::new(n_voters, n_candidates);
    a.ballots = ballots;

    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

    assert_eq!(r, vec![0, 1, 1, 1, 0, 0]);
}

// https://electowiki.org/wiki/Sequential_proportional_approval_voting
#[test]
fn spav_electowiki() {
    #[rustfmt::skip]
    let ballots: Vec<f32> = vec![
        1., 0., 0., 1.,
        0., 1., 0., 1.,
        1., 0., 1., 0.,
        1., 0., 1., 1.,
        0., 1., 0., 1.,
        1., 0., 1., 1.,
        1., 1., 0., 1.,
        0., 1., 0., 1.,
        1., 0., 0., 1.,
    ];

    let total_seats = 3;
    let n_voters = ballots.len();
    let n_candidates = 4;
    let mut a = Cardinal::new(n_voters, n_candidates);
    a.ballots = ballots;

    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

    assert_eq!(r, vec![1, 1, 0, 1]);
}

#[test]
fn spav_winners_are_not_double_counted() {
    let n_voters = 100;
    let n_candidates = 4;
    let total_seats = 3;

    let seed = 781348;
    let mut rng = Fastrand::new(Some(seed));
    let x_seed = rng.next_u64();
    let y_seed = rng.next_u64();
    let voters =
        generate_voters((0., 0.), n_voters, 1., (Some(x_seed), Some(y_seed)));

    let mut ballots = vec![0.; n_candidates * n_voters];
    generate_cardinal_ballots(
        &voters,
        &[
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
        ],
        &CardinalStrategy::Mean,
        &mut ballots,
    );

    let mut a = Cardinal::new(n_voters, n_candidates);
    a.ballots = ballots;
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut vec![]);
    assert_eq!(r, vec![1, 1, 0, 1])
}
