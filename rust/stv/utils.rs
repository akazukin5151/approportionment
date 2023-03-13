use crate::*;

/// O(v*p) - len of ballots is v*p
pub fn calc_votes_to_transfer(
    ballots: &[usize],
    result: &[Option<f32>],
    eliminated: usize,
    n_candidates: usize,
    pending: usize,
    idx_to_search: usize,
) -> Vec<f32> {
    // we want loop over the ballots in one pass for efficiency
    // it iterates over every preference of the voters in order. if it found
    // what it needs for this voter, it skips to the next voter, so it usually
    // iterates less than v times, but never greater.
    let mut votes_to_transfer = vec![0.; n_candidates];
    let mut idx = 0;
    let mut next_row_idx = n_candidates;
    let mut compounded_tv = 1.;
    while idx < ballots.len() {
        let cand = ballots[idx];
        // check if this is the first valid preference
        // (not elected and not eliminated)
        if let Some(tv) = result[cand] {
            // this cand is elected, so this is not first valid preference
            // this voter's vote must have flowed to this cand previously,
            // so compound the transfer value
            compounded_tv *= tv;
            // move on to the next rank on the ballot
            idx += 1;
        } else if !is_nth_flag_set(eliminated, cand) {
            // this cand is not elected and not eliminated, so this is the
            // first valid preference
            // check if it is also the candidate to search for
            if cand == idx_to_search {
                // find their next valid preference
                for next_cand in &ballots[idx + 1..next_row_idx] {
                    if result[*next_cand].is_none()
                        && !is_nth_flag_set(eliminated, *next_cand)
                        && !is_nth_flag_set(pending, *next_cand)
                    {
                        // transfer this voter's vote to the next valid preference
                        votes_to_transfer[*next_cand] += compounded_tv;
                        break;
                    }
                }
            }
            // if this voter's first valid preference is not the one to search for,
            // there is nothing we need to do and we can move on to the next voter.
            // if we have transferred here, this voter's ballot is also fixed
            // and we can also move on to the next voter
            idx = next_row_idx;
            next_row_idx += n_candidates;
            // reset the compounded transfer value for this voter
            // as the next voter's preferences might have gone through a
            // different flow of transfers
            compounded_tv = 1.;
        } else {
            // cand is not elected but eliminated, continue searching
            idx += 1;
        }
    }
    votes_to_transfer
}
