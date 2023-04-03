#![allow(clippy::too_many_lines)]
#![allow(clippy::integer_division)]

use crate::{
    allocate::Allocate,
    stv::{
        australia::StvAustralia,
        tests::real::blt::{parse_blt, votes_to_ballots},
    },
};

fn ward(path: &str) -> (Vec<Vec<usize>>, Vec<usize>) {
    let blt = parse_blt(path);
    let ballots = votes_to_ballots(&blt);

    let n_voters = ballots.len() / blt.n_candidates;
    let mut a = StvAustralia::new(n_voters, blt.n_candidates);
    a.ballots = ballots;
    let mut rounds = vec![];
    let r =
        a.allocate_seats(blt.n_seats, blt.n_candidates, n_voters, &mut rounds);
    return (rounds, r);
}

#[test]
fn ward_1() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-1-Linn-reports-for-publication/PreferenceProfile_V0001_Ward-1-Linn_06052022_163754.blt");
    assert_eq!(r, vec![0, 1, 0, 1, 0, 1, 0, 1, 0]);
}

// this election gives different results because australian STV truncates
// but scottish STV keeps 5dp.
// very small differences in the beginning rounds compounded to larger
// differences, and although the order of eliminations were the same,
// the final elimination was different
#[test]
#[ignore]
fn ward_2() {
    let (rounds, r) = ward("rust/stv/tests/real/data/Ward-2-Newlands-Auldburn-reports-for-publication/PreferenceProfile_V0001_Ward-2-Newlands-Auldburn_06052022_165250.blt");
    // this is what our algorithm outputs, which is different
    // from the official one
    assert_eq!(
        rounds,
        vec![
            vec![1928, 554, 2074, 638, 428, 82, 682, 857, 175, 147],
            vec![1892, 591, 1892, 664, 555, 83, 686, 858, 176, 148],
            vec![1892, 605, 1892, 687, 563, 0, 696, 863, 179, 156],
            vec![1892, 626, 1892, 699, 616, 0, 712, 867, 185, 0],
            vec![1892, 681, 1892, 739, 625, 0, 734, 894, 0, 0],
            vec![1892, 757, 1892, 988, 0, 0, 768, 902, 0, 0],
            vec![1892, 0, 1892, 1156, 0, 0, 855, 975, 0, 0],
            vec![1892, 0, 1892, 1285, 0, 0, 0, 1308, 0, 0],
            vec![1892, 0, 1892, 0, 0, 0, 0, 1431, 0, 0]
        ]
    );
    assert_eq!(r, vec![1, 0, 1, 1, 0, 0, 0, 0, 0, 0]);
}

#[test]
fn ward_3() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-3-Greater-Pollok-reports-for-publication/PreferenceProfile_V0001_Ward-3-Greater-Pollok_06052022_163750.blt");
    assert_eq!(r, vec![1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0]);
}

#[test]
fn ward_4() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-4-Cardonald-reports-for-publication/PreferenceProfile_V0001_Ward-4-Cardonald_06052022_163754.blt");
    assert_eq!(r, vec![0, 0, 0, 1, 1, 1, 0, 0, 1]);
}

#[test]
fn ward_5() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-5-Govan-reports-for-publication/PreferenceProfile_V0001_Ward-5-Govan_06052022_165258.blt");
    assert_eq!(r, vec![1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0]);
}

#[test]
fn ward_6() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-6-Pollokshields-reports-for-publication/PreferenceProfile_V0001_Ward-6-Pollokshields_06052022_170301.blt");
    assert_eq!(r, vec![0, 1, 0, 1, 0, 1, 1, 0, 0, 0]);
}

#[test]
fn ward_7() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-7-Langside-reports-for-publication/PreferenceProfile_V0001_Ward-7-Langside_06052022_165250.blt");
    assert_eq!(r, vec![1, 1, 1, 1, 0, 0, 0, 0, 0]);
}

#[test]
fn ward_8() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-8-Southside-Central-reports-for-publication/PreferenceProfile_V0001_Ward-8-Southside-Central_06052022_165258.blt");
    assert_eq!(r, vec![1, 0, 0, 0, 1, 0, 0, 0, 1, 1]);
}

#[test]
fn ward_9() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-9-Calton-reports-for-publication/PreferenceProfile_V0001_Ward-9-Calton_06052022_163749.blt");
    assert_eq!(r, vec![0, 1, 0, 1, 0, 1, 1, 0, 0]);
}

#[test]
fn ward_10() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-10-Anderston-City-Yorkhill-reports-for-publication/PreferenceProfile_V0001_Ward-10-Anderston-City-Yorkhill_06052022_170256.blt");
    assert_eq!(r, vec![0, 1, 1, 0, 0, 0, 1, 1, 0, 0]);
}

#[test]
fn ward_11() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-11-Hillhead-reports-for-publication/PreferenceProfile_V0001_Ward-11-Hillhead_06052022_163755.blt");
    assert_eq!(r, vec![1, 0, 1, 0, 0, 1]);
}

#[test]
fn ward_12() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-12-Victoria-Park-reports-for-publication/PreferenceProfile_V0001_Ward-12-Victoria-Park_06052022_163755.blt");
    assert_eq!(r, vec![0, 1, 1, 1, 0, 0]);
}

#[test]
fn ward_13() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-13-Garscadden-Scotstounhill-reports-for-publication/PreferenceProfile_V0001_Ward-13-Garscadden-Scotstounhill_06052022_165250.blt");
    assert_eq!(r, vec![1, 1, 0, 1, 0, 1, 0, 0]);
}

#[test]
fn ward_14() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-14-Drumchapel-Anniesland-reports-for-publication/PreferenceProfile_V0001_Ward-14-Drumchapel-Anniesland_06052022_170258.blt");
    assert_eq!(r, vec![1, 1, 1, 0, 1, 0, 0, 0, 0, 0]);
}

#[test]
fn ward_15() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-15-Maryhill-reports-for-publication/PreferenceProfile_V0001_Ward-15-Maryhill_06052022_165258.blt");
    assert_eq!(r, vec![1, 0, 0, 0, 0, 1, 1, 0]);
}

#[test]
fn ward_16() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-16-Canal-reports-for-publication/PreferenceProfile_V0001_Ward-16-Canal_06052022_163755.blt");
    assert_eq!(r, vec![1, 1, 0, 0, 1, 1, 0, 0, 0, 0]);
}

#[test]
fn ward_17() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-17-Springburn-Robroyston-reports-for-publication/PreferenceProfile_V0001_Ward-17-Springburn-Robroyston_06052022_170301.blt");
    assert_eq!(r, vec![1, 1, 0, 1, 0, 0, 0, 1]);
}

#[test]
fn ward_18() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-18-East-Centre-reports-for-publication/PreferenceProfile_V0001_Ward-18-East-Centre_06052022_165259.blt");
    assert_eq!(r, vec![1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
}

#[test]
fn ward_19() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-19-Shettleston-reports-for-publication/PreferenceProfile_V0001_Ward-19-Shettleston_06052022_170301.blt");
    assert_eq!(r, vec![0, 1, 1, 1, 0, 1, 0, 0]);
}

#[test]
fn ward_20() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-20-Baillieston-reports-for-publication/PreferenceProfile_V0001_Ward-20-Baillieston_06052022_170301.blt");
    assert_eq!(r, vec![1, 0, 0, 1, 1, 0, 0]);
}

#[test]
fn ward_21() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-21-North-East-reports-for-publication/PreferenceProfile_V0001_Ward-21-North-East_06052022_170301.blt");
    assert_eq!(r, vec![1, 1, 1, 0, 0, 0, 0, 0,]);
}

#[test]
fn ward_22() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-22-Dennistoun-reports-for-publication/PreferenceProfile_V0001_Ward-22-Dennistoun_06052022_163757.blt");
    assert_eq!(r, vec![1, 1, 0, 0, 0, 0, 1]);
}

#[test]
fn ward_23() {
    let (_, r) = ward("rust/stv/tests/real/data/Ward-23-Partick-East-Kelvindale-reports-for-publication/PreferenceProfile_V0001_Ward-23-Partick-East-Kelvindale_06052022_170257.blt");
    assert_eq!(r, vec![1, 0, 1, 1, 1, 0, 0, 0, 0]);
}
