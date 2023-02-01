use crate::{generators::generate_ballots, *};

pub struct Droop(Vec<usize>);

impl Allocate for Droop {
    fn new(n_voters: usize) -> Self {
        Self(vec![Default::default(); n_voters])
    }

    fn generate_ballots(
        &mut self,
        voters: &[XY],
        parties: &[XY],
        #[cfg(feature = "progress_bar")] bar: &ProgressBar,
    ) {
        generate_ballots(
            voters,
            parties,
            #[cfg(feature = "progress_bar")]
            bar,
            &mut self.0,
        );
    }

    fn allocate_seats(
        &self,
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
            &self.0,
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

        let mut a = Droop::new(ballots.iter().sum());
        a.0 = ballots;
        let r = a.allocate_seats(883, 2);

        assert_eq!(r, vec![72, 811]);
    }

    #[test]
    fn droop_quota_rounding_2() {
        let mut ballots = vec![0; 160218];
        ballots.extend(vec![1; 164154]);

        let mut a = Droop::new(ballots.iter().sum());
        a.0 = ballots;
        let r = a.allocate_seats(990, 2);

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

        let mut a = Droop::new(ballots.iter().sum());
        a.0 = ballots;
        let r = a.allocate_seats(10, 6);

        assert_eq!(r, vec![5, 2, 2, 1, 0, 0]);
    }
}
