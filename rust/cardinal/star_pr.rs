use super::allocate::AllocateCardinal;

pub struct StarPr {
    quota: f32,
}

impl StarPr {
    pub fn new(n_voters: usize, total_seats: usize) -> Self {
        Self {
            quota: n_voters as f32 / total_seats as f32,
        }
    }
}

impl AllocateCardinal for StarPr {
    fn aux_init(&self) -> f32 {
        1.
    }

    fn count(
        &self,
        ballots: &[f32],
        n_candidates: usize,
        result: &[usize],
        counts: &mut [f32],
        aux: &[f32],
    ) {
        for (v_idx, ballot) in ballots.chunks_exact(n_candidates).enumerate() {
            for (c_idx, value) in ballot.iter().enumerate() {
                // only count votes for un-elected candidates
                if result[c_idx] == 0 {
                    counts[c_idx] += value * aux[v_idx];
                }
            }
        }
    }

    fn reweight(
        &self,
        ballots: &mut [f32],
        aux: &mut [f32],
        pos: usize,
        _: &[usize],
        n_candidates: usize,
    ) {
        reweight(ballots, n_candidates, pos, aux, self.quota);
    }
}

fn reweight(
    ballots: &[f32],
    n_candidates: usize,
    idx_of_max: usize,
    ballot_weights: &mut [f32],
    quota: f32,
) {
    let scores_for_winner: Vec<_> = ballots
        .chunks_exact(n_candidates)
        .map(|ballot| ballot[idx_of_max])
        .collect();

    let mut weights_and_scores: Vec<_> =
        ballot_weights.iter_mut().zip(&scores_for_winner).collect();

    // sort by scores_for_winner, largest first
    weights_and_scores
        .sort_unstable_by(|(_, a), (_, b)| b.partial_cmp(a).unwrap());

    let mut cumulative_sum = 0.;
    let mut idx = 0;
    for (j, (weight, _)) in weights_and_scores.iter().enumerate() {
        if cumulative_sum >= quota {
            break;
        }
        cumulative_sum += **weight;
        idx = j;
    }

    let split_point = *weights_and_scores[..idx - 2]
        .iter()
        .min_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap())
        .unwrap()
        .1;

    // sum of weights for scores gte to split_point
    let mut sum_weights_above = 0.;
    for (weight, score) in weights_and_scores.iter() {
        if **score == split_point {
            break;
        }
        sum_weights_above += **weight;
    }

    if sum_weights_above > 0. {
        for (weight, score) in weights_and_scores.iter_mut() {
            if **score == split_point {
                break;
            }
            **weight = 0.;
        }
    }

    // sum of weights for scores equal to split_point
    let mut sum_weights_eq = 0.;
    for (weight, score) in weights_and_scores.iter() {
        if **score == split_point {
            // TODO: break early
            sum_weights_eq += **weight;
        }
    }

    if sum_weights_eq > 0. {
        let spent_value = (quota - sum_weights_above) / sum_weights_eq;
        let fraction = (1. - spent_value).clamp(0., 1.);
        for (weight, score) in weights_and_scores.iter_mut() {
            if **score == split_point {
                **weight *= fraction;
            }
        }
    }
}

