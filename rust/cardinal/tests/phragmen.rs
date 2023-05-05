use crate::cardinal::{allocate::AllocateCardinal, phragmen::Phragmen};

#[test]
fn test_phragmen_1() {
    let n_voters = 1034 + 519 + 90 + 47;
    let n_seats = 3;
    let n_candidates = 6;
    let mut ballots: Vec<_> = vec![];
    ballots.extend_from_slice(&[1., 1., 1., 0., 0., 0.].repeat(1034));
    ballots.extend_from_slice(&[0., 0., 0., 1., 1., 1.].repeat(519));
    ballots.extend_from_slice(&[1., 1., 0., 0., 1., 0.].repeat(90));
    ballots.extend_from_slice(&[1., 0., 0., 1., 1., 0.].repeat(47));
    let mut a = Phragmen::new(n_voters, n_candidates);
    let r = a.allocate_cardinal(&mut ballots, n_seats, n_candidates, n_voters);
    assert_eq!(r, vec![1, 1, 0, 0, 1, 0]);
}

#[test]
fn test_phragmen_2() {
    let n_voters = 3 + 3 + 2 + 3;
    let n_seats = 4;
    let n_candidates = 7;
    let mut ballots: Vec<_> = vec![];
    ballots.extend_from_slice(&[1., 1., 0., 0., 0., 0., 0.].repeat(3));
    ballots.extend_from_slice(&[1., 0., 1., 0., 0., 0., 0.].repeat(3));
    ballots.extend_from_slice(&[1., 0., 0., 1., 0., 0., 0.].repeat(2));
    ballots.extend_from_slice(&[0., 1., 1., 0., 0., 1., 0.]);
    ballots.extend_from_slice(&[0., 0., 0., 0., 1., 0., 0.]);
    ballots.extend_from_slice(&[0., 0., 0., 0., 0., 1., 0.]);
    ballots.extend_from_slice(&[0., 0., 0., 0., 0., 0., 1.]);
    let mut a = Phragmen::new(n_voters, n_candidates);
    let r = a.allocate_cardinal(&mut ballots, n_seats, n_candidates, n_voters);
    //                 0, 1, 2, 3, 4, 5, 6
    //                 a, b, c, d, e, f, g
    assert_eq!(r, vec![1, 1, 1, 1, 0, 0, 0]);
}
