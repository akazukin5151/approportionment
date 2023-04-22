use crate::{
    allocate::Allocate,
    largest_remainder::{lib::LargestRemainders, quota::Quota},
};

#[test]
fn hare_quota_rounding_1() {
    let mut ballots = vec![0; 43704];
    ballots.extend(vec![1; 492884]);

    let mut a = LargestRemainders::new(ballots.iter().sum(), Quota::Hare);
    a.0 = ballots;
    let r = a.allocate_seats(883, 2, 0, &mut vec![]);

    assert_eq!(r, vec![72, 811]);
}

#[test]
fn hare_quota_rounding_2() {
    let mut ballots = vec![0; 160218];
    ballots.extend(vec![1; 164154]);

    let mut a = LargestRemainders::new(ballots.iter().sum(), Quota::Hare);
    a.0 = ballots;
    let r = a.allocate_seats(990, 2, 0, &mut vec![]);

    assert_eq!(r, vec![489, 501]);
}

#[test]
fn hare_wikipedia() {
    let mut ballots = vec![0; 47_000];
    ballots.extend(vec![1; 16_000]);
    ballots.extend(vec![2; 15_800]);
    ballots.extend(vec![3; 12_000]);
    ballots.extend(vec![4; 6100]);
    ballots.extend(vec![5; 3100]);

    let mut a = LargestRemainders::new(ballots.iter().sum(), Quota::Hare);
    a.0 = ballots;
    let r = a.allocate_seats(10, 6, 0, &mut vec![]);

    assert_eq!(r, vec![5, 2, 1, 1, 1, 0]);
}