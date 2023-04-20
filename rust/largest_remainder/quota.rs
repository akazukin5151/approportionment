pub enum Quota {
    Hare,
    Droop,
}

pub trait QuotaF {
    fn quota_f(&self, n_voters: f32, n_seats: f32) -> f32;
}

impl QuotaF for Quota {
    fn quota_f(&self, n_voters: f32, n_seats: f32) -> f32 {
        match self {
            Quota::Hare => n_voters / n_seats,
            Quota::Droop => {
                let x = n_voters / (1. + n_seats);
                let xf = x.floor();
                1. + xf
            }
        }
    }
}

