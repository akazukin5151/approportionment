#![allow(clippy::too_many_lines)]
#![allow(clippy::integer_division)]

use crate::stv::tests::real::blt::*;
use crate::stv::*;
use crate::*;

#[test]
fn ward_1() {
    let path = "rust/stv/tests/real/data/Ward-1-Linn-reports-for-publication/PreferenceProfile_V0001_Ward-1-Linn_06052022_163754.blt";
    let blt = parse_blt(path);
    let ballots = votes_to_ballots(&blt);

    let n_voters = ballots.len() / blt.n_candidates;
    let mut a = StvAustralia::new(n_voters, blt.n_candidates);
    a.ballots = ballots;
    let mut rounds = vec![];
    let r = a.allocate_seats(blt.n_seats, blt.n_candidates, n_voters, &mut rounds);
    assert_eq!(r, vec![0, 1, 0, 1, 0, 1, 0, 1, 0]);
}
