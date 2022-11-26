use crate::{Party, Voter};

pub fn simulate() {
    let domain = (-100..100).map(|x| x as f64 / 100.);

    let voters: Vec<_> = domain
        .clone()
        .flat_map(|x| domain.clone().map(move |y| Voter { x, y }))
        .collect();

    let parties = &[Party {
        x: -0.7,
        y: 0.7,
        name: "A".to_string(),
        color: "red".to_string(),
    }];
}
