#![allow(clippy::too_many_lines)]
#![allow(clippy::integer_division)]

use crate::stv::*;
use crate::*;

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

// https://www.aec.gov.au/learn/files/poster-count-senate-pref-voting.pdf
#[test]
fn stv_australia_pdf() {
    // Voters with Kim as first preference
    // Total of 1250, which is Kim's first preference votes
    let mut ballots = vec![];
    ballots.extend([1, 0, /**/ 2, 3, 4].repeat(400));
    ballots.extend([1, 2, /**/ 0, 3, 4].repeat(150));
    ballots.extend([1, 3, /**/ 0, 2, 4].repeat(500));
    ballots.extend([1, 4, /**/ 0, 2, 3].repeat(200));

    ballots.extend([0, /**/ 1, 2, 3, 4].repeat(200));
    ballots.extend([2, /**/ 0, 1, 3, 4].repeat(350));
    ballots.extend([3, /**/ 0, 1, 2, 4].repeat(950));
    ballots.extend([4, /**/ 0, 1, 2, 3].repeat(250));

    let total_seats = 2;
    let n_candidates = 5;
    let n_voters = ballots.len() / n_candidates;
    let mut a = StvAustralia::new(n_voters, n_candidates);
    a.ballots = ballots;
    let mut rounds = vec![];
    let r = allocate_seats_stv(
        &a.ballots,
        total_seats,
        n_candidates,
        n_voters,
        &mut rounds,
    );
    assert_eq!(
        rounds,
        vec![
            vec![200, 1250, 350, 950, 250],
            vec![279, 1001, 379, 1049, 289]
        ]
    );
    assert_eq!(r, vec![0, 1, 0, 1, 0]);
}

// https://en.wikipedia.org/wiki/Single_transferable_vote#Example_for_a_non-partisan_election
// originally this had exhausted votes, but the flattened ballots forced
// voters to fill out their entire ballot. I filled them out in no particular order,
// just to satisfy the new constraint. The new ranks changes the results,
// but it is correct for these set of ballots
#[test]
fn stv_australia_food() {
    let mut ballots = vec![];
    ballots.extend([0, 1, 2, 3, 4, 5, 6].repeat(4));
    ballots.extend([1, 2, 3, 0, 4, 5, 6].repeat(7));
    ballots.extend([2, 3, 1, 0, 4, 5, 6]);
    ballots.extend([3, 4, 2, 0, 1, 5, 6].repeat(3));
    ballots.extend([4, 3, 5, 0, 1, 2, 6]);
    ballots.extend([5, 0, 1, 2, 3, 4, 6].repeat(4));
    ballots.extend([6, 5, 0, 1, 2, 3, 4].repeat(3));

    let total_seats = 3;
    let n_candidates = 7;
    let n_voters = ballots.len() / n_candidates;
    let mut a = StvAustralia::new(n_voters, n_candidates);
    a.ballots = ballots;
    let mut rounds = vec![];
    let r = allocate_seats_stv(
        &a.ballots,
        total_seats,
        n_candidates,
        n_voters,
        &mut rounds,
    );
    assert_eq!(
        rounds,
        vec![
            vec![4, 7, 1, 3, 1, 4, 3],
            vec![4, 6, 2, 3, 1, 4, 3], // #1 is elected, surplus transferred to #2
            vec![4, 6, 2, 4, 0, 4, 3], // #4 is eliminated, transferred to #3
            vec![4, 6, 0, 6, 0, 4, 3], // #2 is eliminated, transferred to #3
            vec![4, 6, 0, 6, 0, 4, 3], // #3 is elected, no surplus
            vec![4, 6, 0, 6, 0, 7, 0], // #6 eliminated, transferred to #5,
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
    let mut a = StvAustralia::new(n_voters, n_candidates);
    a.ballots = ballots;
    let mut rounds = vec![];
    let r1 = allocate_seats_stv(
        &a.ballots,
        total_seats,
        n_candidates,
        n_voters,
        &mut rounds,
    );
    assert_eq!(
        rounds,
        vec![
            vec![6, 0, 1, 3], // #0 and #3 is elected
            vec![3, 3, 1, 3], // #0 transfers 3 votes to #1, #3 has no surplus
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
    let mut a = StvAustralia::new(n_voters, n_candidates);
    a.ballots = ballots;
    let mut rounds = vec![];
    let r1 = allocate_seats_stv(
        &a.ballots,
        total_seats,
        n_candidates,
        n_voters,
        &mut rounds,
    );
    assert_eq!(rounds, vec![vec![33, 7, 8, 52], vec![26, 14, 34, 26]]);
    assert_eq!(r1, vec![1, 0, 1, 1])
}

#[test]
fn stv_australia_tie() {
    let mut ballots = vec![];
    ballots.extend([0, 1, 2, 3, 4, 5, 6].repeat(3));
    ballots.extend([1, 2, 3, 0, 4, 5, 6].repeat(4));
    ballots.extend([1, 6, 3, 0, 4, 5, 2].repeat(4));
    ballots.extend([2, 3, 1, 0, 4, 5, 6]);
    ballots.extend([3, 4, 2, 0, 1, 5, 6].repeat(3));
    ballots.extend([4, 3, 5, 0, 1, 2, 6]);
    ballots.extend([5, 0, 1, 2, 3, 4, 6].repeat(4));

    // 20 voters, 3 seats, so quota is still 6
    let total_seats = 3;
    let n_candidates = 7;
    let n_voters = ballots.len() / n_candidates;
    let mut a = StvAustralia::new(n_voters, n_candidates);
    a.ballots = ballots;
    let mut rounds = vec![];
    let r = allocate_seats_stv(
        &a.ballots,
        total_seats,
        n_candidates,
        n_voters,
        &mut rounds,
    );
    assert_eq!(
        rounds,
        vec![
            vec![3, 8, 1, 3, 1, 4, 0],
            // #1 is elected, with a surplus of 2, which is transferred to #2 and #6
            vec![3, 6, 2, 3, 1, 4, 1],
            // there is a tie in choosing to eliminate #4 or #6
            // so we look at previous rounds. In the previous round, #6 has less
            // votes so #6 is chosen to be eliminated
            vec![3, 6, 2, 4, 1, 4, 0], // eliminate #6
            vec![3, 6, 2, 5, 0, 4, 0], // eliminate #4
            vec![3, 6, 0, 7, 0, 4, 0], // eliminate #2
            vec![3, 6, 0, 6, 0, 4, 0], // elect #3, transfer value is 1/6
            // these are the ballots whose first valid preferences is #3:
            // [3, 4, 2, 0, 1, 5, 6].repeat(3);
            // [1, 6, 3, 0, 4, 5, 2].repeat(4);
            // [2, 3, 1, 0, 4, 5, 6];
            // [4, 3, 5, 0, 1, 2, 6];
            // [1, 2, 3, 0, 4, 5, 6].repeat(4);
            // as none of them are greater than or equal to 6,
            // all of them are floored to 0, resulting in 0 transfers
            vec![0, 6, 0, 6, 0, 7, 0], // eliminate #0, 3 votes transferred to #5,
                                       // who is elected
        ] // All 3 seats elected now so the election ends
    );
    assert_eq!(r, vec![0, 1, 0, 1, 0, 1, 0]);
}
