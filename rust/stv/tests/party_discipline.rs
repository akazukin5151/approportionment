use crate::{
    stv::sort_cands::{mean_party_discipline_sort, min_party_discipline_sort},
    types::{Party, XY},
};

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

    let ranked_pos: Vec<_> = r.iter().map(|idx| candidates[*idx].x).collect();

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

    let ranked_pos: Vec<_> = r.iter().map(|idx| candidates[*idx].x).collect();

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
