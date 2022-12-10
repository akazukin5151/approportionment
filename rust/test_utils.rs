//! house sizes should be less than 1000 because the
//! allocation algorithm is too slow for massive house sizes
//! no parliament has more than a thousand members anyway
//!
//! the ith element in `all_votes` is the number of votes for the ith party
//! so the len of `all_votes` is the number of parties
//! just keep it to a sensible number

use crate::types::Allocate;

pub fn is_house_monotonic(
    x: &impl Allocate,
    house_size_1: u32,
    house_size_2: u32,
    all_votes: Vec<usize>,
) {
    let r1 = run_election(x, house_size_1, all_votes.clone());
    let r2 = run_election(x, house_size_2, all_votes);

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
    all_votes: Vec<usize>,
) {
    let r = run_election(&x, house_size, all_votes.clone());

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

fn run_election(
    x: &impl Allocate,
    house_size: u32,
    all_votes: Vec<usize>,
) -> Vec<u32> {
    let n_parties = all_votes.len();
    let mut ballots = vec![];
    for (idx, votes) in all_votes.iter().enumerate() {
        ballots.extend(vec![idx; *votes]);
    }

    x.allocate_seats(ballots, house_size, n_parties)
}
