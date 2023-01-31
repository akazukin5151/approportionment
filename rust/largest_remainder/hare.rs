use crate::{generators::generate_ballots, *};

pub struct Hare(Vec<usize>);

impl Allocate for Hare {
    fn new(n_voters: usize) -> Self {
        Self(vec![Default::default(); n_voters])
    }

    fn generate_ballots(
        &mut self,
        voters: &[Voter],
        parties: &[Party],
        bar: &Option<ProgressBar>,
    ) {
        generate_ballots(voters, parties, bar, &mut self.0);
    }

    fn allocate_seats(
        &self,
        total_seats: usize,
        n_parties: usize,
    ) -> AllocationResult {
        allocate_largest_remainder(
            |v, s| v as f32 / s as f32,
            total_seats,
            &self.0,
            n_parties,
        )
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn hare_quota_rounding_1() {
        let mut ballots = vec![0; 43704];
        ballots.extend(vec![1; 492884]);

        let r = Hare.allocate_seats(&ballots, 883, 2);

        assert_eq!(r, vec![72, 811]);
    }

    #[test]
    fn hare_quota_rounding_2() {
        let mut ballots = vec![0; 160218];
        ballots.extend(vec![1; 164154]);

        let r = Hare.allocate_seats(&ballots, 990, 2);

        assert_eq!(r, vec![489, 501]);
    }

    #[test]
    fn hare_wikipedia() {
        let mut ballots = vec![0; 47_000];
        ballots.extend(vec![1; 16_000]);
        ballots.extend(vec![2; 15_800]);
        ballots.extend(vec![3; 12_000]);
        ballots.extend(vec![4; 6100]);
        ballots.extend(vec![5; 3100]);

        let r = Hare.allocate_seats(&ballots, 10, 6);

        assert_eq!(r, vec![5, 2, 1, 1, 1, 0]);
    }
}
