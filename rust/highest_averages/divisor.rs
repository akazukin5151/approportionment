pub trait Quotient {
    fn quotient(&self, original_votes: f32, n_seats_won: f32) -> f32;
}

pub enum Divisor {
    DHondt,
    SainteLague,
}

impl Quotient for Divisor {
    fn quotient(&self, original_votes: f32, n_seats_won: f32) -> f32 {
        match self {
            Divisor::DHondt => original_votes / (n_seats_won + 1.),
            Divisor::SainteLague => original_votes / (2. * n_seats_won + 1.),
        }
    }
}

