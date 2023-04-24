use crate::{
    allocate::Allocate,
    cardinal::{
        allocate::CardinalAllocator, strategy::CardinalStrategy, Cardinal,
    },
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
        CardinalAllocator::StarPr,
    );
    a.ballots = ballots;
    let r = a.allocate_seats(n_seats, n_candidates, n_voters, &mut vec![]);
    // there is a tie for the last round so either is fine
    assert!(
        r == vec![1, 0, 0, 1, 0, 1, 0, 0]
            || r == vec![0, 0, 0, 1, 1, 1, 0, 0]
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
        CardinalAllocator::StarPr,
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
        CardinalAllocator::StarPr,
    );
    a.ballots = ballots;
    let r = a.allocate_seats(n_seats, n_candidates, n_voters, &mut vec![]);
    // the test result on github is different due to floating point issues
    // https://github.com/Equal-Vote/starpy/issues/23
    assert_eq!(r, vec![0, 0, 1, 0, 0, 0, 1, 1]);
}

