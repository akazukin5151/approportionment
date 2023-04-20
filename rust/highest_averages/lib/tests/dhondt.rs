use crate::allocate::Allocate;
use crate::highest_averages::{divisor::Divisor, lib::HighestAverages};

#[test]
fn test_dhondt_wikipedia() {
    let mut ballots = vec![0; 10_000];
    ballots.extend(vec![1; 8_000]);
    ballots.extend(vec![2; 3_000]);
    ballots.extend(vec![3; 2_000]);

    let mut a = HighestAverages::new(ballots.iter().sum(), Divisor::DHondt);
    a.0 = ballots;
    let r = a.allocate_seats(8, 4, 0, &mut vec![]);

    assert_eq!(r, vec![4, 3, 1, 0]);
}

#[test]
fn test_dhondt_uk_eu_10_seats() {
    let mut ballots = vec![0; 240];
    ballots.extend(vec![1; 220]);
    ballots.extend(vec![2; 130]);
    ballots.extend(vec![3; 100]);
    ballots.extend(vec![4; 70]);
    ballots.extend(vec![5; 60]);

    let mut a = HighestAverages::new(ballots.iter().sum(), Divisor::DHondt);
    a.0 = ballots;
    let r = a.allocate_seats(10, 6, 0, &mut vec![]);

    assert_eq!(r, vec![3, 3, 2, 1, 1, 0]);
}

#[test]
fn test_dhondt_uk_eu_5_seats() {
    let mut ballots = vec![0; 240];
    ballots.extend(vec![1; 220]);
    ballots.extend(vec![2; 130]);
    ballots.extend(vec![3; 100]);
    ballots.extend(vec![4; 70]);
    ballots.extend(vec![5; 60]);

    let mut a = HighestAverages::new(ballots.iter().sum(), Divisor::DHondt);
    a.0 = ballots;
    let r = a.allocate_seats(5, 6, 0, &mut vec![]);

    assert_eq!(r, vec![2, 2, 1, 0, 0, 0]);
}
