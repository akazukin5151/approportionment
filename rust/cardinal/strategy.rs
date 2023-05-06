#[cfg(test)]
mod tests;

use serde::Deserialize;
#[cfg(test)]
use serde::Serialize;

use crate::{types::SimulateElectionsArgs, utils::f32_cmp};

pub trait Strategy {
    fn dists_to_ballot(
        &self,
        dists: &[f32],
        result: &mut [f32],
        args: &SimulateElectionsArgs,
    );
}

// only for benchmarks
#[cfg_attr(test, derive(Serialize))]
#[derive(Clone, Copy, Deserialize)]
pub enum CardinalStrategy {
    // Approval (integers)
    /// The approval radius for a voter is the mean distance to all candidates
    /// The voter will approve of all candidates less than or equal to the mean
    Mean,
    /// The approval radius for a voter is the median distance to all candidates
    /// The voter will approve of all candidates less than or equal to the median
    Median,
    // All voters approve of a fixed number of candidates
    // The voter will approve of the n-nearest candidates
    // FixedN(usize)

    // Score (floats)
    /// Distances are normalized (stretched from 0.0 to 1.0), and the
    /// intermediate values are transformed in a linear manner
    NormedLinear,
    /// Voters will bullet vote and rate their favourite candidate the highest
    /// and all other candidates the lowest, even if they are from the same party
    Bullet,

    /// max score for all candidates of the favourite party, 0 for everyone else
    PartyBullet,
    // All voters will score candidates according to a fixed scale
    // The scale is a mapping of distances to scores
    // (NB: isn't a function better than a vec?)
    //
    // see also (but be careful of non monotonic functions):
    // https://www.source-code.biz/snippets/typescript/functionCurveEditor/
    // https://github.com/d3/d3-shape#curves
    // FixedScale(Vec<f32>)
}

impl Strategy for CardinalStrategy {
    fn dists_to_ballot(
        &self,
        dists: &[f32],
        result: &mut [f32],
        args: &SimulateElectionsArgs,
    ) {
        match self {
            CardinalStrategy::Mean => mean_strategy(dists, result),
            CardinalStrategy::Median => median_strategy(dists, result),
            CardinalStrategy::NormedLinear => normed_linear(dists, result),
            CardinalStrategy::Bullet => bullet(dists, result),
            CardinalStrategy::PartyBullet => party_bullet(dists, result, args),
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
    // as dists is already an aux vec, we can sort in place,
    // but we want to access the original indices later, so might as well
    // copy
    let mut buf = vec![0.; dists.len()];
    buf.copy_from_slice(dists);
    let median = quickselect_median(&mut buf);

    for (idx, dist) in dists.iter().enumerate() {
        if dist <= &median {
            result[idx] = 1.;
        }
    }
}

fn quickselect_median(arr: &mut [f32]) -> f32 {
    // we don't care about the remainder
    #[allow(clippy::integer_division)]
    let l = arr.len() / 2;
    if arr.len() % 2 == 1 {
        *arr.select_nth_unstable_by(l, f32_cmp).1
    } else {
        let (_, lower_mid, end) = arr.select_nth_unstable_by(l - 1, f32_cmp);
        let (_, upper_mid, _) = end.select_nth_unstable_by(0, f32_cmp);
        (*lower_mid + *upper_mid) / 2.
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

fn bullet(dists: &[f32], result: &mut [f32]) {
    let (best_idx, _) = dists
        .iter()
        .enumerate()
        .min_by(|(_, a), (_, b)| f32_cmp(a, b))
        .unwrap();
    for (idx, _) in dists.iter().enumerate() {
        if idx == best_idx {
            result[idx] = 1.;
        } else {
            result[idx] = 0.;
        }
    }
}

fn party_bullet(
    dists: &[f32],
    result: &mut [f32],
    args: &SimulateElectionsArgs,
) {
    let (best_idx, _) = dists
        .iter()
        .enumerate()
        .min_by(|(_, a), (_, b)| f32_cmp(a, b))
        .unwrap();
    let party_of_cands = args.party_of_cands.as_ref().unwrap();
    let best_party_idx = party_of_cands[best_idx];
    for (idx, _) in dists.iter().enumerate() {
        if party_of_cands[idx] == best_party_idx {
            result[idx] = 1.;
        } else {
            result[idx] = 0.;
        }
    }
}

