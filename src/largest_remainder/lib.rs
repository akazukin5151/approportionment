use ordered_float::Float;

use crate::*;

pub fn allocate_largest_remainder(
    quota_f: fn(u64, u64) -> u64,
    total_seats: u32,
    ballots: &[Party],
) -> AllocationResult {
    let ballots_by_party = count_freqs(ballots);
    let counts: Vec<(Party, u64)> = ballots_by_party
        .iter()
        .map(|(&x, y)| (x.clone(), *y))
        .collect();

    let quota = quota_f(ballots.len() as u64, total_seats as u64);

    let counts_divided_by_quota =
        counts.iter().map(|(p, x)| (p, *x as f64 / quota as f64));

    let automatic_seats_and_remainder =
        counts_divided_by_quota.map(|(p, x)| {
            let automatic_seats = x.floor();
            let remainder = x - automatic_seats;
            (p, automatic_seats as u32, remainder)
        });
    let automatic_seats = automatic_seats_and_remainder
        .clone()
        .map(|(p, x, _)| (p, x));
    let remainders = automatic_seats_and_remainder.map(|(p, _, x)| (p, x));

    let mut result: HashMap<Party, u32> = HashMap::new();
    let mut remaining_n_seats = total_seats;
    for (p, x) in automatic_seats {
        result.insert(p.clone(), x);
        remaining_n_seats -= x;
    }

    let mut remainders_sorted: Vec<_> = remainders.collect();
    remainders_sorted
        .sort_by_key(|(_, x)| unsafe { NotNan::new_unchecked(*x) });
    let highest_remainder_seats = remainders_sorted
        .iter()
        .rev()
        .take(remaining_n_seats as usize);
    let highest_remainder_parties = highest_remainder_seats.map(|(p, _)| p);
    for party in highest_remainder_parties {
        result
            .entry((*party).clone())
            .and_modify(|s| *s += 1)
            .or_insert(1);
    }
    result
}
