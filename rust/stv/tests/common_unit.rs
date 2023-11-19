#![allow(clippy::too_many_lines)]
#![allow(clippy::integer_division)]

use crate::{
    allocate::Allocate,
    stv::{australia::StvAustralia, party_discipline::PartyDiscipline},
};

// source:
// https://www.aec.gov.au/learn/files/poster-count-senate-pref-voting.pdf
#[test]
fn stv_australia_pdf() {
    // Voters with Kim as first preference
    // Total of 1250, which is Kim's first preference votes
    let mut ballots = vec![];
    ballots.extend([1, 0, 5, 5, 5].repeat(400));
    ballots.extend([1, 2, 5, 5, 5].repeat(150));
    ballots.extend([1, 3, 5, 5, 5].repeat(500));
    ballots.extend([1, 4, 5, 5, 5].repeat(200));

    ballots.extend([0, 5, 5, 5, 5].repeat(200));
    ballots.extend([2, 5, 5, 5, 5].repeat(350));
    ballots.extend([3, 5, 5, 5, 5].repeat(950));
    ballots.extend([4, 5, 5, 5, 5].repeat(250));

    let total_seats = 2;
    let n_candidates = 5;
    let n_voters = ballots.len() / n_candidates;
    let mut a =
        StvAustralia::new(n_voters, n_candidates, PartyDiscipline::None);
    a.ballots = ballots;
    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);
    assert_eq!(
        rounds,
        vec![
            vec![200., 1250., 350., 950., 250.],
            vec![279., 1001., 379., 1049., 289.]
        ]
    );
    assert_eq!(r, vec![0, 1, 0, 1, 0]);
}

// https://en.wikipedia.org/wiki/Single_transferable_vote#Example_for_a_non-partisan_election
#[test]
fn stv_australia_food() {
    let mut ballots = vec![];
    ballots.extend([0, 1, 7, 7, 7, 7, 7].repeat(4));
    ballots.extend([1, 2, 3, 7, 7, 7, 7].repeat(7));
    ballots.extend([2, 3, 1, 7, 7, 7, 7]);
    ballots.extend([3, 4, 2, 7, 7, 7, 7].repeat(3));
    ballots.extend([4, 3, 5, 7, 7, 7, 7]);
    ballots.extend([5, 7, 7, 7, 7, 7, 7].repeat(4));
    ballots.extend([6, 5, 7, 7, 7, 7, 7].repeat(3));

    let total_seats = 3;
    let n_candidates = 7;
    let n_voters = ballots.len() / n_candidates;
    let mut a =
        StvAustralia::new(n_voters, n_candidates, PartyDiscipline::None);
    a.ballots = ballots;
    let mut rounds = vec![];
    let r = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);
    assert_eq!(
        rounds,
        vec![
            vec![4., 7., 1., 3., 1., 4., 3.],
            vec![4., 6., 2., 3., 1., 4., 3.], // #1 is elected, surplus transferred to #2
            vec![4., 6., 2., 4., 0., 4., 3.], // #4 is eliminated, transferred to #3
            vec![4., 6., 0., 6., 0., 4., 3.], // #2 is eliminated, transferred to #3
            vec![4., 6., 0., 6., 0., 4., 3.], // #3 is elected, no surplus
            vec![4., 6., 0., 6., 0., 7., 0.], // #6 eliminated, transferred to #5,
                                              //  who is elected.
        ] // All 3 seats elected now so the election ends
    );
    assert_eq!(r, vec![0, 1, 0, 1, 0, 1, 0]);
}

#[test]
fn stv_transfers_dont_go_to_pending() {
    let ballots = vec![
        3, 0, 2, 1, 3, 2, 0, 1, 0, 3, 1, 2, 2, 3, 1, 0, 0, 1, 3, 2, 0, 3, 1, 2,
        0, 3, 1, 2, 3, 0, 2, 1, 0, 1, 3, 2, 0, 3, 1, 2,
    ];

    let total_seats = 3;
    let n_candidates = 4;
    let n_voters = ballots.len() / n_candidates;
    let mut a =
        StvAustralia::new(n_voters, n_candidates, PartyDiscipline::None);
    a.ballots = ballots;
    let mut rounds = vec![];
    let r1 = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);
    assert_eq!(
        rounds,
        vec![
            vec![6., 0., 1., 3.], // #0 and #3 is elected
            vec![3., 3., 1., 3.], // #0 transfers 3 votes to #1, #3 has no surplus
        ]
    );
    assert_eq!(r1, vec![1, 1, 0, 1])
}

#[test]
fn stv_first_valid_pref_is_isolated() {
    let ballots = vec![
        3, 0, 2, 1, 2, 3, 1, 0, 3, 0, 2, 1, 3, 2, 0, 1, 3, 2, 0, 1, 3, 2, 0, 1,
        0, 3, 1, 2, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 2, 3, 1, 0, 0, 3, 1, 2,
        3, 0, 2, 1, 2, 3, 1, 0, 3, 0, 2, 1, 0, 3, 1, 2, 0, 1, 3, 2, 3, 0, 2, 1,
        0, 3, 1, 2, 1, 2, 0, 3, 3, 0, 2, 1, 3, 2, 0, 1, 3, 2, 0, 1, 0, 3, 1, 2,
        3, 0, 2, 1, 0, 3, 1, 2, 0, 3, 1, 2, 2, 1, 3, 0, 3, 2, 0, 1, 3, 2, 0, 1,
        0, 3, 1, 2, 3, 0, 2, 1, 3, 0, 2, 1, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2,
        3, 0, 2, 1, 0, 1, 3, 2, 3, 0, 2, 1, 0, 3, 1, 2, 3, 0, 2, 1, 3, 2, 0, 1,
        3, 2, 0, 1, 3, 2, 0, 1, 0, 3, 1, 2, 3, 2, 0, 1, 3, 2, 0, 1, 1, 2, 0, 3,
        3, 2, 0, 1, 2, 3, 1, 0, 3, 0, 2, 1, 3, 2, 0, 1, 0, 1, 3, 2, 0, 3, 1, 2,
        3, 0, 2, 1, 3, 0, 2, 1, 2, 3, 1, 0, 0, 3, 1, 2, 3, 0, 2, 1, 0, 3, 1, 2,
        3, 2, 0, 1, 0, 1, 3, 2, 0, 3, 1, 2, 3, 0, 2, 1, 0, 3, 1, 2, 0, 1, 3, 2,
        3, 0, 2, 1, 3, 0, 2, 1, 3, 2, 0, 1, 2, 3, 1, 0, 3, 0, 2, 1, 1, 0, 2, 3,
        0, 3, 1, 2, 0, 3, 1, 2, 3, 0, 2, 1, 1, 2, 0, 3, 3, 0, 2, 1, 1, 2, 0, 3,
        3, 0, 2, 1, 0, 3, 1, 2, 3, 0, 2, 1, 3, 2, 0, 1, 0, 3, 1, 2, 0, 3, 1, 2,
        3, 0, 2, 1, 1, 2, 0, 3, 0, 3, 1, 2, 1, 2, 0, 3, 3, 2, 0, 1, 3, 0, 2, 1,
        0, 3, 1, 2, 3, 0, 2, 1, 3, 2, 0, 1, 0, 3, 1, 2, 2, 1, 3, 0, 0, 3, 1, 2,
        3, 0, 2, 1, 3, 0, 2, 1, 0, 3, 1, 2, 3, 2, 0, 1,
    ];

    let total_seats = 3;
    let n_candidates = 4;
    let n_voters = ballots.len() / n_candidates;
    let mut a =
        StvAustralia::new(n_voters, n_candidates, PartyDiscipline::None);
    a.ballots = ballots;
    let mut rounds = vec![];
    let r1 = a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);
    assert_eq!(
        rounds,
        vec![vec![33., 7., 8., 52.], vec![26., 14., 34., 26.]]
    );
    assert_eq!(r1, vec![1, 0, 1, 1]);
}
