use libapproportionment::Party;

pub const TRIANGLE_PARTIES: &[Party; 3] = &[
    Party {
        x: -0.8,
        y: -0.6,
        #[cfg(feature = "stv_party_discipline")]
        coalition: None,
    },
    Party {
        x: -0.2,
        y: -0.7,
        #[cfg(feature = "stv_party_discipline")]
        coalition: None,
    },
    Party {
        x: 0.0,
        y: -0.73,
        #[cfg(feature = "stv_party_discipline")]
        coalition: None,
    },
];

pub const PARTIES_8: &[Party; 8] = &[
    Party {
        x: -0.7,
        y: 0.7,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(3),
    },
    Party {
        x: 0.7,
        y: 0.7,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(0),
    },
    Party {
        x: 0.7,
        y: -0.7,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(1),
    },
    Party {
        x: -0.7,
        y: -0.7,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(2),
    },
    Party {
        x: -0.4,
        y: -0.6,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(2),
    },
    Party {
        x: 0.4,
        y: 0.6,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(0),
    },
    Party {
        x: -0.4,
        y: 0.5,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(3),
    },
    Party {
        x: 0.4,
        y: -0.5,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(1),
    },
];

pub const EXTRA_PARTIES: &[Party; 5] = &[
    Party {
        x: -0.9,
        y: 0.6,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(3),
    },
    Party {
        x: 0.8,
        y: 0.6,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(0),
    },
    Party {
        x: -0.8,
        y: -0.5,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(2),
    },
    Party {
        x: 0.8,
        y: -0.5,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(1),
    },
    Party {
        x: 0.0,
        y: -0.8,
        #[cfg(feature = "stv_party_discipline")]
        coalition: None,
    },
];


