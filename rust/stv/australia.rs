// benchmark results from longest to fastest:
// 1. generate_stv_ballots
// 2. elect_and_transfer
// 3. eliminate_and_transfer
// 4. generate_voters

use crate::*;

use stv::lib::*;
use stv::types::StvBallot;

pub struct StvAustralia(pub(crate) Vec<StvBallot>);

impl Allocate for StvAustralia {
    fn new(n_voters: usize) -> Self {
        Self(vec![StvBallot(vec![]); n_voters])
    }

    /// O(v + v + v*p^2) ~= O(v*p^2)
    /// - v is the number of voters
    /// - p is the number of candidates
    /// Note that there are likely to be many candidates in STV, as parties
    /// must run multiple candidates if they want to win multiple seats
    fn allocate_seats(
        &self,
        total_seats: usize,
        n_candidates: usize,
    ) -> AllocationResult {
        if n_candidates <= total_seats {
            return vec![1; n_candidates];
        }
        // Australia floors the quota and integer division does that for us
        #[allow(clippy::integer_division)]
        let quota = (self.0.len() / (total_seats + 1)) + 1;
        let mut result = vec![0; n_candidates];
        let mut eliminated: usize = 0b0;

        // every voter's first preferences
        // O(v)
        let first_prefs: Vec<_> =
            self.0.iter().map(|ballot| ballot.0[0]).collect();

        // the first preference tally
        // O(v)
        let mut counts = count_freqs(&first_prefs, n_candidates);

        // the sum in the condition is technically O(c),
        // but should be optimized out into a simple counter
        // one loop is O(p + v*p) ~= O(v*p), it loops p times
        // so the entire loop is O(v*p^2)
        let mut n_elected = 0;
        let mut n_eliminated = 0;
        while n_elected < total_seats {
            let seats_to_fill = total_seats - n_elected;
            let n_viable_candidates = n_candidates - n_elected - n_eliminated;
            if n_viable_candidates == seats_to_fill {
                elect_all_viable(&mut result, eliminated, n_candidates);
                break;
            }

            let mut pending = 0b0;
            // O(p)
            let elected_info = find_elected(&counts, quota, &result);
            if !elected_info.is_empty() {
                // immediately elected due to reaching the quota
                counts = elect_and_transfer(
                    &elected_info,
                    &mut result,
                    &self.0,
                    n_candidates,
                    eliminated,
                    &counts,
                    &mut pending,
                    &mut n_elected,
                );
            } else {
                n_eliminated += 1;
                // O(v*p)
                counts = eliminate_and_transfer(
                    &counts,
                    &mut result,
                    &mut eliminated,
                    &self.0,
                    n_candidates,
                    pending,
                )
            }
        }
        result
    }

    fn generate_ballots(
        &mut self,
        voters: &[XY],
        parties: &[XY],
        #[cfg(feature = "progress_bar")] bar: &ProgressBar,
    ) {
        generate_stv_ballots(
            voters,
            parties,
            #[cfg(feature = "progress_bar")]
            bar,
            &mut self.0,
        );
    }
}

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

fn elect_and_transfer(
    elected_info: &[(usize, usize, f32)],
    result: &mut [usize],
    ballots: &[StvBallot],
    n_candidates: usize,
    eliminated: usize,
    counts: &[usize],
    pending: &mut usize,
    n_elected: &mut usize,
) -> Vec<usize> {
    // technically O(p) but rather negligible
    for (c, _, _) in elected_info {
        *pending = set_nth_flag(*pending, *c);
    }
    // technically loops p times, but O(v*p) dominates
    let to_add = elected_info
        .iter()
        .map(|(cand_idx, surplus, transfer_value)| {
            *n_elected += 1;
            // O(v*p)
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
/// O(v*p + v*p + v + p) = O(v*p + v + p) ~= O(v*p)
/// - v is the number of voters
/// - p is the number of candidates
/// Note that there are likely to be many candidates in STV, as parties
/// must run multiple candidates if they want to win multiple seats
fn transfer_surplus(
    idx_of_elected: usize,
    surplus: usize,
    transfer_value: f32,
    result: &[usize],
    ballots: &[StvBallot],
    n_candidates: usize,
    eliminated: usize,
    pending: usize,
) -> Vec<f32> {
    if surplus == 0 {
        return vec![0.; n_candidates];
    }
    // ballots where first valid preferences is the elected candidate
    // outer is O(v) so entire is O(v*p)
    let r = result.to_vec();
    let b = ballots.iter().filter(|&ballot| {
        // find the first candidate that is not elected or eliminated
        // O(p)
        let first_valid_pref = ballot
            .0
            .iter()
            .find(|i| !is_nth_flag_set(eliminated, **i) && r[**i] == 0);

        first_valid_pref
            .map(|x| *x == idx_of_elected)
            .unwrap_or(false)
    });

    // Part XVIII section 273 number 9b specifies it to be truncated
    // O(v*p + v), plus the map which is O(v), but this map should be inlined
    let mut votes_to_transfer: Vec<_> =
        calc_votes_to_transfer(b, result, eliminated, n_candidates, pending)
            .iter()
            .map(|&c| (c as f32 * transfer_value).floor())
            .collect();
    votes_to_transfer[idx_of_elected] = -(surplus as f32);

    votes_to_transfer
}

/// no candidate elected - eliminate the last candidate and transfer
/// O(p + v*p + v*p + v + p) = O(v*p + v + p) ~= O(v*p)
/// Note that there are likely to be many candidates in STV, as parties
/// must run multiple candidates if they want to win multiple seats
fn eliminate_and_transfer(
    counts: &[usize],
    result: &mut [usize],
    eliminated: &mut usize,
    ballots: &[StvBallot],
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
        .0 as usize;

    *eliminated = set_nth_flag(*eliminated, last_idx);

    // ballots where first valid preference is the eliminated candidate
    // that means, a vote that was previously transferred to this candidate
    // has to be transferred again, to their (possibly different)
    // next alternative
    // outer is O(v) so entire loop is O(v*p)
    let b = ballots.iter().filter(|&ballot| {
        // find the first candidate that is not elected or eliminated
        // as the candidate to eliminate is already recorded in eliminated
        // allow it to pass as true here
        // O(p)
        // this is the hottest path for STV - the find and `result[**i] == 0`
        let first_valid_pref = ballot.0.iter().find(|i| {
            result[**i] == 0
                && (**i == last_idx || !is_nth_flag_set(*eliminated, **i))
        });

        first_valid_pref.map(|x| *x == last_idx).unwrap_or(false)
    });

    // find the next valid candidate to transfer
    // this is not necessarily the second preference, as it could be elected
    // or eliminated
    // O(v*p + v)
    let votes_to_transfer =
        calc_votes_to_transfer(b, result, *eliminated, n_candidates, pending);

    // O(p)
    counts
        .iter()
        .zip(votes_to_transfer)
        .enumerate()
        .map(|(idx, (x, y))| if idx == last_idx { 0 } else { x + y })
        .collect()
}

// O(p) -- len of counts is p
fn find_elected(
    counts: &[usize],
    quota: usize,
    r: &[usize],
) -> Vec<(usize, usize, f32)> {
    counts
        .iter()
        .enumerate()
        .filter(|(i, &count)| r[*i] == 0 && count as usize >= quota)
        .map(|(i, &count)| {
            let surplus = count as usize - quota;
            let transfer_value = surplus as f32 / count as f32;
            (i, surplus, transfer_value)
        })
        .collect()
}
