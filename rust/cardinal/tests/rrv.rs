use crate::{
    allocate::Allocate,
    cardinal::{strategy::CardinalStrategy, Cardinal},
};

// https://electowiki.org/wiki/Reweighted_range_voting
#[test]
fn rrv_electowiki() {
    #[rustfmt::skip]
    let ballots: Vec<f32> = vec![
        5., 0., 3., 5.,
        5., 0., 0., 4.,
        0., 5., 0., 1.,
        1., 2., 4., 3.,
        1., 0., 2., 0.,
        1., 3., 0., 1.,
        0., 0., 5., 0.,
        5., 0., 0., 4.,
    ];
    let ballots: Vec<_> = ballots.iter().map(|x| x / 5.).collect();

    let total_seats = 3;
    let n_voters = ballots.len();
    let n_candidates = 4;
    let mut a =
        Cardinal::new(n_voters, n_candidates, CardinalStrategy::NormedLinear);
    a.ballots = ballots;

    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

    assert_eq!(r, vec![1, 0, 1, 1]);
}

// https://www.rangevoting.org/RRVr.html
#[test]
fn rrv_rangevoting_org() {
    let mut ballots: Vec<f32> = vec![];
    ballots.extend_from_slice(&[1., 0.9, 0.8, 0.1, 0.].repeat(60));
    ballots.extend_from_slice(&[0., 0., 0., 1., 1.].repeat(40));

    let total_seats = 3;
    let n_voters = ballots.len();
    let n_candidates = 5;
    let mut a =
        Cardinal::new(n_voters, n_candidates, CardinalStrategy::NormedLinear);
    a.ballots = ballots;

    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

    assert_eq!(r, vec![1, 1, 0, 1, 0]);
}
