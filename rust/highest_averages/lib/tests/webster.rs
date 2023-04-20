use crate::allocate::Allocate;
use crate::highest_averages::{divisor::Divisor, lib::HighestAverages};

#[test]
fn test_webster_sainte_lague_wikipedia() {
    let mut ballots = vec![0; 10_000];
    ballots.extend(vec![1; 8_000]);
    ballots.extend(vec![2; 3_000]);
    ballots.extend(vec![3; 2_000]);

    let mut a =
        HighestAverages::new(ballots.iter().sum(), Divisor::SainteLague);
    a.0 = ballots;
    let r = a.allocate_seats(8, 4, 0, &mut vec![]);

    assert_eq!(r, vec![3, 3, 1, 1]);
}
