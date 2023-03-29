use std::fs;

pub struct Blt {
    pub n_candidates: usize,
    pub n_seats: usize,
    pub votes: Vec<(usize, Vec<usize>)>,
}

pub fn parse_blt(path: &str) -> Blt {
    let file = fs::read_to_string(path).unwrap();
    let mut lines = file.split("\r\n");

    let header = lines.next().unwrap();
    let mut hs = header.split(' ');
    let n_candidates: usize = hs.next().unwrap().parse().unwrap();
    let n_seats: usize = hs.next().unwrap().parse().unwrap();

    let mut votes = vec![];
    for line in lines {
        if line == "0" {
            break;
        }
        let mut splitted = line.split(' ');
        let freq: usize = splitted.next().unwrap().parse().unwrap();
        let mut ranks: Vec<_> = splitted
            .map(|x| x.parse::<usize>().unwrap().saturating_sub(1))
            .collect();
        ranks.pop();
        votes.push((freq, ranks));
    }

    Blt {
        n_candidates,
        n_seats,
        votes,
    }
}

pub fn votes_to_ballots(blt: &Blt) -> Vec<usize> {
    let mut ballots = vec![];
    for (freq, ranks) in &blt.votes {
        for _ in 0..*freq {
            let mut row = ranks.clone();
            for _ in 0..(blt.n_candidates - row.len()) {
                row.push(blt.n_candidates);
            }
            ballots.extend(row);
        }
    }
    ballots
}

mod test {
    use super::*;
    use crate::stv::tests::real::blt_result::blt_result;

    #[test]
    fn test_parse_blt() {
        let path = "rust/stv/tests/real/data/Ward-1-Linn-reports-for-publication/PreferenceProfile_V0001_Ward-1-Linn_06052022_163754.blt";
        let blt = parse_blt(path);
        assert_eq!(blt.n_candidates, 9);
        assert_eq!(blt.n_seats, 4);
        assert_eq!(blt.votes, blt_result());

        let ballots = votes_to_ballots(&blt);
        assert_eq!(ballots[0..9], vec![5, 1, 3, 7, 9, 9, 9, 9, 9]);
        assert_eq!(ballots[45..54], vec![3, 5, 8, 2, 7, 1, 4, 6, 0]);
    }
}
