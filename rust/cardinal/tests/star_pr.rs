use crate::{
    allocate::Allocate,
    cardinal::{
        allocate::CardinalAllocator, reweighter::ReweightMethod,
        strategy::CardinalStrategy, Cardinal,
    },
    generators::generate_voters,
    types::{Party, SimulateElectionsArgs},
};

// https://github.com/Equal-Vote/star-core/blob/9a554932e4fc7ae9d6eb295fa1076437c812f5ce/src/Tests/pr.test.js

#[test]
fn reweight_star_pr_1() {
    #[rustfmt::skip]
    let mut ballots = vec![
        4., 0., 3., 3., 3., 1., 3., 2.,
        4., 0., 0., 4., 2., 1., 0., 1.,
        1., 0., 1., 4., 3., 0., 3., 0.,
        2., 3., 0., 1., 3., 3., 3., 0.,
        1., 1., 1., 0., 2., 4., 3., 3.,
        2., 4., 2., 0., 0., 4., 0., 4.,
        1., 4., 1., 2., 2., 0., 1., 1.,
        1., 1., 3., 3., 2., 3., 0., 3.,
        4., 1., 2., 4., 3., 4., 4., 4.,
        3., 4., 4., 4., 0., 4., 3., 2.,
        0., 1., 1., 3., 0., 0., 1., 2.,
        4., 2., 0., 3., 2., 2., 0., 1.,
        0., 2., 2., 3., 2., 3., 2., 1.,
        2., 3., 3., 3., 2., 3., 4., 1.,
        2., 3., 1., 2., 1., 4., 2., 3.
    ];

    // the ballot actually has 0 to 5 stars inclusive, so 6 stars in total
    ballots.iter_mut().for_each(|x| *x /= 5.);
    let n_voters = 15;
    let n_candidates = 8;
    let n_seats = 3;
    let mut a = Cardinal::new(
        n_voters,
        n_candidates,
        CardinalStrategy::NormedLinear,
        CardinalAllocator::IterativeReweight(ReweightMethod::StarPr),
    );
    a.ballots = ballots;
    let r = a.allocate_seats(n_seats, n_candidates, n_voters, &mut vec![]);
    // there is a tie for the last round so either is fine
    assert!(
        r == vec![1, 0, 0, 1, 0, 1, 0, 0] || r == vec![0, 0, 0, 1, 1, 1, 0, 0]
    );
}

#[test]
fn reweight_star_pr_2() {
    #[rustfmt::skip]
    let mut ballots = vec![
        3., 4., 0., 1., 3., 0., 0., 1.,
        4., 4., 1., 2., 4., 2., 4., 3.,
        4., 2., 4., 2., 4., 1., 1., 0.,
        1., 1., 1., 1., 0., 4., 1., 0.,
        0., 3., 2., 1., 0., 3., 1., 1.,
        3., 4., 0., 1., 3., 4., 2., 4.,
        0., 3., 1., 2., 0., 4., 1., 2.,
        2., 1., 0., 1., 3., 4., 3., 1.,
        3., 0., 0., 2., 2., 1., 3., 4.,
        2., 0., 0., 1., 1., 3., 0., 0.,
        4., 2., 4., 3., 3., 0., 3., 4.,
        3., 4., 4., 4., 1., 0., 4., 2.,
        0., 2., 4., 1., 1., 0., 2., 4.,
        4., 0., 4., 1., 4., 1., 0., 2.,
        3., 1., 2., 4., 4., 2., 2., 0.,
    ];

    ballots.iter_mut().for_each(|x| *x /= 5.);
    let n_voters = 15;
    let n_candidates = 8;
    let n_seats = 3;
    let mut a = Cardinal::new(
        n_voters,
        n_candidates,
        CardinalStrategy::NormedLinear,
        CardinalAllocator::IterativeReweight(ReweightMethod::StarPr),
    );
    a.ballots = ballots;
    let r = a.allocate_seats(n_seats, n_candidates, n_voters, &mut vec![]);
    assert_eq!(r, vec![1, 1, 0, 0, 0, 1, 0, 0]);
}

#[test]
fn reweight_star_pr_3() {
    #[rustfmt::skip]
    let mut ballots = vec![
        0., 0., 3., 2., 3., 0., 2., 1.,
        3., 2., 4., 4., 4., 3., 4., 2.,
        3., 3., 2., 1., 2., 4., 3., 0.,
        4., 3., 1., 2., 0., 4., 4., 2.,
        4., 2., 1., 0., 2., 2., 1., 0.,
        1., 0., 2., 1., 1., 1., 4., 2.,
        3., 0., 3., 0., 2., 2., 0., 4.,
        2., 0., 2., 4., 1., 3., 0., 2.,
        1., 4., 0., 1., 1., 1., 2., 4.,
        2., 3., 4., 2., 0., 2., 3., 3.,
        0., 0., 3., 3., 0., 0., 2., 3.,
        1., 2., 3., 4., 3., 3., 1., 4.,
        2., 3., 0., 0., 2., 4., 4., 3.,
        2., 1., 1., 1., 2., 1., 3., 0.,
        1., 0., 4., 3., 1., 3., 0., 0.,
    ];

    ballots.iter_mut().for_each(|x| *x /= 5.);
    let n_voters = 15;
    let n_candidates = 8;
    let n_seats = 3;
    let mut a = Cardinal::new(
        n_voters,
        n_candidates,
        CardinalStrategy::NormedLinear,
        CardinalAllocator::IterativeReweight(ReweightMethod::StarPr),
    );
    a.ballots = ballots;
    let r = a.allocate_seats(n_seats, n_candidates, n_voters, &mut vec![]);
    // the test result on github is different due to floating point issues
    // https://github.com/Equal-Vote/starpy/issues/23
    assert_eq!(r, vec![0, 0, 1, 0, 0, 0, 1, 1]);
}

const PARTIES_8: &[Party; 8] = &[
    Party {
        x: -0.7,
        y: 0.7,
        coalition: Some(3),
    },
    Party {
        x: 0.7,
        y: 0.7,
        coalition: Some(0),
    },
    Party {
        x: 0.7,
        y: -0.7,
        coalition: Some(1),
    },
    Party {
        x: -0.7,
        y: -0.7,
        coalition: Some(2),
    },
    Party {
        x: -0.4,
        y: -0.6,
        coalition: Some(2),
    },
    Party {
        x: 0.4,
        y: 0.6,
        coalition: Some(0),
    },
    Party {
        x: -0.4,
        y: 0.5,
        coalition: Some(3),
    },
    Party {
        x: 0.4,
        y: -0.5,
        coalition: Some(1),
    },
];

// this is just me verifying a weird result
//
// voters are overwhelmingly centered around a party. after all its candidates
// where elected, the next seat is given to the second furthest candidate from the
// voter mean. this is because all other candidates that were closer got
// reweighted due to contributing to the dominant party's victories.
//
// "a voter who gave 1/5 to the winner could lose all future influence, but
// not for a voter who gave the winner 0/5"
//
// this is still "fine" because it's giving representation to an un-represented
// group of voters, no matter how tiny they are.
// it just looks weird on the diagram
//
// don't read too much into this, it's a 3 seat election so disproportionalities
// will happen anyway
#[test]
fn star_pr_weird() {
    let n_voters = 100;
    let n_candidates = 8;
    let n_seats = 3;
    let voters =
        generate_voters((-0.63, 0.63), n_voters, 1., (Some(8248), Some(3132)));
    let mut a = Cardinal::new(
        n_voters,
        n_candidates,
        CardinalStrategy::NormedLinear,
        CardinalAllocator::IterativeReweight(ReweightMethod::StarPr),
    );
    let args = SimulateElectionsArgs {
        n_seats: 0,
        n_voters,
        stdev: 1.,
        parties: PARTIES_8,
        seed: None,
        party_of_cands: None,
        n_parties: None,
    };
    a.generate_ballots(&voters, &args);
    // let b: Vec<_> = a.ballots.chunks_exact(n_candidates).collect();
    let r = a.allocate_seats(n_seats, n_candidates, n_voters, &mut vec![]);
    assert_eq!(r, vec![1, 0, 0, 0, 0, 0, 1, 1]);
}
