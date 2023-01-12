use crate::*;

use stv::lib::*;
use stv::types::StvBallot;

pub struct StvAustralia;

impl Allocate for StvAustralia {
    type Ballot = StvBallot;

    /// O(v + v + v*p^2) ~= O(v*p^2)
    /// - v is the number of voters
    /// - p is the number of candidates
    /// Note that there are likely to be many candidates in STV, as parties
    /// must run multiple candidates if they want to win multiple seats
    // benchmarks show multi-threading is slower, so it's not used here
    fn allocate_seats(
        &self,
        ballots: Vec<Self::Ballot>,
        total_seats: u32,
        n_candidates: usize,
    ) -> AllocationResult {
        if (n_candidates as u32) <= total_seats {
            return vec![1; n_candidates];
        }
        // dividing usizes will automatically floor
        let quota = (ballots.len() / (total_seats as usize + 1)) + 1;
        let mut result = vec![0; n_candidates];
        let mut eliminated = vec![false; n_candidates];

        // every voter's first preferences
        // O(v)
        let first_prefs: Vec<_> =
            ballots.iter().map(|ballot| ballot.0[0]).collect();

        // the first preference tally
        // O(v)
        let mut counts = count_freqs(&first_prefs, n_candidates);

        // the sum in the condition is technically O(c),
        // but should be optimized out into a simple counter
        // one loop is O(p + v*p) ~= O(v*p), it loops p times
        // so the entire loop is O(v*p^2)
        loop {
            // TODO: see if this needs to be optimized to a manual counter
            let s = result.iter().sum::<u32>();
            if s >= total_seats {
                break;
            }
            let n_elected = s as usize;
            let seats_to_fill = total_seats as usize - n_elected;
            // TODO: see if this needs to be optimized to a manual counter
            let n_eliminated = eliminated.iter().filter(|x| **x).count();
            let n_viable_candidates = n_candidates - n_elected - n_eliminated;
            if n_viable_candidates == seats_to_fill {
                break elect_all_viable(&mut result, &eliminated, n_candidates);
            }

            let mut pending = vec![false; n_candidates];
            // O(p)
            let elected_info = find_elected(&counts, quota, &result);
            if !elected_info.is_empty() {
                // immediately elected due to reaching the quota
                counts = elect_and_transfer(
                    elected_info,
                    &mut result,
                    &ballots,
                    n_candidates,
                    &eliminated,
                    &counts,
                    &mut pending,
                );
            } else {
                // O(v*p)
                counts = eliminate_and_transfer(
                    &counts,
                    &mut result,
                    &mut eliminated,
                    &ballots,
                    n_candidates,
                    &pending,
                )
            }
        }
        result
    }

    fn generate_ballots(
        &self,
        voters: &[Voter],
        parties: &[Party],
        bar: &Option<ProgressBar>,
    ) -> Vec<Self::Ballot> {
        generate_stv_ballots(voters, parties, bar)
    }
}

fn elect_all_viable(
    result: &mut [u32],
    eliminated: &[bool],
    n_candidates: usize,
) {
    let not_elected: Vec<_> = result
        .iter()
        .enumerate()
        .filter(|(_, s)| **s == 0)
        .map(|x| x.0)
        .collect();
    let not_eliminated: Vec<_> = eliminated
        .iter()
        .enumerate()
        .filter(|(_, b)| !**b)
        .map(|x| x.0)
        .collect();
    for cand in 0..n_candidates {
        if not_elected.contains(&cand) && not_eliminated.contains(&cand) {
            result[cand] = 1;
        }
    }
}

fn elect_and_transfer(
    elected_info: Vec<(usize, usize, f32)>,
    result: &mut [u32],
    ballots: &[StvBallot],
    n_candidates: usize,
    eliminated: &[bool],
    counts: &[u32],
    pending: &mut [bool],
) -> Vec<u32> {
    // technically O(p) but rather negligible
    for (c, _, _) in &elected_info {
        pending[*c] = true;
    }
    // technically loops p times, but O(v*p) dominates
    let to_add = elected_info
        .iter()
        .map(|(cand_idx, surplus, transfer_value)| {
            // O(v*p)
            transfer_surplus(
                *cand_idx,
                *surplus,
                *transfer_value,
                result,
                ballots,
                n_candidates,
                eliminated,
                pending,
            )
        })
        .fold(vec![0.; n_candidates], |acc, x| {
            acc.iter().zip(x).map(|(a, b)| *a + b).collect()
        });

    for (c, _, _) in &elected_info {
        result[*c] = 1;
    }

    // O(p)
    counts
        .iter()
        .zip(to_add)
        .map(|(x, y)| ((*x as f32) + y) as u32)
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
    result: &[u32],
    ballots: &[StvBallot],
    n_candidates: usize,
    eliminated: &[bool],
    pending: &[bool],
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
        let first_valid_pref =
            ballot.0.iter().find(|i| !eliminated[**i] && r[**i] == 0);

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
    counts: &[u32],
    result: &mut [u32],
    eliminated: &mut [bool],
    ballots: &[StvBallot],
    n_candidates: usize,
    pending: &[bool],
) -> Vec<u32> {
    // O(p)
    let last_idx = counts
        .iter()
        .enumerate()
        .filter(|(i, _)| result[*i] == 0 && !eliminated[*i])
        .min_by_key(|(_, c)| *c)
        .expect("No candidates remaining to eliminate")
        .0 as usize;
    eliminated[last_idx] = true;

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
        let first_valid_pref = ballot.0.iter().find(|i| {
            result[**i] == 0 && (**i == last_idx || !eliminated[**i])
        });

        first_valid_pref.map(|x| *x == last_idx).unwrap_or(false)
    });

    // find the next valid candidate to transfer
    // this is not necessarily the second preference, as it could be elected
    // or eliminated
    // O(v*p + v)
    let votes_to_transfer =
        calc_votes_to_transfer(b, result, eliminated, n_candidates, pending);

    // O(p)
    counts
        .iter()
        .zip(votes_to_transfer)
        .enumerate()
        .map(
            |(idx, (x, y))| {
                if idx == last_idx {
                    0
                } else {
                    x + y
                }
            },
        )
        .collect()
}

// O(p) -- len of counts is p
fn find_elected(
    counts: &[u32],
    quota: usize,
    r: &[u32],
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
