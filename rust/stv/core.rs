use crate::*;

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
) -> AllocationResult {
    if n_candidates <= total_seats {
        return vec![1; n_candidates];
    }
    let n_voters = ballots.len() / n_candidates;
    // Australia floors the quota and integer division does that for us
    #[allow(clippy::integer_division)]
    let quota = (n_voters / (total_seats + 1)) + 1;
    let mut result = vec![0; n_candidates];
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
        let seats_to_fill = total_seats - n_elected;
        let n_viable_candidates = n_candidates - n_elected - n_eliminated;
        if n_viable_candidates == seats_to_fill {
            // O(p)
            elect_all_viable(&mut result, eliminated, n_candidates);
            break;
        }

        let mut pending = 0b0;
        // O(p)
        let mut elected_info = find_elected(&counts, quota, &result);
        elected_info.sort_unstable_by(|(_, a, _), (_, b, _)| {
            b.partial_cmp(a).expect("partial_cmp found NaN")
        });
        // assume worse case branch, which is O(p + v*p^2 + p*v)
        if !elected_info.is_empty() {
            // immediately elected due to reaching the quota
            // O(p + v*p^2 + p*v)
            counts = elect_and_transfer(
                &elected_info,
                &mut result,
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
                &mut result,
                &mut eliminated,
                ballots,
                n_candidates,
                pending,
            )
        }
    }
    result
}

/// O(p)
fn elect_all_viable(
    result: &mut [usize],
    eliminated: usize,
    n_candidates: usize,
) {
    // this code is suggested by clippy and is faster than
    // collecting a vec of not elected, and using contains()
    for cand in 0..n_candidates {
        if result.iter().enumerate().any(|(i, s)| *s == 0 && i == cand)
            && !is_nth_flag_set(eliminated, cand)
        {
            result[cand] = 1;
        }
    }
}

/// O(p + p*(v*p + v) + p + p) = O(p + v*p^2 + p*v)
fn elect_and_transfer(
    elected_info: &[(usize, usize, f32)],
    result: &mut [usize],
    ballots: &[usize],
    n_candidates: usize,
    eliminated: usize,
    counts: &[usize],
    pending: &mut usize,
    n_elected: &mut usize,
) -> Vec<usize> {
    // technically O(p) but likely to be less
    for (c, _, _) in elected_info {
        *pending = set_nth_flag(*pending, *c);
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
                result,
                ballots,
                n_candidates,
                eliminated,
                *pending,
            )
        })
        .fold(vec![0.; n_candidates], |acc, x| {
            acc.iter().zip(x).map(|(a, b)| *a + b).collect()
        });

    // O(p) but less
    for (c, _, _) in elected_info {
        result[*c] = 1;
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
    result: &[usize],
    ballots: &[usize],
    n_candidates: usize,
    eliminated: usize,
    pending: usize,
) -> Vec<f32> {
    if surplus == 0 {
        return vec![0.; n_candidates];
    }

    // we want loop over the ballots in one pass for efficiency
    let mut votes_to_transfer = vec![0_f32; n_candidates];
    let mut idx = 0;
    let mut next_row_idx = n_candidates;
    while idx < ballots.len() {
        let cand = ballots[idx];
        // check if this is the first valid preference
        if result[cand] == 0 && !is_nth_flag_set(eliminated, cand) {
            // cand is the first preference of this voter
            if cand == idx_of_elected {
                // this voter's first valid preference is the elected candidate
                // find their next valid preference
                for next_cand in &ballots[idx + 1..next_row_idx] {
                    if result[*next_cand] == 0
                        && !is_nth_flag_set(eliminated, *next_cand)
                        && !is_nth_flag_set(pending, *next_cand)
                    {
                        // transfer this voter's vote to the next valid preference
                        votes_to_transfer[*next_cand] += 1.;
                        break;
                    }
                }
            }
            // if this voter's first preference is someone else, there is
            // nothing we need to do and we can move on to the next voter.
            // if we have transferred once, this voter's ballot is also fixed
            // and we can also move on to the next voter
            idx = next_row_idx;
            next_row_idx += n_candidates;
        } else {
            // if this is not the first valid preference, continue searching
            idx += 1;
        }
    }

    // Part XVIII section 273 number 9b specifies it to be truncated
    // O(v*p + v), plus the map which is O(v), but this map should be inlined
    let mut votes_to_transfer: Vec<_> = votes_to_transfer
        .iter()
        .map(|&c| (c * transfer_value).floor())
        .collect();
    votes_to_transfer[idx_of_elected] = -(surplus as f32);

    votes_to_transfer
}

/// no candidate elected - eliminate the last candidate and transfer
/// O(p + v*p + v*p + v + p) = O(v*p + v + p)
fn eliminate_and_transfer(
    counts: &[usize],
    result: &mut [usize],
    eliminated: &mut usize,
    ballots: &[usize],
    n_candidates: usize,
    pending: usize,
) -> Vec<usize> {
    // O(p)
    let last_idx = counts
        .iter()
        .enumerate()
        .filter(|(i, _)| result[*i] == 0 && !is_nth_flag_set(*eliminated, *i))
        .min_by_key(|(_, c)| *c)
        .expect("No candidates remaining to eliminate")
        .0;

    // ballots where first valid preference is the eliminated candidate
    // that means, a vote that was previously transferred to this candidate
    // has to be transferred again, to their next valid alternative
    let mut votes_to_transfer = vec![0; n_candidates];
    let mut idx = 0;
    let mut next_row_idx = n_candidates;
    while idx < ballots.len() {
        let cand = ballots[idx];
        // check if this is the first valid preference
        if result[cand] == 0 && !is_nth_flag_set(*eliminated, cand) {
            // cand is the first preference of this voter
            if cand == last_idx {
                // the first preference of this voter is the candidate about
                // to be eliminated, so transfer their vote to the next
                // valid preference
                for next_cand in &ballots[idx + 1..next_row_idx] {
                    if result[*next_cand] == 0
                        && !is_nth_flag_set(*eliminated, *next_cand)
                        && !is_nth_flag_set(pending, *next_cand)
                    {
                        votes_to_transfer[*next_cand] += 1;
                        break;
                    }
                }
            }
            // if this voter's first preference is someone else, there is
            // nothing we need to do and we can move on to the next voter.
            // if we have transferred once, this voter's ballot is also fixed
            // and we can also move on to the next voter
            idx = next_row_idx;
            next_row_idx += n_candidates;
        } else {
            // if this is not the first valid preference, continue searching
            idx += 1;
        }
    }

    *eliminated = set_nth_flag(*eliminated, last_idx);

    // O(p) -- assume map to be inlined
    counts
        .iter()
        .zip(votes_to_transfer)
        .enumerate()
        .map(|(idx, (x, y))| if idx == last_idx { 0 } else { x + y })
        .collect()
}

/// O(p) -- len of counts is p
fn find_elected(
    counts: &[usize],
    quota: usize,
    r: &[usize],
) -> Vec<(usize, usize, f32)> {
    counts
        .iter()
        .enumerate()
        .filter(|(i, &count)| r[*i] == 0 && count >= quota)
        .map(|(i, &count)| {
            let surplus = count - quota;
            let transfer_value = surplus as f32 / count as f32;
            (i, surplus, transfer_value)
        })
        .collect()
}
