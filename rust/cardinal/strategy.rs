use serde::Deserialize;

pub trait Strategy {
    fn dists_to_ballot(&self, dists: &[f32], result: &mut [f32]);
}

#[derive(Deserialize)]
pub enum CardinalStrategy {
    // Approval (integers)
    Mean,
    Median,

    // Score (floats)
    NormedLinear,
    // Fixed(Vec<f32>)
}

impl Default for CardinalStrategy {
    fn default() -> Self {
        CardinalStrategy::Mean
    }
}

impl Strategy for CardinalStrategy {
    fn dists_to_ballot(&self, dists: &[f32], result: &mut [f32]) {
        match self {
            CardinalStrategy::Mean => mean_strategy(dists, result),
            CardinalStrategy::Median => median_strategy(dists, result),
            CardinalStrategy::NormedLinear => normed_linear(dists, result),
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

    // TODO: partial sort half of the array instead
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

fn normed_linear(dists: &[f32], result: &mut [f32]) {
    let (max, min) =
        dists
            .iter()
            .fold((f32::MIN, f32::MAX), |(acc_max, acc_min), dist| {
                let curr_max = f32::max(acc_max, *dist);
                let curr_min = f32::min(acc_min, *dist);
                (curr_max, curr_min)
            });

    let range = max - min;
    for (idx, d) in dists.iter().enumerate() {
        result[idx] = 1. - ((d - min) / range);
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_normed_linear() {
        let dists = [2.3, 1.5, 3.4, 2.9];
        let mut result = [0., 0., 0., 0.];
        normed_linear(&dists, &mut result);
        assert_eq!(result, [0.5789474, 1.0, 0.0, 0.2631579]);
    }
}
