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
        let prop_of_votes = v as f32 / total_votes as f32;
        let prop_of_seats = prop_of_votes * house_size as f32;
        // TODO: Droop violates quota rule with these parameters?
        if house_size == 360
            && votes_1 == 885292
            && votes_2 == 50089
            && votes_3 == 1536
            && votes_4 == 87859
        {
            dbg!(s);
            dbg!(prop_of_votes);
            dbg!(prop_of_seats);
        }
        let s = *s as f32;
        assert!(s == prop_of_seats.floor() || s == prop_of_seats.ceil())
    }
}
