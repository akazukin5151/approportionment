use crate::types::Allocate;

// allocation algorithm is too slow for massive house sizes
// no parliament has more than a thousand members anyway
pub fn is_house_monotonic(
    x: impl Allocate,
    house_size_1: u32,
    house_size_2: u32,
    votes_1: usize,
    votes_2: usize,
    votes_3: usize,
    votes_4: usize,
) {
    let mut ballots = vec![0; votes_1];
    ballots.extend(vec![1; votes_2]);
    ballots.extend(vec![2; votes_3]);
    ballots.extend(vec![3; votes_4]);

    let r1 = x.allocate_seats(ballots.clone(), house_size_1, 4);
    let r2 = x.allocate_seats(ballots, house_size_2, 4);

    if house_size_2 > house_size_1 {
        let b = r1.iter().zip(r2).all(|(s1, s2)| s2 >= *s1);
        assert!(b)
    } else {
        let b = r1.iter().zip(r2).all(|(s1, s2)| s2 <= *s1);
        assert!(b)
    }
}
