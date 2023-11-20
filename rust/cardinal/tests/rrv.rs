#![allow(clippy::too_many_lines)]

use crate::{
    allocate::Allocate,
    cardinal::{
        allocate::CardinalAllocator, strategy::CardinalStrategy, Cardinal,
    },
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
    let n_voters = 8;
    let n_candidates = 4;
    let mut a = Cardinal::new(
        n_voters,
        n_candidates,
        CardinalStrategy::NormedLinear,
        CardinalAllocator::ScoreFromOriginal,
    );
    a.ballots = ballots;

    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut vec![]);

    assert_eq!(r, vec![1, 0, 1, 1]);
}

// https://www.rangevoting.org/RRVr.html
#[test]
fn rrv_rangevoting_org() {
    let mut ballots: Vec<f32> = vec![];
    ballots.extend_from_slice(&[1., 0.9, 0.8, 0.1, 0.].repeat(60));
    ballots.extend_from_slice(&[0., 0., 0., 1., 1.].repeat(40));

    let total_seats = 3;
    let n_voters = 100;
    let n_candidates = 5;
    let mut a = Cardinal::new(
        n_voters,
        n_candidates,
        CardinalStrategy::NormedLinear,
        CardinalAllocator::ScoreFromOriginal,
    );
    a.ballots = ballots;

    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut vec![]);

    assert_eq!(r, vec![1, 1, 0, 1, 0]);
}

// https://bettervoting.org/do_sample
#[test]
fn rrv_bettervoting() {
    #[rustfmt::skip]
    let ballots: Vec<f32> = vec![
        9., 7., 9., 8., 9., 1., 2., 1., 1., 2., 0., 0., 0., 0., 0.,
        9., 8., 7., 9., 9., 1., 0., 1., 0., 1., 0., 1., 0., 1., 0.,
        8., 9., 9., 4., 8., 1., 1., 2., 1., 3., 1., 0., 0., 1., 0.,
        0., 0., 0., 0., 0., 9., 9., 8., 9., 9., 0., 0., 0., 0., 0.,
        0., 0., 0., 0., 0., 9., 2., 7., 7., 8., 0., 0., 1., 0., 0.,
        0., 0., 0., 0., 0., 9., 5., 8., 8., 4., 0., 1., 0., 0., 1.,
        0., 0., 0., 0., 0., 9., 8., 8., 8., 7., 0., 0., 0., 0., 0.,
        0., 0., 0., 0., 0., 7., 9., 9., 9., 9., 0., 2., 0., 0., 1.,
        0., 0., 0., 0., 0., 8., 9., 9., 9., 9., 0., 0., 0., 0., 0.,
        1., 1., 1., 1., 1., 0., 0., 0., 0., 0., 9., 9., 3., 9., 9.,
        2., 1., 1., 1., 0., 0., 0., 0., 0., 0., 8., 7., 8., 8., 8.,
        2., 2., 1., 2., 2., 0., 0., 0., 0., 1., 9., 8., 8., 9., 7.,
        3., 0., 4., 3., 2., 0., 0., 0., 0., 0., 9., 9., 8., 8., 9.,
    ];
    let ballots: Vec<f32> = ballots.iter().map(|x| x / 9.).collect();

    let n_voters = 13;
    let n_candidates = 15;
    let mut a = Cardinal::new(
        n_voters,
        n_candidates,
        CardinalStrategy::NormedLinear,
        CardinalAllocator::ScoreFromOriginal,
    );

    let total_seats = 3;
    a.ballots = ballots.clone();
    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

    assert_eq!(
        r,
        vec![
            0, 0, 0, 0, 0, // purples
            1, 0, 0, 0, 1, // oranges
            1, 0, 0, 0, 0 // yellows
        ]
    );

    let total_seats = 4;
    a.ballots = ballots.clone();
    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

    assert_eq!(
        r,
        vec![
            1, 0, 0, 0, 0, // purples
            1, 0, 0, 0, 1, // oranges
            1, 0, 0, 0, 0 // yellows
        ]
    );

    let total_seats = 5;
    a.ballots = ballots.clone();
    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

    assert_eq!(
        r,
        vec![
            1, 0, 0, 0, 0, // purples
            1, 0, 1, 0, 1, // oranges
            1, 0, 0, 0, 0 // yellows
        ]
    );

    let total_seats = 6;
    a.ballots = ballots.clone();
    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

    assert_eq!(
        r,
        vec![
            1, 0, 0, 0, 0, // purples
            1, 0, 1, 0, 1, // oranges
            1, 0, 0, 1, 0 // yellows
        ]
    );

    let total_seats = 7;
    a.ballots = ballots.clone();
    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

    assert_eq!(
        r,
        vec![
            1, 0, 0, 0, 0, // purples
            1, 0, 1, 1, 1, // oranges
            1, 0, 0, 1, 0 // yellows
        ]
    );

    let total_seats = 8;
    a.ballots = ballots.clone();
    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

    assert_eq!(
        r,
        vec![
            1, 0, 1, 0, 0, // purples
            1, 0, 1, 1, 1, // oranges
            1, 0, 0, 1, 0 // yellows
        ]
    );

    let total_seats = 9;
    a.ballots = ballots.clone();
    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

    assert_eq!(
        r,
        vec![
            1, 0, 1, 0, 0, // purples
            1, 0, 1, 1, 1, // oranges
            1, 1, 0, 1, 0 // yellows
        ]
    );


    let total_seats = 10;
    a.ballots = ballots.clone();
    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

    assert_eq!(
        r,
        vec![
            1, 0, 1, 0, 0, // purples
            1, 1, 1, 1, 1, // oranges
            1, 1, 0, 1, 0 // yellows
        ]
    );

    let total_seats = 11;
    a.ballots = ballots.clone();
    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

    assert_eq!(
        r,
        vec![
            1, 0, 1, 0, 1, // purples
            1, 1, 1, 1, 1, // oranges
            1, 1, 0, 1, 0 // yellows
        ]
    );

    let total_seats = 12;
    a.ballots = ballots.clone();
    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

    assert_eq!(
        r,
        vec![
            1, 0, 1, 0, 1, // purples
            1, 1, 1, 1, 1, // oranges
            1, 1, 0, 1, 1 // yellows
        ]
    );

    let total_seats = 13;
    a.ballots = ballots.clone();
    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

    assert_eq!(
        r,
        vec![
            1, 1, 1, 0, 1, // purples
            1, 1, 1, 1, 1, // oranges
            1, 1, 0, 1, 1 // yellows
        ]
    );

    let total_seats = 14;
    a.ballots = ballots;
    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

    assert_eq!(
        r,
        vec![
            1, 1, 1, 0, 1, // purples
            1, 1, 1, 1, 1, // oranges
            1, 1, 1, 1, 1 // yellows
        ]
    );

    // let rounds: Vec<Vec<_>> = rounds
    //     .iter()
    //     .map(|round| round.iter().map(|x| x * 9.).collect())
    //     .collect();
    // dbg!(rounds);
}
