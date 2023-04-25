pub fn reweight_sss(
    quota: f32,
    ballots: &mut [f32],
    aux: &mut [f32],
    pos: usize,
    n_candidates: usize,
) {
    let scores_for_winner: Vec<_> = ballots
        .chunks_exact(n_candidates)
        .map(|ballot| ballot[pos])
        .collect();

    let winner_sum_of_scores: f32 = scores_for_winner.iter().sum();

    let surplus_factor = f32::max(winner_sum_of_scores / quota, 1.);

    // scores spent on the winner by each voter
    let scores_spent = scores_for_winner.iter().map(|x| x / surplus_factor);

    for (weight, spent) in aux.iter_mut().zip(scores_spent) {
        *weight = (*weight - spent).clamp(0., 1.);
    }
}
