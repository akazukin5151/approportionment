use crate::{*, generators::generate_ballots};

pub struct Droop;

impl Allocate for Droop {
    type Ballot = usize;

    fn generate_ballots(
        &self,
        voters: &[Voter],
        parties: &[Party],
        bar: &Option<ProgressBar>,
        ballots: &mut [Self::Ballot],
    ) {
        generate_ballots(voters, parties, bar, ballots);
    }

    fn allocate_seats(
        &self,
        ballots: &[Self::Ballot],
        total_seats: usize,
        n_parties: usize,
    ) -> AllocationResult {
        allocate_largest_remainder(
            |v, s| {
                let v = v as f32;
                let s = s as f32;
                let x = v / (1. + s);
                let xf = x.floor();
                1. + xf
            },
            total_seats,
            &ballots,
            n_parties,
        )
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn droop_quota_rounding_1() {
        let mut ballots = vec![0; 43704];
        ballots.extend(vec![1; 492884]);

        let r = Droop.allocate_seats(&ballots, 883, 2);

        assert_eq!(r, vec![72, 811]);
    }

    #[test]
    fn droop_quota_rounding_2() {
        let mut ballots = vec![0; 160218];
        ballots.extend(vec![1; 164154]);

        let r = Droop.allocate_seats(&ballots, 990, 2);

        assert_eq!(r, vec![489, 501]);
    }

    #[test]
    fn droop_wikipedia() {
        let mut ballots = vec![0; 47_000];
        ballots.extend(vec![1; 16_000]);
        ballots.extend(vec![2; 15_800]);
        ballots.extend(vec![3; 12_000]);
        ballots.extend(vec![4; 6100]);
        ballots.extend(vec![5; 3100]);

        let r = Droop.allocate_seats(&ballots, 10, 6);

        assert_eq!(r, vec![5, 2, 2, 1, 0, 0]);
    }

}
