use crate::types::Allocate;

/// house sizes should be less than 1000 because the
/// allocation algorithm is too slow for massive house sizes
/// no parliament has more than a thousand members anyway
///
/// the ith element in `all_votes` is the number of votes for the ith party
/// so the len of `all_votes` is the number of parties
/// just keep it to a sensible number
pub fn is_house_monotonic(
    x: impl Allocate,
    house_size_1: u32,
    house_size_2: u32,
    all_votes: Vec<usize>,
) {
    let n_parties = all_votes.len();
    let mut ballots = vec![];
    for (idx, votes) in all_votes.iter().enumerate() {
        ballots.extend(vec![idx; *votes]);
    }

    let r1 = x.allocate_seats(ballots.clone(), house_size_1, n_parties);
    let r2 = x.allocate_seats(ballots, house_size_2, n_parties);

    let b = if house_size_2 > house_size_1 {
        r1.iter().zip(r2).all(|(s1, s2)| s2 >= *s1)
    } else {
        r1.iter().zip(r2).all(|(s1, s2)| s2 <= *s1)
    };
    assert!(b)
}

pub fn satisfies_quota_rule(
    x: impl Allocate,
    house_size: u32,
    votes_1: usize,
    votes_2: usize,
    votes_3: usize,
    votes_4: usize,
) {
    let mut ballots = vec![0; votes_1];
    ballots.extend(vec![1; votes_2]);
    ballots.extend(vec![2; votes_3]);
    ballots.extend(vec![3; votes_4]);

    let r = x.allocate_seats(ballots, house_size, 4);

    let all_votes = [votes_1, votes_2, votes_3, votes_4];
    let total_votes: usize = all_votes.iter().sum();
    for (s, v) in r.iter().zip(all_votes) {
        let prop_of_votes = v as f64 / total_votes as f64;
        let prop_of_seats = prop_of_votes * (house_size as f64);
        let s = *s as f64;
        let b = s == prop_of_seats.floor() || s == prop_of_seats.ceil();
        // TODO: Droop violates quota rule?
        if !b {
            dbg!(s);
            dbg!(prop_of_votes);
            dbg!(house_size as f64);
            dbg!(prop_of_seats);
            dbg!(prop_of_seats.floor());
            dbg!(prop_of_seats.ceil());
        }
        assert!(b)
    }
}
