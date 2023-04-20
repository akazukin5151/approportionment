use crate::{types::AllocationResult, utils::count_freqs};

use super::quota::QuotaF;

/// O(v + p + p + p*log(p) + p) ~=O(v + p + p*log(p)) where
/// - v is the number of voters
/// - p is the number of parties
///
/// The number of parties are likely to be less than 100
/// So this is essentially O(v) as p + p*log(p) are constants
/// and likely won't grow endlessly
pub fn allocate_largest_remainder(
    quota: &impl QuotaF,
    total_seats: usize,
    ballots: &[usize],
    n_parties: usize,
) -> AllocationResult {
    // O(v)
    let counts = count_freqs(ballots, n_parties);

    let quota = quota.quota_f(ballots.len() as f32, total_seats as f32);

    // O(p)
    // TODO(parallel): this can be parallelized only if there are lots of
    // parties. this applies to fill_over_quota_seats as well
    let (mut result, mut remainders): (Vec<_>, Vec<_>) = counts
        .iter()
        .enumerate()
        .map(|(idx, x)| {
            let div = *x as f32 / quota;
            let automatic_seats = div.floor();
            let remainder = div - automatic_seats;
            (automatic_seats as usize, (idx, remainder))
        })
        .unzip();

    // O(p)
    let remaining_n_seats = total_seats - result.iter().sum::<usize>();

    // if remaining_n_seats == n_parties, we give all parties 1 seat
    // if remaining_n_seats < n_parties, we give the parties with the largest
    //   remainders 1 seat
    // if remaining_n_seats > n_parties, we give all parties 1 seat, then give
    //   seats to parties with the smallest over quota

    if remaining_n_seats < n_parties {
        let (left, _, _) = remainders.select_nth_unstable_by(
            remaining_n_seats,
            |(_, a), (_, b)| {
                // largest first
                b.partial_cmp(a).expect("partial_cmp found NaN")
            },
        );

        for (party, _) in left {
            result[*party] += 1;
        }

        return result;
    }

    // there's no need to select nth when we give all parties an additional seat
    for x in result.iter_mut() {
        *x += 1;
    }

    if remaining_n_seats == n_parties {
        return result;
    }

    // overflow would never happen in this branch because we've checked
    // that remaining_n_seats > n_parties
    let over_quota_seats = remaining_n_seats - n_parties;
    fill_over_quota_seats(quota, &mut result, &counts, over_quota_seats);
    result
}

/// if there are still remaining seats, give seats in a manner
/// that minimizes the expression `seats_won - votes_won / quota`
/// for every party
///
/// See https://www.votingtheory.org/forum/topic/321/largest-remainders-methods-more-remaining-seats-than-parties
///
/// this will loop forever if there are 0 parties, but this should be caught
/// on config read or something like that
fn fill_over_quota_seats(
    quota: f32,
    result: &mut [usize],
    counts: &[usize],
    mut over_quota_seats: usize,
) {
    let mut over_quota: Vec<_> = Vec::with_capacity(result.len());
    while over_quota_seats > 0 {
        // pop smallest
        if let Some((smallest_idx, _)) = over_quota.pop() {
            result[smallest_idx] += 1;
            over_quota_seats -= 1;
        } else {
            // TODO: consider using quickselect here for very marginal
            // perf improvement
            // we re-calculate and re-sort only if every party has been awarded
            // 1 extra seat and there are still remaining seats to fill
            // the alternative is to re-calculate and re-sort every
            // time a party wins a seat, which is inefficient because
            // gaining seats can only increase the over-quota and make it
            // impossible to gain another seat until the next round
            over_quota = result
                .iter()
                .enumerate()
                .map(|(idx, seats)| {
                    let votes = counts[idx];
                    (idx, *seats as f32 - votes as f32 / quota)
                })
                .collect();
            over_quota.sort_unstable_by(|(_, a), (_, b)| {
                // largest first because we use pop
                b.partial_cmp(a).expect("partial_cmp found NaN")
            });
        };
    }
}
