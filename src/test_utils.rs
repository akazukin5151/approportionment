use crate::*;
use std::collections::HashMap;

pub fn generic_party(name: &str) -> Party {
    Party {
        x: 0.0,
        y: 0.0,
        name: name.to_string(),
        color: Rgb { r: 0, g: 0, b: 0 },
    }
}

pub fn assert(r: &HashMap<Party, u32>, name: &str, value: u32) {
    assert_eq!(r.get(&generic_party(name)).unwrap(), &value);
}
