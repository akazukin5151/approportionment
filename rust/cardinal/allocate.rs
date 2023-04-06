use crate::types::AllocationResult;

// TODO: some code copied from largest remainders method
pub fn allocate_cardinal(
    mut ballots: Vec<f32>,
    total_seats: usize,
    n_candidates: usize,
    n_voters: usize,
) -> AllocationResult {
    let originals = ballots.clone();
    // no candidates elected at the beginning
    let mut result: Vec<usize> = vec![0; n_candidates];
    let mut sums_of_elected = vec![0.; n_voters];

    let mut current_seats = 0;
    while current_seats < total_seats {
        let mut counts = vec![0.; n_candidates];
        // TODO(parallel): can be parallelized if enough voters
        for ballot in ballots.chunks_exact(n_candidates) {
            for (idx, value) in ballot.iter().enumerate() {
                counts[idx] += value;
            }
        }

        // find the candidate with most votes
        // O(p)
        let (pos, _) = counts
            .iter()
            .enumerate()
            .max_by(|(_, a), (_, b)| {
                a.partial_cmp(b).expect("partial_cmp found NaN")
            })
            .expect("counts is empty");

        // give the largest candidate 1 seat.
        result[pos] += 1;

        // re-weight all ballots that approved of the candidate just elected
        ballots.clone_from_slice(&originals);
        reweight_ballots(
            &mut ballots,
            &mut sums_of_elected,
            pos,
            &result,
            n_candidates,
        );

        current_seats += 1;
    }

    result
}

fn reweight_ballots(
    ballots: &mut [f32],
    sums_of_elected: &mut [f32],
    pos: usize,
    result: &[usize],
    n_candidates: usize,
) {
    // TODO(parallel): can be parallelized, only mutating distinct
    // elements so no synchronization needed
    for (voter_idx, ballot) in
        ballots.chunks_exact_mut(n_candidates).enumerate()
    {
        if ballot[pos] != 0. {
            // we want to sum up the scores of every elected candidate
            // instead of filtering and summing again every time,
            // we cache the latest sum for every voter.
            // every time this function runs, a new candidate (`pos`)
            // has been elected so we check if this voter has contributed
            // to this candidate's win. if so, we add their sum to the cache.
            let sum_of_elected = &mut sums_of_elected[voter_idx];
            *sum_of_elected += ballot[pos];
            // this is the d'hondt divisor, the sainte lague divisor could be used
            // instead
            let weight = 1. / (1. + *sum_of_elected);
            // TODO(parallel):
            // This could be parallelized but the gains probably isn't worth it
            // unless if there is an absurd amount of candidates
            for (idx, value) in ballot.iter_mut().enumerate() {
                if result[idx] == 1 {
                    *value = 0.;
                } else {
                    *value *= weight;
                }
            }
        }
    }
}
