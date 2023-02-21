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
    a.0 = ballots;
    let r = a.allocate_seats(total_seats, n_candidates);
    assert_eq!(r, vec![0, 1, 0, 1, 0]);
}

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
    a.0 = ballots;
    let r = a.allocate_seats(total_seats, n_candidates);
    assert_eq!(r, vec![1, 1, 0, 1, 0, 0, 0]);
}

#[test]
fn stv_australia_web_simple() {
    let parties = vec![
        XY { x: -0.7, y: 0.7 },
        XY { x: 0.7, y: 0.7 },
        XY { x: 0.7, y: -0.7 },
        XY { x: -0.7, y: -0.7 },
    ];
    let mut a = StvAustralia::new(100, parties.len());
    let _ = a.simulate_elections(3, 100, 1., &parties);
}

#[test]
fn stv_australia_web_8_cands() {
    let parties = vec![
        XY { x: -0.7, y: 0.7 },
        XY { x: 0.7, y: 0.7 },
        XY { x: 0.7, y: -0.7 },
        XY { x: -0.7, y: -0.7 },
        XY { x: -0.4, y: -0.6 },
        XY { x: 0.3, y: -0.8 },
        XY { x: -0.4, y: 0.5 },
        XY { x: 0.3, y: -0.6 },
    ];
    let mut a = StvAustralia::new(100, parties.len());
    let _ = a.simulate_elections(3, 100, 1., &parties);
}

#[test]
fn stv_australia_web_equal_seats_and_cands() {
    let parties = vec![
        XY { x: -0.7, y: 0.7 },
        XY { x: 0.7, y: 0.7 },
        XY { x: 0.7, y: -0.7 },
        XY { x: -0.7, y: -0.7 },
        XY { x: -0.7, y: 0.1 },
    ];
    let mut a = StvAustralia::new(100, parties.len());
    let _ = a.simulate_elections(5, 100, 1., &parties);
}

#[test]
fn stv_australia_web_over_eager_eliminations() {
    let parties = vec![
        XY { x: -0.7, y: 0.7 },
        XY { x: 0.7, y: 0.7 },
        XY { x: 0.7, y: -0.7 },
        XY { x: -0.7, y: -0.7 },
        XY { x: -0.7, y: 0.1 },
    ];
    let mut a = StvAustralia::new(100, parties.len());
    let _ = a.simulate_elections(4, 100, 1., &parties);
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
    a.0 = ballots;
    let r1 = a.allocate_seats(total_seats, n_candidates);
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
    a.0 = ballots;
    let r1 = a.allocate_seats(total_seats, n_candidates);
    assert_eq!(r1, vec![1, 0, 1, 1]);
}

#[test]
fn stv_australia_web_under_election() {
    let parties = vec![
        XY { x: -0.70, y: 0.70 },
        XY { x: 0.74, y: 0.66 },
        XY { x: 0.70, y: -0.70 },
        XY { x: -0.70, y: -0.70 },
        XY { x: -0.52, y: 0.55 },
        XY { x: 0.70, y: 0.90 },
        XY { x: 0.76, y: -0.48 },
        XY { x: -0.49, y: -0.58 },
        XY { x: 0.80, y: 0.40 },
        XY { x: -0.90, y: -0.70 },
        XY { x: -0.70, y: 0.47 },
        XY { x: 0.46, y: -0.66 },
    ];
    let mut a = StvAustralia::new(100, parties.len());
    let _ = a.simulate_elections(10, 100, 1., &parties);
}

