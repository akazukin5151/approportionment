use crate::*;

pub struct StvAustralia;

/// Vector of candidate idxes in order of first to last preference
#[derive(Clone, Debug)]
struct StvBallot(Vec<usize>);

fn find_next_valid_candidate(
    ballots: &StvBallot,
    elected: &[u32],
    eliminated: &[bool],
) -> Option<usize> {
    ballots
        .0
        .iter()
        .find(|cand_idx| elected[**cand_idx] == 0 && !eliminated[**cand_idx])
        .copied()
}

fn allocate_seats(
    ballots: Vec<StvBallot>, // this differs from the Allocate trait
    total_seats: u32,
    n_candidates: usize,
) -> AllocationResult {
    // dividing usizes will automatically floor
    let quota = (ballots.len() / (total_seats as usize + 1)) + 1;
    let mut result = vec![0; n_candidates];
    let mut eliminated = vec![false; n_candidates];

    // every voter's first preferences
    let first_prefs: Vec<_> =
        ballots.iter().map(|ballot| ballot.0[0]).collect();
    // the first preference tally
    let mut counts = count_freqs(&first_prefs, n_candidates);

    while result.iter().sum::<u32>() < total_seats {
        // immediate elected due to reaching the quota
        let r = result.clone();
        let elected_surplus_and_tvs =
            counts.iter().enumerate().map(|(i, &count)| {
                if r[i] == 0 && count as usize >= quota {
                    let surplus = count as usize - quota;
                    let transfer_value = surplus as f32 / count as f32;
                    Some((i as u32, surplus, transfer_value))
                } else {
                    None
                }
            });

        if elected_surplus_and_tvs.clone().any(|x| x.is_some()) {
            elect_and_transfer(
                elected_surplus_and_tvs.collect(),
                &mut result,
                &ballots,
                n_candidates,
                &eliminated,
                &mut counts,
            )
        } else {
            eliminate_and_transfer(
                &mut counts,
                &mut result,
                &mut eliminated,
                &ballots,
                n_candidates,
            )
        }
    }
    result
}

fn elect_and_transfer(
    elected_surplus_and_tvs: Vec<Option<(u32, usize, f32)>>,
    result: &mut [u32],
    ballots: &[StvBallot],
    n_candidates: usize,
    eliminated: &[bool],
    counts: &mut Vec<u32>,
) {
    // elect candidate and transfer their surplus

    // https://www.legislation.gov.au/Details/C2022C00074
    // part XVIII section 273 does not seem to mention which surplus to
    // transfer first. so this will transfer the surplus in order
    // of the list on the ballot

    let all_transferred_votes = elected_surplus_and_tvs
        .iter()
        .map(|x| {
            if let Some((cand_idx, _, transfer_value)) = x {
                let idx = *cand_idx as usize;
                // record that this candidate has won
                result[idx] = 1;

                // ballots where first preferences is the elected candidate
                let b = ballots.iter().filter(|&ballot| ballot.0[0] == idx);
                let next_prefs: Vec<_> = b
                    .filter_map(|ballot| {
                        find_next_valid_candidate(ballot, result, eliminated)
                    })
                    .collect();
                let counted = count_freqs(&next_prefs, n_candidates);
                let transferred_votes: Vec<_> = counted
                    .iter()
                    .map(|&c| c as f32 * transfer_value)
                    .collect();
                transferred_votes
            } else {
                vec![0.; n_candidates]
            }
        })
        .fold(vec![0.; n_candidates], |acc: Vec<f32>, tvs| {
            let x: Vec<_> = acc.iter().zip(tvs).map(|(x, y)| x + y).collect();
            x
        });

    *counts = counts
        .iter()
        .zip(all_transferred_votes)
        .map(|(x, y)| x + y as u32)
        .collect();
}

fn eliminate_and_transfer(
    counts: &mut Vec<u32>,
    result: &mut [u32],
    eliminated: &mut [bool],
    ballots: &[StvBallot],
    n_candidates: usize,
) {
    // no candidate elected
    // eliminate the last candidate and transfer
    let last_idx = counts
        .iter()
        .enumerate()
        .filter(|(i, _)| result[*i] == 0 && !eliminated[*i])
        .min_by_key(|(_, c)| *c)
        .unwrap()
        .0 as usize;
    eliminated[last_idx] = true;

    // ballots where first valid preference is the eliminated candidate
    // that means, a vote that was previously transferred to this candidate
    // has to be transferred again, to their (possibly different)
    // next alternative
    let b = ballots.iter().filter(|&ballot| {
        // find the first candidate that is not elected or eliminated
        // as the candidate to eliminate is already recorded in eliminated
        // allow it to pass as true here
        let first_valid_pref = ballot.0.iter().find(|i| {
            result[**i] == 0 && (**i == last_idx || !eliminated[**i])
        });

        first_valid_pref.map(|x| *x == last_idx).unwrap_or(false)
    });
    // find the next valid candidate to transfer
    // this is not necessarily the second preference, as it could be elected
    // or eliminated
    let next_prefs: Vec<_> = b
        .filter_map(|ballot| {
            find_next_valid_candidate(ballot, result, eliminated)
        })
        .collect();
    let votes_to_transfer = count_freqs(&next_prefs, n_candidates);
    *counts = counts
        .iter()
        .zip(votes_to_transfer)
        .enumerate()
        .map(
            |(idx, (x, y))| {
                if idx == last_idx {
                    0
                } else {
                    x + y as u32
                }
            },
        )
        .collect();
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn stv_australia_pdf() {
        // Voters with Kim as first preference
        // Total of 1250, which is Kim's first preference votes
        let mut ballots = vec![StvBallot(vec![1, 0]); 400];
        ballots.extend(vec![StvBallot(vec![1, 2]); 150]);
        ballots.extend(vec![StvBallot(vec![1, 3]); 500]);
        ballots.extend(vec![StvBallot(vec![1, 4]); 200]);

        ballots.extend(vec![StvBallot(vec![0]); 200]);
        ballots.extend(vec![StvBallot(vec![2]); 350]);
        ballots.extend(vec![StvBallot(vec![3]); 950]);
        ballots.extend(vec![StvBallot(vec![4]); 250]);

        let total_seats = 2;
        let n_candidates = 5;
        let r = allocate_seats(ballots, total_seats, n_candidates);
        assert_eq!(r, vec![0, 1, 0, 1, 0]);
    }

    #[test]
    fn stv_australia_food() {
        let mut ballots = vec![StvBallot(vec![0, 1]); 4];
        ballots.extend(vec![StvBallot(vec![1, 2, 3]); 7]);
        ballots.extend(vec![StvBallot(vec![2, 3, 1]); 1]);
        ballots.extend(vec![StvBallot(vec![3, 4, 2]); 3]);
        ballots.extend(vec![StvBallot(vec![4, 3, 5]); 1]);
        ballots.extend(vec![StvBallot(vec![5]); 4]);
        ballots.extend(vec![StvBallot(vec![6, 5]); 3]);

        let total_seats = 3;
        let n_candidates = 7;
        let r = allocate_seats(ballots, total_seats, n_candidates);
        assert_eq!(r, vec![0, 1, 0, 1, 0, 1, 0]);
    }
}
