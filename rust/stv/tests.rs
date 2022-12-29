use crate::*;
use crate::stv::*;

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
    let r = StvAustralia.allocate_seats(ballots, total_seats, n_candidates);
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
    let r = StvAustralia.allocate_seats(ballots, total_seats, n_candidates);
    assert_eq!(r, vec![0, 1, 0, 1, 0, 1, 0]);
}

#[test]
fn stv_australia_web_simple() {
    let parties = vec![
        Party { x: -0.7, y: 0.7 },
        Party { x: 0.7, y: 0.7 },
        Party { x: 0.7, y: -0.7 },
        Party { x: -0.7, y: -0.7 },
    ];
    let _ = StvAustralia.simulate_elections(3, 100, &parties, &None);
}

#[test]
fn stv_australia_web_8_cands() {
    let parties = vec![
        Party { x: -0.7, y: 0.7 },
        Party { x: 0.7, y: 0.7 },
        Party { x: 0.7, y: -0.7 },
        Party { x: -0.7, y: -0.7 },
        Party { x: -0.4, y: -0.6 },
        Party { x: 0.3, y: -0.8 },
        Party { x: -0.4, y: 0.5 },
        Party { x: 0.3, y: -0.6 },
    ];
    let _ = StvAustralia.simulate_elections(3, 100, &parties, &None);
}