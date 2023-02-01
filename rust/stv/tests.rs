use crate::stv::*;
use crate::*;

#[test]
fn stv_australia_pdf() {
    // Voters with Kim as first preference
    // Total of 1250, which is Kim's first preference votes
    let mut ballots = vec![StvBallot(vec![1, 0]); 400];
    ballots.extend(vec![StvBallot(vec![1, 2]); 150]);
    ballots.extend(vec![StvBallot(vec![1, 3]); 500]);
    ballots.extend(vec![StvBallot(vec![1, 4]); 200]);

    ballots.extend(vec![StvBallot(vec![0]); 200]);
    ballots.extend(vec![StvBallot(vec![2]); 350]);
    ballots.extend(vec![StvBallot(vec![3]); 950]);
    ballots.extend(vec![StvBallot(vec![4]); 250]);

    let total_seats = 2;
    let n_candidates = 5;
    let mut a = StvAustralia::new(ballots.len());
    a.0 = ballots;
    let r = a.allocate_seats(total_seats, n_candidates);
    assert_eq!(r, vec![0, 1, 0, 1, 0]);
}

#[test]
fn stv_australia_food() {
    let mut ballots = vec![StvBallot(vec![0, 1]); 4];
    ballots.extend(vec![StvBallot(vec![1, 2, 3]); 7]);
    ballots.extend(vec![StvBallot(vec![2, 3, 1]); 1]);
    ballots.extend(vec![StvBallot(vec![3, 4, 2]); 3]);
    ballots.extend(vec![StvBallot(vec![4, 3, 5]); 1]);
    ballots.extend(vec![StvBallot(vec![5]); 4]);
    ballots.extend(vec![StvBallot(vec![6, 5]); 3]);

    let total_seats = 3;
    let n_candidates = 7;
    let mut a = StvAustralia::new(ballots.len());
    a.0 = ballots;
    let r = a.allocate_seats(total_seats, n_candidates);
    assert_eq!(r, vec![0, 1, 0, 1, 0, 1, 0]);
}

#[test]
fn stv_australia_web_simple() {
    let parties = vec![
        XY { x: -0.7, y: 0.7 },
        XY { x: 0.7, y: 0.7 },
        XY { x: 0.7, y: -0.7 },
        XY { x: -0.7, y: -0.7 },
    ];
    let mut a = StvAustralia::new(100);
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
    let mut a = StvAustralia::new(100);
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
    let mut a = StvAustralia::new(100);
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
    let mut a = StvAustralia::new(100);
    let _ = a.simulate_elections(4, 100, 1., &parties);
}

#[test]
fn stv_transfers_dont_go_to_pending() {
    let ballots = vec![
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![2, 3, 1, 0]),
        StvBallot(vec![0, 1, 3, 2]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![0, 1, 3, 2]),
        StvBallot(vec![0, 3, 1, 2]),
    ];

    let total_seats = 3;
    let n_candidates = 4;
    let mut a = StvAustralia::new(ballots.len());
    a.0 = ballots;
    let r1 = a.allocate_seats(total_seats, n_candidates);
    assert_eq!(r1, vec![1, 1, 0, 1])
}

#[test]
fn stv_first_valid_pref_is_isolated() {
    let ballots = vec![
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![2, 3, 1, 0]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![2, 3, 1, 0]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![2, 3, 1, 0]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![0, 1, 3, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![1, 2, 0, 3]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![2, 1, 3, 0]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![0, 1, 3, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![1, 2, 0, 3]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![2, 3, 1, 0]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![0, 1, 3, 2]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![2, 3, 1, 0]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![0, 1, 3, 2]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![0, 1, 3, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![2, 3, 1, 0]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![1, 0, 2, 3]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![1, 2, 0, 3]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![1, 2, 0, 3]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![1, 2, 0, 3]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![1, 2, 0, 3]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![3, 2, 0, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![2, 1, 3, 0]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![3, 0, 2, 1]),
        StvBallot(vec![0, 3, 1, 2]),
        StvBallot(vec![3, 2, 0, 1]),
    ];

    let total_seats = 3;
    let n_candidates = 4;
    let mut a = StvAustralia::new(ballots.len());
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
    let mut a = StvAustralia::new(100);
    let _ = a.simulate_elections(10, 100, 1., &parties);
}
