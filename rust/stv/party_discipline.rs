/// these functions will sort candidates by distance, but enforce
/// party discipline by ranking all candidates from a more preferred
/// party over a less preferred party
///
/// there are different ways to determine the preference order of parties,
/// such as minimum distance and mean distance
use crate::distance::distance_stv;
use crate::types::{Party, XY};

// TODO: reuse returned vecs

/// a party is more preferred than another if its closest candidate
/// is closer than the other party's closest candidate.
pub fn min_party_discipline_sort(
    voter: &XY,
    candidates: &[Party],
    party_of_cands: &[usize],
    n_parties: usize,
) -> Vec<usize> {
    // O(c)
    let mut distances: Vec<_> = candidates
        .iter()
        .enumerate()
        .map(|(cand_idx, candidate)| {
            let party_idx = party_of_cands[cand_idx];
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
    let mut seen = vec![vec![]; n_parties];
    let mut parties_in_order = Vec::with_capacity(n_parties);
    for (cand_idx, party_idx, _) in distances {
        if seen[party_idx].is_empty() {
            parties_in_order.push(party_idx);
        }
        seen[party_idx].push(cand_idx);
    }

    // O(p)
    let mut ranked_cand_idxs = Vec::with_capacity(candidates.len());
    for party_idx in parties_in_order {
        ranked_cand_idxs.extend_from_slice(&seen[party_idx]);
    }
    ranked_cand_idxs
}

// TODO: not used yet. this can actually be optimized to finding the party's
// average point, so that averaging only needs to be done once.
// best to use another feature flag, but how to adjust fraction of discipline?
// could also mix in normal, min, and mean, but having all 3 is rather complex
// to visualize
/// a party is preferred if the mean distance of its candidates is closer
/// than the other party's mean
pub fn mean_party_discipline_sort(
    voter: &XY,
    candidates: &[Party],
    party_of_cands: &[usize],
    n_parties: usize,
) -> Vec<usize> {
    // O(c)
    let mut distances: Vec<_> = candidates
        .iter()
        .enumerate()
        .map(|(cand_idx, candidate)| {
            let party_idx = party_of_cands[cand_idx];
            (cand_idx, party_idx, distance_stv(candidate, voter))
        })
        .collect();
    // O(c*log(c))
    distances.sort_unstable_by(|(_, _, a), (_, _, b)| {
        a.partial_cmp(b).expect("partial_cmp found NaN")
    });

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
    let mut ranked_cand_idxs = Vec::with_capacity(candidates.len());
    for (party_idx, _) in avgs {
        ranked_cand_idxs.extend_from_slice(&seen[party_idx]);
    }
    ranked_cand_idxs
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_party_discipline_sort() {
        // voter at origin and cand y = 0
        // ensures that the distance is equal to cand x
        let voter = XY { x: 0., y: 0. };
        let candidates = [
            Party {
                x: 4.2,
                y: 0.,
                coalition: Some(1),
            },
            Party {
                x: 3.1,
                y: 0.,
                coalition: Some(0),
            },
            Party {
                x: 3.4,
                y: 0.,
                coalition: Some(3),
            },
            Party {
                x: 2.1,
                y: 0.,
                coalition: Some(1),
            },
            Party {
                x: 0.1,
                y: 0.,
                coalition: Some(2),
            },
        ];
        let party_of_cands = [1, 0, 3, 1, 2];
        let n_parties = 4;
        let r = min_party_discipline_sort(
            &voter,
            &candidates,
            &party_of_cands,
            n_parties,
        );
        assert_eq!(r, vec![4, 3, 0, 1, 2]);

        let ranked_pos: Vec<_> =
            r.iter().map(|idx| candidates[*idx].x).collect();

        // the cand with dist of 4.2 (cand #4) shows party discipline
        // it was ranked over closer candidates only because their party (#1)
        // has another candidate (#3) that was even closer (dist of 2.1)
        assert_eq!(ranked_pos, vec![0.1, 2.1, 4.2, 3.1, 3.4])
    }

    #[test]
    fn test_mean_party_discipline_sort() {
        // voter at origin and cand y = 0
        // ensures that the distance is equal to cand x
        let voter = XY { x: 0., y: 0. };
        let candidates = [
            Party {
                x: 4.2,
                y: 0.,
                coalition: Some(1),
            },
            Party {
                x: 3.1,
                y: 0.,
                coalition: Some(0),
            },
            Party {
                x: 3.4,
                y: 0.,
                coalition: Some(3),
            },
            Party {
                x: 2.1,
                y: 0.,
                coalition: Some(1),
            },
            Party {
                x: 0.1,
                y: 0.,
                coalition: Some(2),
            },
        ];
        let party_of_cands = [1, 0, 3, 1, 2];
        let n_parties = 4;
        let r = mean_party_discipline_sort(
            &voter,
            &candidates,
            &party_of_cands,
            n_parties,
        );
        assert_eq!(r, vec![4, 1, 3, 0, 2]);

        let ranked_pos: Vec<_> =
            r.iter().map(|idx| candidates[*idx].x).collect();

        // Although cand #3 (dist = 2.1) is closer than cand #1 (dist = 3.1),
        // their party (#1) also includes cand #0 (dist = 4.2).
        // Party #1's mean distance is therefore 3.15, so this voter
        // ranks cand #1 over all candidates from party #1, but still shows
        // party discipline by ranking all candidates from party #1 next.
        // The last cand has a even larger average distance (3.4).
        // Although cand #3 is rather close, they are punished by their association
        // to the more disliked candidate #0
        assert_eq!(ranked_pos, vec![0.1, 3.1, 2.1, 4.2, 3.4])
    }
}
