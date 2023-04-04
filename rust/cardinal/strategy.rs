use crate::methods::ApprovalStrategy;

impl ApprovalStrategy {
    pub fn dists_to_ballot(&self, dists: &[f32], result: &mut [f32]) {
        match self {
            ApprovalStrategy::Mean => mean_strategy(dists, result),
            ApprovalStrategy::Median => median_strategy(dists, result),
        }
    }
}

fn mean_strategy(dists: &[f32], result: &mut [f32]) {
    let mean = dists.iter().sum::<f32>() / dists.len() as f32;
    for (idx, dist) in dists.iter().enumerate() {
        if dist <= &mean {
            result[idx] = 1.;
        }
    }
}

fn median_strategy(dists: &[f32], result: &mut [f32]) {
    let mut to_sort = vec![0.; dists.len()];
    to_sort.copy_from_slice(dists);
    to_sort.sort_by(|a, b| a.partial_cmp(b).expect("partial_cmp found NaN"));

    let median = if to_sort.len() % 2 == 0 {
        // we want to floor it
        #[allow(clippy::integer_division)]
        let lower_mid = to_sort.len() / 2;
        let upper_mid = lower_mid + 1;
        to_sort[lower_mid] + to_sort[upper_mid]
    } else {
        // there's no rounding here so this is fine
        #[allow(clippy::integer_division)]
        to_sort[to_sort.len() / 2]
    };

    for (idx, dist) in dists.iter().enumerate() {
        if dist <= &median {
            result[idx] = 1.;
        }
    }
}
