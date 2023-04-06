use crate::types::AllocationResult;

// TODO: some code copied from largest remainders method
pub fn allocate_cardinal(
    mut ballots: Vec<f32>,
    total_seats: usize,
    n_candidates: usize,
    max_score: f32,
) -> AllocationResult {
    let originals = ballots.clone();
    // no candidates elected at the beginning
    let mut result: Vec<usize> = vec![0; n_candidates];

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
        reweight_ballots(&mut ballots, pos, &result, max_score, n_candidates);

        current_seats += 1;
    }

    result
}

fn reweight_ballots(
    ballots: &mut [f32],
    pos: usize,
    result: &[usize],
    max_score: f32,
    n_candidates: usize,
) {
    // TODO(parallel): can be parallelized, only mutating distinct
    // elements so no synchronization needed
    for ballot in ballots.chunks_exact_mut(n_candidates) {
        if ballot[pos] != 0. {
            // we can use an aux vec to keep track of every voter's current
            // num_of_elected
            // once a new candidate has been elected, we only need to check
            // if a voter has approved of this candidate
            // if yes, we fetch their current num_of_elected and increment it
            // then use the new value
            // also this should be named sum_of_elected_scores for rrv
            // for spav, the scores are always 1 so it is equivalent to the count
            let num_of_elected: f32 = ballot
                .iter()
                .enumerate()
                .filter(|(idx, _)| result[*idx] == 1)
                .map(|(_, x)| x)
                .sum();
            // this is the d'hondt divisor, the sainte lague divisor could be used
            // instead
            let weight = 1. / (1. + (num_of_elected / max_score));
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
