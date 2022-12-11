use proptest::{collection::vec, sample::SizeRange, strategy::Strategy};

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

/// if two parties merge their vote shares, their seats should also
/// be summed up
pub fn is_stable(
    x: &impl Allocate,
    house_size: u32,
    all_votes: Vec<usize>,
    party_1: usize,
    party_2: usize,
) {
    // ensure that party 1 is the one in the left of the all_votes array
    let (party_1, party_2) = if party_1 > party_2 {
        (party_1, party_2)
    } else {
        (party_2, party_1)
    };

    let r1 = run_election(x, house_size, all_votes.clone());

    let n_parties = all_votes.len() - 1;
    let mut ballots = vec![];
    for (idx, votes) in all_votes.iter().enumerate() {
        let party_to_give_vote_for = match idx.cmp(&party_2) {
            // give party 2's seats to party 1
            std::cmp::Ordering::Equal => party_1,
            // party 2 is gone so need to shift the rest to the left
            std::cmp::Ordering::Greater => idx - 1,
            // normal
            std::cmp::Ordering::Less => idx,
        };
        ballots.extend(vec![party_to_give_vote_for; *votes]);
    }

    let r2 = x.allocate_seats(ballots, house_size, n_parties);

    assert_eq!(r1[party_1] + r1[party_2], r2[party_1]);
}

/// a party with a larger vote share should not receive less seats
/// than a party with a smaller vote share
pub fn is_concordant(
    x: impl Allocate,
    house_size: u32,
    all_votes: Vec<usize>,
) {
    let r = run_election(&x, house_size, all_votes.clone());
    for (idx1, v1) in all_votes.iter().enumerate() {
        for (idx2, v2) in all_votes.iter().enumerate() {
            if idx1 != idx2 {
                if v1 > v2 {
                    assert!(r[idx1] >= r[idx2]);
                } else {
                    assert!(r[idx1] <= r[idx2])
                }
            }
        }
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

/// house sizes should be less than 1000 because the
/// allocation algorithm is too slow for massive house sizes
/// no parliament has more than a thousand members anyway
pub fn house_size() -> impl Strategy<Value = u32> {
    10..=1000_u32
}

/// the ith element in `all_votes` is the number of votes for the ith party
/// so the len of `all_votes` is the number of parties
/// just keep it to a sensible number
/// if `n_parties` is None, then it defaults to between 2 to 10 parties
/// and you have to use the turbofish, which is ignored
/// it can be any type that implements Into<SizeRange>,
/// such as usize for brevity
///
/// there are between 1 thousand and a million voters
pub fn all_votes<R: Into<SizeRange>>(
    n_parties: Option<R>,
) -> impl Strategy<Value = Vec<usize>> {
    vec(
        1000..=1_000_000_usize,
        n_parties.map_or_else(|| (2..=10_usize).into(), |y| y.into()),
    )
}

/// for any number of parties between 2 and 10:
/// len(vec of votes for each party) == number of parties
/// first party to merge = any number between 0 to max party index
/// second party to merge = any number between 0 to max party index
/// where max party index is number of parties - 2
/// 0 to max party index is just (2..=10) shifted back to (0..=8)
pub fn votes_and_parties_to_merge(
) -> impl Strategy<Value = (Vec<usize>, usize, usize)> {
    (2..=10_usize).prop_flat_map(|p| {
        (
            proptest::collection::vec(1000..=1_000_000_usize, p),
            0..(p - 2),
            0..(p - 2),
        )
    })
}
