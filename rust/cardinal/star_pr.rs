use crate::utils::f32_cmp;

pub fn reweight_star_pr(
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
    weights_and_scores.sort_unstable_by(|(_, a), (_, b)| f32_cmp(b, a));

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
            sum_weights_eq += **weight;
        } else {
            break;
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
