use crate::{
    stv::{
        bitarray::{is_nth_elem_set, set_nth_elem},
        transfer::calc_votes_to_transfer,
    },
    types::AllocationResult,
    utils::count_freqs,
};

/// O(s*(p + v*p^2 + p*v) + v + v) ~= O(s*p + s*v*p^2 + s*p*v + v)
/// - s is the number of total seats
/// - v is the number of voters
/// - p is the number of candidates
///
/// Note that there are likely to be many candidates in STV, as parties
/// must run multiple candidates if they want to win multiple seats
///
/// Also note that the comparison table in (Wikipedia)[https://en.wikipedia.org/wiki/Comparison_of_electoral_systems] uses N for number of candidates,
/// so IRV/STV's O(N^2) correctly corresponds to O(p^2) here
pub fn allocate_seats_stv(
    ballots: &[usize],
    total_seats: usize,
    n_candidates: usize,
    n_voters: usize,
    #[cfg(test)] rounds: &mut Vec<Vec<f32>>,
) -> AllocationResult {
    if n_candidates <= total_seats {
        return vec![1; n_candidates];
    }
    // Australia floors the quota and integer division does that for us
    #[allow(clippy::integer_division)]
    let quota = (n_voters / (total_seats + 1)) + 1;
    // transfer values for every candidate if they are elected.
    // a transfer value is calculated exactly once when the candidate is elected.
    // so every Some value is an elected candidate
    // a None value means they are not elected
    let mut transfer_values = vec![None; n_candidates];
    let mut eliminated: usize = 0b0;

    // every voter's first preferences
    // O(v)
    let first_prefs: Vec<_> =
        ballots.iter().step_by(n_candidates).copied().collect();

    // the first preference tally
    // O(v)
    let mut counts = count_freqs(&first_prefs, n_candidates);

    // one loop is O(p + v*p^2 + p*v),  it loops s times,
    // so the entire loop is O(s*(p + v*p^2 + p*v))
    let mut n_elected = 0;
    let mut n_eliminated = 0;
    while n_elected < total_seats {
        #[cfg(test)]
        rounds.push(counts.iter().map(|x| *x as f32).collect::<Vec<_>>());
        let seats_to_fill = total_seats - n_elected;
        let n_viable_candidates = n_candidates - n_elected - n_eliminated;
        if n_viable_candidates == seats_to_fill {
            // O(p)
            elect_all_viable(&mut transfer_values, eliminated, n_candidates);
            break;
        }

        let mut pending = 0b0;
        // O(p)
        let mut elected_info =
            find_elected(&counts, quota, &transfer_values, seats_to_fill);
        elected_info.sort_unstable_by(|(_, a, _), (_, b, _)| b.cmp(a));
        // assume worse case branch, which is O(p + v*p^2 + p*v)
        if !elected_info.is_empty() {
            // immediately elected due to reaching the quota
            // O(p + v*p^2 + p*v)
            counts = elect_and_transfer(
                &elected_info,
                &mut transfer_values,
                ballots,
                n_candidates,
                eliminated,
                &counts,
                &mut pending,
                &mut n_elected,
            );
        } else {
            n_eliminated += 1;
            // O(v*p + v + p)
            counts = eliminate_and_transfer(
                &counts,
                &mut transfer_values,
                &mut eliminated,
                ballots,
                n_candidates,
                pending,
            )
        }
    }
    transfer_values
        .iter()
        .map(|x| if x.is_none() { 0 } else { 1 })
        .collect()
}

/// O(p)
fn elect_all_viable(
    transfer_values: &mut [Option<f32>],
    eliminated: usize,
    n_candidates: usize,
) {
    // this code is suggested by clippy and is faster than
    // collecting a vec of not elected, and using contains()
    for cand in 0..n_candidates {
        if transfer_values
            .iter()
            .enumerate()
            .any(|(i, s)| s.is_none() && i == cand)
            && !is_nth_elem_set(eliminated, cand)
        {
            // there is a break statement after this function,
            // so the value doesn't matter as it is never used.
            // We only need a Some to indicate they're elected
            transfer_values[cand] = Some(1.);
        }
    }
}

/// O(p + p*(v*p + v) + p + p) = O(p + v*p^2 + p*v)
fn elect_and_transfer(
    elected_info: &[(usize, usize, f32)],
    transfer_values: &mut [Option<f32>],
    ballots: &[usize],
    n_candidates: usize,
    eliminated: usize,
    counts: &[usize],
    pending: &mut usize,
    n_elected: &mut usize,
) -> Vec<usize> {
    // technically O(p) but likely to be less
    for (c, _, _) in elected_info {
        *pending = set_nth_elem(*pending, *c);
    }
    // entire is O(p*(v*p + v))
    // technically loops p times, but likely to be less.
    let to_add = elected_info
        .iter()
        .map(|(cand_idx, surplus, transfer_value)| {
            *n_elected += 1;
            // O(v*p + v)
            transfer_surplus(
                *cand_idx,
                *surplus,
                *transfer_value,
                transfer_values,
                ballots,
                n_candidates,
                eliminated,
                *pending,
            )
        })
        .fold(vec![0.; n_candidates], |acc, x| {
            acc.iter().zip(x).map(|(a, b)| *a + b).collect()
        });

    for (c, _, tv) in elected_info {
        // the transfer value of this candidate.
        // this value will never be modified so it can be retrieved later
        // to lookup what transfer value was used in past transfers
        transfer_values[*c] = Some(*tv);
    }

    // O(p)
    counts
        .iter()
        .zip(to_add)
        .map(|(x, y)| ((*x as f32) + y) as usize)
        .collect()
}

/// elect candidate and transfer their surplus
/// O(v*p + v*p + v) = O(v*p + v)
fn transfer_surplus(
    idx_of_elected: usize,
    surplus: usize,
    transfer_value: f32,
    transfer_values: &[Option<f32>],
    ballots: &[usize],
    n_candidates: usize,
    eliminated: usize,
    pending: usize,
) -> Vec<f32> {
    if surplus == 0 {
        return vec![0.; n_candidates];
    }

    // Part XVIII section 273 number 9b specifies it to be truncated
    // O(v)
    let mut votes_to_transfer: Vec<f32> = calc_votes_to_transfer(
        ballots,
        transfer_values,
        eliminated,
        n_candidates,
        pending,
        idx_of_elected,
    )
    .iter()
    .map(|&c: &f32| (c * transfer_value).floor())
    .collect();
    votes_to_transfer[idx_of_elected] = -(surplus as f32);

    votes_to_transfer
}

/// no candidate elected - eliminate the last candidate and transfer
/// O(p + v*p + v*p + v + p) = O(v*p + v + p)
fn eliminate_and_transfer(
    counts: &[usize],
    transfer_values: &mut [Option<f32>],
    eliminated: &mut usize,
    ballots: &[usize],
    n_candidates: usize,
    pending: usize,
) -> Vec<usize> {
    // O(p)
    let last_idx = counts
        .iter()
        .enumerate()
        .filter(|(i, _)| {
            transfer_values[*i].is_none() && !is_nth_elem_set(*eliminated, *i)
        })
        .min_by_key(|(_, c)| *c)
        .expect("No candidates remaining to eliminate")
        .0;

    let votes_to_transfer: Vec<f32> = calc_votes_to_transfer(
        ballots,
        transfer_values,
        *eliminated,
        n_candidates,
        pending,
        last_idx,
    );

    *eliminated = set_nth_elem(*eliminated, last_idx);

    // O(p) -- assume map to be inlined
    counts
        .iter()
        .zip(votes_to_transfer)
        .enumerate()
        .map(|(idx, (x, y))| {
            if idx == last_idx {
                0
            } else {
                // 13AAA)b)ii truncates the decimals
                (*x as f32 + y) as usize
            }
        })
        .collect()
}

/// O(p) -- len of counts is p
fn find_elected(
    counts: &[usize],
    quota: usize,
    transfer_values: &[Option<f32>],
    seats_to_fill: usize,
) -> Vec<(usize, usize, f32)> {
    counts
        .iter()
        .enumerate()
        .filter(|(i, &count)| transfer_values[*i].is_none() && count >= quota)
        .map(|(i, &count)| {
            let surplus = count - quota;
            let transfer_value = surplus as f32 / count as f32;
            (i, surplus, transfer_value)
        })
        .take(seats_to_fill)
        .collect()
}
