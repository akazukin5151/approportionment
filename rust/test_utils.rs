use crate::types::Allocate;

// allocation algorithm is too slow for massive house sizes
// no parliament has more than a thousand members anyway
pub fn is_house_monotonic(
    x: impl Allocate,
    house_size_1: u32,
    house_size_2: u32,
) {
    let mut ballots = vec![0; 10_000];
    ballots.extend(vec![1; 8_000]);
    ballots.extend(vec![2; 3_000]);
    ballots.extend(vec![3; 2_000]);

    let r1 = x.allocate_seats(ballots.clone(), house_size_1, 4);
    let r2 = x.allocate_seats(ballots, house_size_2, 4);

    if house_size_2 > house_size_1 {
        let b = r1.iter().zip(r2).into_iter().all(|(s1, s2)| s2 >= *s1);
        assert!(b)
    } else {
        let b = r1.iter().zip(r2).into_iter().all(|(s1, s2)| s2 <= *s1);
        assert!(b)
    }
}
