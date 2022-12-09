use crate::*;

pub fn allocate_largest_remainder(
    quota_f: fn(u64, u64) -> u64,
    total_seats: u32,
    ballots: &[usize],
    n_parties: usize,
) -> AllocationResult {
    let counts = count_freqs(ballots, n_parties);

    let quota = quota_f(ballots.len() as u64, total_seats as u64);

    let counts_divided_by_quota =
        counts.iter().map(|x| *x as f32 / quota as f32);

    let mut result = vec![0; n_parties];
    let mut remainders = vec![];
    for (idx, x) in counts_divided_by_quota.enumerate() {
        let as_ = x.floor();
        let remainder = x - as_;
        result[idx] = as_ as u32;
        remainders.push((idx, remainder));
    }

    let remaining_n_seats = total_seats - result.iter().sum::<u32>();

    // TODO(perf): optimize for only taking highest X amount instead of sorting all
    remainders.sort_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap());
    let highest_remainder_seats = remainders
        .iter()
        .rev()
        .take(remaining_n_seats as usize);
    let highest_remainder_parties = highest_remainder_seats.map(|(idx, _)| idx);

    for party in highest_remainder_parties {
        result[*party] += 1;
    }

    result
}
