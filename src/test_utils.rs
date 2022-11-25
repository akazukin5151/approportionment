use crate::*;

pub fn generic_party(name: &str) -> Party {
    Party {
        x: unsafe { NotNan::new_unchecked(0.0) },
        y: unsafe { NotNan::new_unchecked(0.0) },
        name: name.to_string(),
        color: "".to_string(),
    }
}

pub fn assert(r: &HashMap<Party, u32>, name: &str, value: u32) {
    assert_eq!(r.get(&generic_party(name)).unwrap(), &value);
}
