use crate::{
    distance::distance_stv,
    types::{SimulateElectionsArgs, XY},
};

// TODO: reuse returned vecs
#[inline(always)]
pub fn normal_sort(voter: &XY, args: &SimulateElectionsArgs) -> Vec<usize> {
    let mut distances: Vec<_> = args
        .parties
        .iter()
        .enumerate()
        .map(|(idx, candidate)| (idx, distance_stv(candidate, voter)))
        .collect();
    distances.sort_unstable_by(|(_, a), (_, b)| {
        a.partial_cmp(b).expect("partial_cmp found NaN")
    });
    distances.iter().map(|(cand_idx, _)| *cand_idx).collect()
}

/// a party is more preferred than another if its closest candidate
/// is closer than the other party's closest candidate.
pub fn min_party_discipline_sort(
    voter: &XY,
    args: &SimulateElectionsArgs,
) -> Vec<usize> {
    // O(c)
    let mut distances: Vec<_> = args
        .parties
        .iter()
        .enumerate()
        .map(|(cand_idx, candidate)| {
            let party_idx = args.party_of_cands.as_ref().unwrap()[cand_idx];
            (cand_idx, party_idx, distance_stv(candidate, voter))
        })
        .collect();
    // O(c*log(c))
    distances.sort_unstable_by(|(_, _, a), (_, _, b)| {
        a.partial_cmp(b).expect("partial_cmp found NaN")
    });

    // TODO: how long is the inner vec?
    // TODO: we create 3 vectors here - they can be reused
    // O(c)
    let n_parties = args.n_parties.unwrap();
    let mut seen = vec![vec![]; n_parties];
    let mut parties_in_order = Vec::with_capacity(n_parties);
    for (cand_idx, party_idx, _) in distances {
        if seen[party_idx].is_empty() {
            parties_in_order.push(party_idx);
        }
        seen[party_idx].push(cand_idx);
    }

    // O(p)
    let mut ranked_cand_idxs = Vec::with_capacity(args.parties.len());
    for party_idx in parties_in_order {
        ranked_cand_idxs.extend_from_slice(&seen[party_idx]);
    }
    ranked_cand_idxs
}

// TODO: this can actually be optimized to finding the party's
// average point, so that averaging only needs to be done once.
// best to use another feature flag, but how to adjust fraction of discipline?
// could also mix in normal, min, and mean, but having all 3 is rather complex
// to visualize
/// a party is preferred if the mean distance of its candidates is closer
/// than the other party's mean
pub fn mean_party_discipline_sort(
    voter: &XY,
    args: &SimulateElectionsArgs,
) -> Vec<usize> {
    // O(c)
    let mut distances: Vec<_> = args
        .parties
        .iter()
        .enumerate()
        .map(|(cand_idx, candidate)| {
            let party_idx = args.party_of_cands.as_ref().unwrap()[cand_idx];
            (cand_idx, party_idx, distance_stv(candidate, voter))
        })
        .collect();
    // O(c*log(c))
    distances.sort_unstable_by(|(_, _, a), (_, _, b)| {
        a.partial_cmp(b).expect("partial_cmp found NaN")
    });

    let n_parties = args.n_parties.unwrap();
    let mut sum_for_parties = vec![0.; n_parties];
    let mut count_for_parties = vec![0.; n_parties];

    // TODO: how long is the inner vec?
    // TODO: we create 3 vectors here - they can be reused
    // O(c)
    let mut seen = vec![vec![]; n_parties];
    let mut parties_in_order = Vec::with_capacity(n_parties);
    for (cand_idx, party_idx, dist) in distances {
        if seen[party_idx].is_empty() {
            parties_in_order.push(party_idx);
        }
        seen[party_idx].push(cand_idx);
        sum_for_parties[party_idx] += dist;
        count_for_parties[party_idx] += 1.0;
    }

    let mut avgs: Vec<_> = sum_for_parties
        .iter()
        .zip(count_for_parties)
        .map(|(s, c)| s / c)
        .enumerate()
        .collect();

    avgs.sort_unstable_by(|(_, a), (_, b)| {
        a.partial_cmp(b).expect("partial_cmp found NaN")
    });

    // O(p)
    let mut ranked_cand_idxs = Vec::with_capacity(args.parties.len());
    for (party_idx, _) in avgs {
        ranked_cand_idxs.extend_from_slice(&seen[party_idx]);
    }
    ranked_cand_idxs
}
