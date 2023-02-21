use std::iter::repeat_with;

use crate::Allocate;
use crate::{generators::generate_voters, stv, XY};
use approportionment_prev as prev;
use approportionment_prev::stv as stv_prev;
use prev::Allocate as _;

use proptest::prelude::*;

proptest! {
    #![proptest_config(ProptestConfig::with_cases(10000))]
    /// Use property based testing to test if the current STV algorithm
    /// give the same results as a previous version of the repo
    /// (exact version is pinned to a commit in Cargo.toml)
    ///
    /// Just because this test pass doesn't mean there are no regressions;
    /// because generating voters are not deterministic, it is always possible
    /// to miss certain combinations that fails the test case
    #[test]
    fn stv_equal(
        n_voters in 100..1000_usize,
        voter_mean_x in -100..100,
        voter_mean_y in -100..100,
        // cannot have more than 64 parties on 64-bit machines
        // change to 32 if on 32-bit
        n_parties in 4..64_usize,
    ) {
        let voter_mean = (voter_mean_x as f32 / 100., voter_mean_y as f32 / 100.);
        let stdev = 1.;
        let total_seats = 1;

        // 0 to 1 -> 0 to 2 -> -1 to 1
        let xs = repeat_with(fastrand::f32).take(n_parties).map(|x| 2. * x - 1.);
        let ys = repeat_with(fastrand::f32).take(n_parties).map(|x| 2. * x - 1.);
        let parties: Vec<_> = xs.zip(ys).map(|(x, y)| XY {x, y}).collect();
        let prev_parties: Vec<prev::XY> = parties
            .iter()
            .map(|a| prev::XY { x: a.x, y: a.y })
            .collect();

        let voters = generate_voters(voter_mean, n_voters, stdev);
        let prev_voters: Vec<prev::XY> = voters
            .iter()
            .map(|a| prev::XY { x: a.x, y: a.y })
            .collect();

        let mut a1 = <stv::StvAustralia as Allocate>::new(n_voters, parties.len());
        a1.generate_ballots(&voters, &parties);
        let b1: Vec<Vec<usize>> = a1.ballots().iter().map(|b| b.0.clone()).collect();

        let mut a2 =
            <stv_prev::StvAustralia as prev::Allocate>::new(n_voters, parties.len());
        a2.generate_ballots(&prev_voters, &prev_parties);
        let b2: Vec<Vec<usize>> = a2.ballots().iter().map(|b| b.0.clone()).collect();

        prop_assert_eq!(b1, b2);

        let r1 = a1.allocate_seats(total_seats, n_parties);
        let r2 = a2.allocate_seats(total_seats, n_parties);
        prop_assert_eq!(r1, r2);
    }
}

/// this function is just for debugging to run specific cases found by
/// the proptest
#[test]
#[ignore]
pub fn compare_stv_hardcoded() {
    let voter_mean = (-0.02, 0.54);
    let n_voters = 989;
    let stdev = 1.;
    let total_seats = 1;
    let parties = vec![
        XY { x: -0.7, y: 0.7 },
        XY { x: 0.7, y: 0.7 },
        XY { x: 0.7, y: -0.7 },
        XY { x: -0.7, y: -0.7 },
    ];
    let prev_parties: Vec<prev::XY> = parties
        .iter()
        .map(|a| prev::XY { x: a.x, y: a.y })
        .collect();

    //let ballots = generate_stv_ballots(&voters, &parties, &mut self.0);
    let n_parties = parties.len();

    let voters = generate_voters(voter_mean, n_voters, stdev);
    let prev_voters: Vec<prev::XY> =
        voters.iter().map(|a| prev::XY { x: a.x, y: a.y }).collect();
    //let ballots = generate_stv_ballots(&voters, &parties, &mut self.0);

    let mut a1 = <stv::StvAustralia as Allocate>::new(n_voters, parties.len());
    a1.generate_ballots(&voters, &parties);
    let b1: Vec<Vec<usize>> =
        a1.ballots().iter().map(|b| b.0.clone()).collect();

    let mut a2 = <stv_prev::StvAustralia as prev::Allocate>::new(
        n_voters,
        parties.len(),
    );
    a2.generate_ballots(&prev_voters, &prev_parties);
    let b2: Vec<Vec<usize>> =
        a2.ballots().iter().map(|b| b.0.clone()).collect();

    assert_eq!(b1, b2);

    let r1 = a1.allocate_seats(total_seats, n_parties);
    let r2 = a2.allocate_seats(total_seats, n_parties);
    assert_eq!(r1, r2);
}
