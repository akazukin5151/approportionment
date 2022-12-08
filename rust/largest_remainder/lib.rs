use crate::*;
use std::collections::HashMap;

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
        counts.iter().map(|(p, x)| (p, *x as f32 / quota as f32));

    let mut automatic_seats = vec![];
    let mut remainders = vec![];
    for (p, x) in counts_divided_by_quota {
        let as_ = x.floor();
        let remainder = x - as_;
        automatic_seats.push((p, as_ as u32));
        remainders.push((p, remainder));
    }

    let mut result: HashMap<Party, u32> = HashMap::new();
    let mut remaining_n_seats = total_seats;
    for (p, x) in automatic_seats {
        result.insert(p.clone(), x);
        remaining_n_seats -= x;
    }

    // TODO(perf): optimize for only taking highest X amount instead of sorting all
    remainders.sort_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap());
    let highest_remainder_seats =
        remainders.iter().rev().take(remaining_n_seats as usize);
    let highest_remainder_parties = highest_remainder_seats.map(|(p, _)| p);

    for party in highest_remainder_parties {
        result
            .entry((*party).clone())
            .and_modify(|s| *s += 1)
            .or_insert(1);
    }

    result
}
